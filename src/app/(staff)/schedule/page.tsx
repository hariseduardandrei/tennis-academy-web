'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Paper from '@mui/material/Paper';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/ro';
import { sessionsApi } from '@/lib/api/sessions';
import { courtsApi } from '@/lib/api/courts';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import { SessionModal } from '@/features/schedule/SessionModal';
import type { SessionDto, CourtDto } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
const TZ = 'Europe/Bucharest';

const HOUR_START = 7;
const HOUR_END = 22;
const SLOT_HEIGHT = 60; // px per hour

const SESSION_TYPE_COLORS: Record<string, string> = {
  TENNIS: '#2E7D32',
  FITNESS: '#1565C0',
  MATCHPLAY: '#E65100',
};

function getTopOffset(dateStr: string): number {
  const d = dayjs(dateStr).tz(TZ);
  const h = d.hour() + d.minute() / 60;
  return (h - HOUR_START) * SLOT_HEIGHT;
}

function getHeight(startStr: string, endStr: string): number {
  const start = dayjs(startStr).tz(TZ);
  const end = dayjs(endStr).tz(TZ);
  const diffH = end.diff(start, 'minute') / 60;
  return Math.max(diffH * SLOT_HEIGHT, 24);
}

export default function SchedulePage() {
  const { t } = useI18n();
  const { showSuccess, showError } = useSnackbar();
  const router = useRouter();

  const [weekStart, setWeekStart] = useState<dayjs.Dayjs>(() =>
    dayjs().tz(TZ).startOf('isoWeek'),
  );
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [courts, setCourts] = useState<CourtDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState<SessionDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SessionDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        sessionsApi.listWeek(weekStart.format('YYYY-MM-DD')),
        courts.length ? Promise.resolve(courts) : courtsApi.list(),
      ]);
      setSessions(s);
      if (courts.length === 0) setCourts(c);
    } finally {
      setLoading(false);
    }
  }, [weekStart, courts]);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  useEffect(() => {
    courtsApi.list().then(setCourts);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await sessionsApi.delete(deleteTarget.id);
      showSuccess(t('schedule.deleted'));
      setDeleteTarget(null);
      loadSessions();
    } catch {
      showError(t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  const timeLabels = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const totalHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5">{t('schedule.title')}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setWeekStart((w) => w.subtract(1, 'week'))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="body1" fontWeight={600}>
            {weekStart.format('D MMM')} – {weekStart.add(6, 'day').format('D MMM YYYY')}
          </Typography>
          <IconButton onClick={() => setWeekStart((w) => w.add(1, 'week'))}>
            <ChevronRightIcon />
          </IconButton>
          <Button
            size="small"
            onClick={() => setWeekStart(dayjs().tz(TZ).startOf('isoWeek'))}
          >
            {t('common.today')}
          </Button>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditSession(null);
              setModalOpen(true);
            }}
          >
            {t('schedule.createSession')}
          </Button>
        </Box>
      </Box>

      {/* Day tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto' }}>
        {weekDays.map((d) => {
          const isToday = d.format('YYYY-MM-DD') === dayjs().tz(TZ).format('YYYY-MM-DD');
          return (
            <Chip
              key={d.format('YYYY-MM-DD')}
              label={d.format('ddd D')}
              color={isToday ? 'primary' : 'default'}
              variant={isToday ? 'filled' : 'outlined'}
              size="small"
            />
          );
        })}
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={400} />
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          {weekDays.map((day) => {
            const dayStr = day.format('YYYY-MM-DD');
            const daySessions = sessions.filter(
              (s) => dayjs(s.startAt).tz(TZ).format('YYYY-MM-DD') === dayStr,
            );
            const hasSessions = daySessions.length > 0;

            return (
              <Box key={dayStr} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  {day.format('dddd, D MMMM')}
                  {day.format('YYYY-MM-DD') === dayjs().tz(TZ).format('YYYY-MM-DD') && (
                    <Chip label={t('common.today')} size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </Typography>

                {!hasSessions ? (
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                    {t('today.noSessions')}
                  </Typography>
                ) : (
                  <Paper variant="outlined" sx={{ display: 'flex', overflow: 'hidden' }}>
                    {/* Time column */}
                    <Box sx={{ width: 50, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', position: 'relative', height: totalHeight }}>
                      {timeLabels.map((h) => (
                        <Box
                          key={h}
                          sx={{
                            position: 'absolute',
                            top: (h - HOUR_START) * SLOT_HEIGHT - 8,
                            left: 0,
                            width: '100%',
                            textAlign: 'right',
                            pr: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {h}:00
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Court columns */}
                    {courts.map((court) => {
                      const courtSessions = daySessions.filter((s) => s.court.id === court.id);
                      return (
                        <Box
                          key={court.id}
                          sx={{
                            flex: 1,
                            minWidth: 150,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            height: totalHeight,
                          }}
                        >
                          <Box
                            sx={{
                              position: 'sticky',
                              top: 0,
                              bgcolor: 'primary.main',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              zIndex: 1,
                            }}
                          >
                            <Typography variant="caption" fontWeight={700}>
                              {court.name}
                            </Typography>
                          </Box>

                          {/* Hour grid lines */}
                          {timeLabels.map((h) => (
                            <Box
                              key={h}
                              sx={{
                                position: 'absolute',
                                top: (h - HOUR_START) * SLOT_HEIGHT,
                                left: 0,
                                right: 0,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                opacity: 0.4,
                              }}
                            />
                          ))}

                          {/* Session blocks */}
                          {courtSessions.map((sess) => (
                            <Tooltip
                              key={sess.id}
                              title={`${sess.staffUser.email} · ${sess.students.length} studenți`}
                              placement="right"
                            >
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: getTopOffset(sess.startAt) + 22, // offset for header
                                  left: 4,
                                  right: 4,
                                  height: getHeight(sess.startAt, sess.endAt),
                                  bgcolor: SESSION_TYPE_COLORS[sess.sessionType] ?? '#607D8B',
                                  color: 'white',
                                  borderRadius: 1,
                                  px: 0.75,
                                  py: 0.25,
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.85 },
                                }}
                              >
                                <Typography variant="caption" fontWeight={700} display="block" noWrap>
                                  {dayjs(sess.startAt).tz(TZ).format('HH:mm')}–
                                  {dayjs(sess.endAt).tz(TZ).format('HH:mm')}
                                </Typography>
                                {sess.title && (
                                  <Typography variant="caption" display="block" noWrap>
                                    {sess.title}
                                  </Typography>
                                )}
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                                  <Tooltip title={t('today.complete')}>
                                    <IconButton
                                      size="small"
                                      sx={{ color: 'white', p: 0.25 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/sessions/${sess.id}/complete`);
                                      }}
                                    >
                                      <CheckCircleIcon fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t('common.edit')}>
                                    <IconButton
                                      size="small"
                                      sx={{ color: 'white', p: 0.25 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditSession(sess);
                                        setModalOpen(true);
                                      }}
                                    >
                                      <EditIcon fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t('common.delete')}>
                                    <IconButton
                                      size="small"
                                      sx={{ color: 'white', p: 0.25 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteTarget(sess);
                                      }}
                                    >
                                      <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Tooltip>
                          ))}
                        </Box>
                      );
                    })}
                  </Paper>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Create/Edit modal */}
      <SessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadSessions}
        initialDate={weekStart.format('YYYY-MM-DD')}
        session={editSession}
      />

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs">
        <DialogTitle>{t('schedule.deleteSession')}</DialogTitle>
        <DialogContent>
          <Typography>{t('schedule.confirmDelete')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

