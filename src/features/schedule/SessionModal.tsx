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
import { usersApi } from '@/lib/api/users';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import { ApiError } from '@/lib/api/client';
import type { SessionDto, CourtDto, StudentDto, SessionType, StaffUserDto } from '@/lib/api/types';

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
  const [staffUsers, setStaffUsers] = useState<StaffUserDto[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffUnavailable, setStaffUnavailable] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<StudentDto[]>([]);

  const defaultDate = initialDate ?? dayjs().tz(TZ).format('YYYY-MM-DD');
  const [startAt, setStartAt] = useState(defaultDate + 'T09:00');
  const [endAt, setEndAt] = useState(defaultDate + 'T10:00');
  const [courtId, setCourtId] = useState<number>(1);
  const [selectedStaff, setSelectedStaff] = useState<StaffUserDto | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>('TENNIS');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const getStaffLabel = (staff: StaffUserDto) => {
    const fullName = [staff.firstName, staff.lastName].filter(Boolean).join(' ').trim();
    return fullName || staff.email;
  };

  useEffect(() => {
    if (open) {
      courtsApi.list().then(setCourts);
      studentsApi.list({ status: 'ACTIVE' }).then(setStudents);
      setStaffLoading(true);
      setStaffUnavailable(false);
      usersApi
        .listStaff()
        .then(setStaffUsers)
        .catch(() => {
          setStaffUsers([]);
          setStaffUnavailable(true);
        })
        .finally(() => setStaffLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (session) {
      setStartAt(dayjs(session.startAt).tz(TZ).format('YYYY-MM-DDTHH:mm'));
      setEndAt(dayjs(session.endAt).tz(TZ).format('YYYY-MM-DDTHH:mm'));
      setCourtId(session.court.id);
      setSelectedStaff({
        id: session.staffUser.id,
        email: session.staffUser.email,
        firstName: undefined,
        lastName: undefined,
        role: 'COACH',
        language: 'RO',
      });
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
      setSelectedStaff(null);
      setSessionType('TENNIS');
      setTitle('');
      setSelectedStudents([]);
    }
    setError('');
  }, [session, open, initialDate, defaultDate]);

  useEffect(() => {
    if (!open || !session || staffUsers.length === 0) return;
    const matchedStaff = staffUsers.find((s) => s.id === session.staffUser.id) ?? null;
    if (matchedStaff) {
      setSelectedStaff(matchedStaff);
    }
  }, [open, session, staffUsers]);

  const toUtc = (localStr: string) => dayjs.tz(localStr, TZ).toISOString();

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const studentIds = selectedStudents.map((s) => s.id);
      if (!selectedStaff) {
        setError(t('schedule.staffRequired'));
        return;
      }

      if (session) {
        await sessionsApi.patch(session.id, {
          startAt: toUtc(startAt),
          endAt: toUtc(endAt),
          courtId,
          staffUserId: selectedStaff.id,
          sessionType,
          title: title || undefined,
        });
        await sessionsApi.replaceStudents(session.id, { studentIds });
      } else {
        const created = await sessionsApi.create({
          startAt: toUtc(startAt),
          endAt: toUtc(endAt),
          courtId,
          staffUserId: selectedStaff.id,
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
          <Autocomplete
            options={staffUsers}
            loading={staffLoading}
            value={selectedStaff}
            onChange={(_, value) => setSelectedStaff(value)}
            getOptionLabel={getStaffLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options, state) => {
              const query = state.inputValue.trim().toLowerCase();
              if (!query) return options;
              return options.filter((staff) => {
                const fullName = `${staff.firstName ?? ''} ${staff.lastName ?? ''}`.toLowerCase();
                return fullName.includes(query) || staff.email.toLowerCase().includes(query);
              });
            }}
            noOptionsText={t('schedule.staffNoResults')}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                {getStaffLabel(option)}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('schedule.staffUser')}
                placeholder={t('schedule.staffSearchPlaceholder')}
                helperText={staffUnavailable ? t('schedule.staffLookupUnavailable') : undefined}
                error={staffUnavailable}
              />
            )}
            fullWidth
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
              value.map((s, i) => {
                const { key, ...tagProps } = getTagProps({ index: i });
                return (
                  <Chip
                    key={key}
                    label={`${s.firstName} ${s.lastName}`}
                    size="small"
                    {...tagProps}
                  />
                );
              })
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
          disabled={saving || !selectedStaff}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

