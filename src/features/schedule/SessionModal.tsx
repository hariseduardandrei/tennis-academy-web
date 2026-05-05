'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { sessionsApi } from '@/lib/api/sessions';
import { studentsApi } from '@/lib/api/students';
import { courtsApi } from '@/lib/api/courts';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import { ApiError } from '@/lib/api/client';
import type { SessionDto, CourtDto, StudentDto, SessionType } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'Europe/Bucharest';

const SESSION_TYPES: SessionType[] = ['TENNIS', 'FITNESS', 'MATCHPLAY'];

interface SessionModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialDate?: string; // YYYY-MM-DD
  session?: SessionDto | null;
}

export function SessionModal({ open, onClose, onSaved, initialDate, session }: SessionModalProps) {
  const { t } = useI18n();
  const { showSuccess, showError } = useSnackbar();

  const [courts, setCourts] = useState<CourtDto[]>([]);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<StudentDto[]>([]);

  const defaultDate = initialDate ?? dayjs().tz(TZ).format('YYYY-MM-DD');
  const [startAt, setStartAt] = useState(defaultDate + 'T09:00');
  const [endAt, setEndAt] = useState(defaultDate + 'T10:00');
  const [courtId, setCourtId] = useState<number>(1);
  const [staffUserId, setStaffUserId] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('TENNIS');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      courtsApi.list().then(setCourts);
      studentsApi.list({ status: 'ACTIVE' }).then(setStudents);
    }
  }, [open]);

  useEffect(() => {
    if (session) {
      setStartAt(dayjs(session.startAt).tz(TZ).format('YYYY-MM-DDTHH:mm'));
      setEndAt(dayjs(session.endAt).tz(TZ).format('YYYY-MM-DDTHH:mm'));
      setCourtId(session.court.id);
      setStaffUserId(session.staffUser.id);
      setSessionType(session.sessionType);
      setTitle(session.title ?? '');
      setSelectedStudents(
        session.students.map((s) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          status: 'ACTIVE',
          createdAt: '',
        })),
      );
    } else {
      setStartAt((initialDate ?? defaultDate) + 'T09:00');
      setEndAt((initialDate ?? defaultDate) + 'T10:00');
      setCourtId(1);
      setStaffUserId('');
      setSessionType('TENNIS');
      setTitle('');
      setSelectedStudents([]);
    }
    setError('');
  }, [session, open, initialDate, defaultDate]);

  const toUtc = (localStr: string) => dayjs.tz(localStr, TZ).toISOString();

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const studentIds = selectedStudents.map((s) => s.id);
      if (session) {
        await sessionsApi.patch(session.id, {
          startAt: toUtc(startAt),
          endAt: toUtc(endAt),
          courtId,
          staffUserId: staffUserId || undefined,
          sessionType,
          title: title || undefined,
        });
        await sessionsApi.replaceStudents(session.id, { studentIds });
      } else {
        const created = await sessionsApi.create({
          startAt: toUtc(startAt),
          endAt: toUtc(endAt),
          courtId,
          staffUserId,
          sessionType,
          title: title || undefined,
          studentIds,
        });
        if (studentIds.length > 0) {
          await sessionsApi.replaceStudents(created.id, { studentIds });
        }
      }
      showSuccess(t('schedule.saved'));
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const code = err.body.code;
        if (code === 'COURT_CONFLICT') setError(t('schedule.conflictCourt'));
        else if (code === 'STAFF_CONFLICT') setError(t('schedule.conflictStaff'));
        else if (code === 'STUDENT_CONFLICT') setError(t('schedule.conflictStudent'));
        else setError(err.message);
      } else {
        showError(t('common.error'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {session ? t('schedule.editSession') : t('schedule.createSession')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label={t('schedule.startAt')}
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label={t('schedule.endAt')}
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            select
            label={t('schedule.court')}
            value={courtId}
            onChange={(e) => setCourtId(Number(e.target.value))}
            fullWidth
          >
            {courts.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('schedule.staffUser')}
            value={staffUserId}
            onChange={(e) => setStaffUserId(e.target.value)}
            fullWidth
            helperText="Staff user ID (email lookup TODO when /users/staff is available)"
          />
          <TextField
            select
            label={t('schedule.type')}
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value as SessionType)}
            fullWidth
          >
            {SESSION_TYPES.map((st) => (
              <MenuItem key={st} value={st}>
                {t(`schedule.type.${st}` as any)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('schedule.title_field')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder={t('common.optional')}
          />

          <Autocomplete
            multiple
            options={students}
            getOptionLabel={(s) => `${s.firstName} ${s.lastName}`}
            value={selectedStudents}
            onChange={(_, v) => setSelectedStudents(v)}
            renderTags={(value, getTagProps) =>
              value.map((s, i) => (
                <Chip
                  key={s.id}
                  label={`${s.firstName} ${s.lastName}`}
                  size="small"
                  {...getTagProps({ index: i })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label={t('schedule.students')} />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

