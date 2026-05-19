'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Paper from '@mui/material/Paper';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useReducedMotion } from 'framer-motion';
import 'dayjs/locale/ro';
import { sessionsApi } from '@/lib/api/sessions';
import { courtsApi } from '@/lib/api/courts';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import { PageHeader } from '@/components/PageHeader';
import { DensityToggle } from '@/components/DensityToggle';
import { EmptyState } from '@/components/EmptyState';
import { ScheduleCard } from '@/components/ScheduleCard';
import { SessionModal } from '@/features/schedule/SessionModal';
import { useDensityPreference } from '@/lib/ui/density';
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
  const headerHeight = isCompact ? 40 : 44;
  const timeColumnWidth = isCompact ? 56 : 60;
  const headerOffset = headerHeight + (isCompact ? 2 : 4);

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
                  <Paper
                    variant="outlined"
                    sx={{ display: 'flex', overflow: 'visible', p: 0.5, borderRadius: 4, position: 'relative' }}
                  >
                    {/* Time column */}
                    <Box
                      sx={{
                        width: timeColumnWidth,
                        flexShrink: 0,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        height: totalHeight,
                        pt: `${headerHeight}px`,
                        bgcolor: 'background.paper',
                      }}
                    >
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
                    <Box sx={{ display: 'flex', flex: 1, minWidth: 0, pl: 0.5 }}>
                    {courts.map((court, courtIndex) => {
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
                            overflow: 'visible',
                            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.3),
                          }}
                        >
                          <Box
                            sx={{
                              position: 'sticky',
                              top: 0,
                              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.94),
                              color: 'text.primary',
                              minHeight: `${headerHeight}px`,
                              display: 'flex',
                              alignItems: 'center',
                              pl: 2,
                              pr: 1.25,
                              py: 1,
                              zIndex: 2,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              backdropFilter: 'blur(10px)',
                              textAlign: 'left',
                              ...(courtIndex === 0 && { ml: 0.25 }),
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
                            const blockHeight = getHeight(sess.startAt, sess.endAt, slotHeight);
                            const showTitle = !!sess.title && blockHeight >= (isCompact ? 84 : 96);
                            const showActions = blockHeight >= (isCompact ? 118 : 132);
                            return (
                            <ScheduleCard
                              key={sess.id}
                              session={sess}
                              blockHeight={blockHeight}
                              top={getTopOffset(sess.startAt, slotHeight) + headerOffset}
                              isCompact={isCompact}
                              reduceMotion={reduceMotion}
                              showTitle={showTitle}
                              showActions={showActions}
                              coachLabel={t('today.coach')}
                              playersLabel={t('today.players')}
                              noPlayersLabel={t('today.noPlayers')}
                              completeLabel={t('today.complete')}
                              editLabel={t('common.edit')}
                              deleteLabel={t('common.delete')}
                              onComplete={() => router.push(`/sessions/${sess.id}/complete`)}
                              onEdit={() => {
                                setEditSession(sess);
                                setModalOpen(true);
                              }}
                              onDelete={() => setDeleteTarget(sess)}
                            />
                            );
                          })}
                        </Box>
                      );
                    })}
                    </Box>
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
