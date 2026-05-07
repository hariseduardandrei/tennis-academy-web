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
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import { motion as fm, useReducedMotion } from 'framer-motion';
import 'dayjs/locale/ro';
import { sessionsApi } from '@/lib/api/sessions';
import { courtsApi } from '@/lib/api/courts';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import { PageHeader } from '@/components/PageHeader';
import { DensityToggle } from '@/components/DensityToggle';
import { EmptyState } from '@/components/EmptyState';
import { SessionModal } from '@/features/schedule/SessionModal';
import { useDensityPreference } from '@/lib/ui/density';
import { getSessionTypeVisual, getStaffDisplayName, getVisibleStudentNames } from '@/lib/ui/sessionDisplay';
import type { SessionDto, CourtDto } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
const TZ = 'Europe/Bucharest';

const HOUR_START = 7;
const HOUR_END = 22;
const SLOT_HEIGHT_COMFORTABLE = 60;
const SLOT_HEIGHT_COMPACT = 48;

function getTopOffset(dateStr: string, slotHeight: number): number {
  const d = dayjs(dateStr).tz(TZ);
  const h = d.hour() + d.minute() / 60;
  return (h - HOUR_START) * slotHeight;
}

function getHeight(startStr: string, endStr: string, slotHeight: number): number {
  const start = dayjs(startStr).tz(TZ);
  const end = dayjs(endStr).tz(TZ);
  const diffH = end.diff(start, 'minute') / 60;
  return Math.max(diffH * slotHeight, 24);
}

export default function SchedulePage() {
  const { t } = useI18n();
  const { showSuccess, showError } = useSnackbar();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { density, setDensity } = useDensityPreference('comfortable');

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
  const slotHeight = density === 'compact' ? SLOT_HEIGHT_COMPACT : SLOT_HEIGHT_COMFORTABLE;
  const totalHeight = (HOUR_END - HOUR_START) * slotHeight;
  const isCompact = density === 'compact';
  const headerOffset = isCompact ? 20 : 22;

  return (
    <Box>
      <PageHeader
        eyebrow={t('schedule.header.eyebrow')}
        title={t('schedule.title')}
        description={t('schedule.header.description')}
        actions={(
          <>
            <DensityToggle density={density} onChange={setDensity} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CalendarTodayRoundedIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={700}>
                {weekStart.format('D MMM')} – {weekStart.add(6, 'day').format('D MMM YYYY')}
              </Typography>
            </Box>
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
          </>
        )}
      />

      <Paper sx={{ p: { xs: isCompact ? 1.5 : 2, md: isCompact ? 2 : 2.5 }, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {courts.map((court) => (
              <Chip key={court.id} label={court.name} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Day tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: isCompact ? 2 : 2.5, overflowX: 'auto', pb: 0.5 }}>
        {weekDays.map((d) => {
          const isToday = d.format('YYYY-MM-DD') === dayjs().tz(TZ).format('YYYY-MM-DD');
          return (
            <Chip
              key={d.format('YYYY-MM-DD')}
              label={d.format('ddd D')}
              color={isToday ? 'primary' : 'default'}
              variant={isToday ? 'filled' : 'outlined'}
              size="small"
              sx={{ minWidth: isCompact ? 64 : 72 }}
            />
          );
        })}
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={520} />
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, px: 0.5 }}>
                  <Typography variant="h6">
                    {day.format('dddd, D MMMM')}
                  </Typography>
                  {day.format('YYYY-MM-DD') === dayjs().tz(TZ).format('YYYY-MM-DD') && (
                    <Chip label={t('common.today')} size="small" color="primary" />
                  )}
                </Box>

                {!hasSessions ? (
                  <EmptyState title={t('today.noSessions')} description={t('schedule.emptyDayDescription')} icon={<EventBusyRoundedIcon color="primary" />} />
                ) : (
                  <Paper variant="outlined" sx={{ display: 'flex', overflow: 'hidden', p: 0.5, borderRadius: 4 }}>
                    {/* Time column */}
                    <Box sx={{ width: 54, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', position: 'relative', height: totalHeight, pt: 5 }}>
                      {timeLabels.map((h) => (
                        <Box
                          key={h}
                          sx={{
                            position: 'absolute',
                            top: (h - HOUR_START) * slotHeight + (isCompact ? 10 : 14),
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
                            minWidth: 180,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            height: totalHeight,
                            borderRadius: 3,
                            overflow: 'hidden',
                            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.3),
                          }}
                        >
                          <Box
                            sx={{
                              position: 'sticky',
                              top: 0,
                              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.94),
                              color: 'text.primary',
                              px: 1.25,
                              py: 1,
                              zIndex: 1,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <Typography variant="body2" fontWeight={700}>
                              {court.name}
                            </Typography>
                          </Box>

                          {/* Hour grid lines */}
                          {timeLabels.map((h) => (
                            <Box
                              key={h}
                              sx={{
                                position: 'absolute',
                                top: (h - HOUR_START) * slotHeight,
                                left: 0,
                                right: 0,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                opacity: 0.4,
                              }}
                            />
                          ))}

                          {/* Session blocks */}
                          {courtSessions.map((sess, sessIndex) => {
                            const { names: visibleStudentNames, hiddenCount } = getVisibleStudentNames(sess.students, 2);
                            const visual = getSessionTypeVisual(sess.sessionType);
                            const SessionTypeIcon = visual.icon;
                            return (
                            <Tooltip
                              key={sess.id}
                              title={(
                                <Box>
                                  <Typography variant="caption" fontWeight={700} display="block">
                                    {getStaffDisplayName(sess.staffUser)}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    {sess.students.map((student) => `${student.firstName} ${student.lastName}`).join(', ') || t('today.noPlayers')}
                                  </Typography>
                                </Box>
                              )}
                              placement="right"
                            >
                              <Box
                                component={fm.div}
                                initial={reduceMotion ? false : { opacity: 0, y: 7, scale: 0.99 }}
                                animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                                transition={reduceMotion ? undefined : { duration: 0.22, delay: sessIndex * 0.035 }}
                                whileHover={reduceMotion ? undefined : { y: -2 }}
                                sx={{
                                  position: 'absolute',
                                  top: getTopOffset(sess.startAt, slotHeight) + headerOffset,
                                  left: 4,
                                  right: 4,
                                  height: getHeight(sess.startAt, sess.endAt, slotHeight),
                                  backgroundImage: (theme) => visual.surface(theme),
                                  color: 'white',
                                  borderRadius: 2,
                                  px: isCompact ? 0.8 : 1,
                                  py: isCompact ? 0.6 : 0.75,
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  border: '1px solid',
                                  borderColor: (theme) => alpha(visual.color, theme.palette.mode === 'dark' ? 0.52 : 0.34),
                                  boxShadow: (theme) => `0 14px 24px ${visual.shadow(theme)}`,
                                  transition: 'transform 180ms ease, opacity 180ms ease, box-shadow 180ms ease',
                                  '&:hover': { opacity: 0.96 },
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 3,
                                    bgcolor: (theme) => visual.rail(theme),
                                  }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" fontWeight={800} display="block" noWrap>
                                    {dayjs(sess.startAt).tz(TZ).format('HH:mm')}–
                                    {dayjs(sess.endAt).tz(TZ).format('HH:mm')}
                                  </Typography>
                                  <SessionTypeIcon sx={{ fontSize: isCompact ? 13 : 14, opacity: 0.94 }} />
                                </Box>
                                {sess.title && (
                                  <Typography variant="caption" display="block" noWrap>
                                    {sess.title}
                                  </Typography>
                                )}
                                <Typography variant="caption" display="block" noWrap sx={{ opacity: 0.95, fontWeight: 600 }}>
                                  {getStaffDisplayName(sess.staffUser)}
                                </Typography>
                                <Typography variant="caption" display="block" noWrap sx={{ opacity: 0.9 }}>
                                  {visibleStudentNames.join(', ')}
                                  {hiddenCount > 0 ? ` +${hiddenCount}` : ''}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: isCompact ? 0.1 : 0.25 }}>
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
                            );
                          })}
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

