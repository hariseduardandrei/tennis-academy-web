'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { sessionsApi } from '@/lib/api/sessions';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import type { SessionMetricItem, AttendanceStatus, CompleteSessionItemRequest } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'Europe/Bucharest';

const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT'];

interface StudentRow extends CompleteSessionItemRequest {
  firstName: string;
  lastName: string;
}

export default function CompleteSessionPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { showSuccess, showError } = useSnackbar();
  const router = useRouter();

  const [rows, setRows] = useState<StudentRow[]>([]);
  const [sessionInfo, setSessionInfo] = useState<{ startAt: string; endAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sessionsApi.getMetrics(id).then((metrics) => {
      setSessionInfo(null); // session info comes separately if needed
      const defaultDuration =
        metrics.items[0]?.durationMinutes ?? 60;
      setRows(
        metrics.items.map((item: SessionMetricItem) => ({
          studentId: item.studentId,
          firstName: item.firstName,
          lastName: item.lastName,
          attendanceStatus: item.attendanceStatus ?? 'PRESENT',
          durationMinutes: item.durationMinutes ?? defaultDuration,
          rpe: item.rpe ?? undefined,
          internalNotes: item.internalNotes ?? '',
          studentNotes: item.studentNotes ?? '',
        })),
      );
      setLoading(false);
    }).catch(() => {
      showError(t('common.error'));
      setLoading(false);
    });
  }, [id, showError, t]);

  const update = <K extends keyof StudentRow>(idx: number, field: K, value: StudentRow[K]) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await sessionsApi.complete(id, {
        items: rows.map((r) => ({
          studentId: r.studentId,
          attendanceStatus: r.attendanceStatus,
          durationMinutes: r.durationMinutes,
          rpe: r.rpe,
          internalNotes: r.internalNotes,
          studentNotes: r.studentNotes,
        })),
      });
      showSuccess(t('complete.saved'));
      router.back();
    } catch {
      showError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton height={40} width={300} />
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={120} sx={{ my: 1 }} />)}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          {t('common.back')}
        </Button>
        <Typography variant="h5">{t('complete.title')}</Typography>
      </Box>

      {rows.length === 0 ? (
        <Typography color="text.secondary">{t('complete.noStudents')}</Typography>
      ) : (
        rows.map((row, idx) => (
          <Paper key={row.studentId} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {row.firstName} {row.lastName}
              </Typography>
              {row.rpe && row.durationMinutes && (
                <Chip
                  label={`Load: ${row.durationMinutes * row.rpe}`}
                  size="small"
                  color="info"
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                select
                label={t('complete.attendance')}
                value={row.attendanceStatus}
                onChange={(e) => update(idx, 'attendanceStatus', e.target.value as AttendanceStatus)}
                sx={{ minWidth: 140 }}
              >
                {ATTENDANCE_OPTIONS.map((a) => (
                  <MenuItem key={a} value={a}>
                    {t(`complete.${a.toLowerCase()}` as any)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label={t('complete.duration')}
                type="number"
                value={row.durationMinutes ?? ''}
                onChange={(e) => update(idx, 'durationMinutes', Number(e.target.value))}
                inputProps={{ min: 1, max: 240 }}
                sx={{ width: 120 }}
              />

              <TextField
                label={t('complete.rpe')}
                type="number"
                value={row.rpe ?? ''}
                onChange={(e) => update(idx, 'rpe', e.target.value ? Number(e.target.value) : undefined)}
                inputProps={{ min: 1, max: 10 }}
                sx={{ width: 100 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label={t('complete.studentNotes')}
                value={row.studentNotes ?? ''}
                onChange={(e) => update(idx, 'studentNotes', e.target.value)}
                multiline
                rows={2}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label={t('complete.internalNotes')}
                value={row.internalNotes ?? ''}
                onChange={(e) => update(idx, 'internalNotes', e.target.value)}
                multiline
                rows={2}
                sx={{ flex: 1, minWidth: 200 }}
                color="warning"
                helperText="Staff-only"
              />
            </Box>
          </Paper>
        ))
      )}

      {rows.length > 0 && (
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ mt: 1 }}
        >
          {t('complete.save')}
        </Button>
      )}
    </Box>
  );
}

