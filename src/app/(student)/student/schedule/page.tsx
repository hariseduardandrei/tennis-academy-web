'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import { portalApi } from '@/lib/api/portal';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { fadeUpIn, motion } from '@/lib/ui/motion';
import type { MyScheduleSessionResponse } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
const TZ = 'Europe/Bucharest';

export default function StudentSchedulePage() {
  const { t } = useI18n();
  const [weekStart, setWeekStart] = useState(() => dayjs().tz(TZ).startOf('isoWeek'));
  const [sessions, setSessions] = useState<MyScheduleSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    portalApi
      .getScheduleWeek(weekStart.format('YYYY-MM-DD'))
      .then((res) => setSessions(res.sessions))
      .finally(() => setLoading(false));
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  return (
    <Box>
      <PageHeader
        eyebrow={t('portal.schedule.eyebrow')}
        title={t('portal.mySchedule')}
        description={t('portal.schedule.description')}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <IconButton onClick={() => setWeekStart((w) => w.subtract(1, 'week'))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="body1" fontWeight={600}>
            {weekStart.format('D MMM')} – {weekStart.add(6, 'day').format('D MMM YYYY')}
          </Typography>
          <IconButton onClick={() => setWeekStart((w) => w.add(1, 'week'))}>
            <ChevronRightIcon />
          </IconButton>
          <Button size="small" onClick={() => setWeekStart(dayjs().tz(TZ).startOf('isoWeek'))}>
            {t('common.today')}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={340} />
      ) : (
        weekDays.map((day, dayIndex) => {
          const dayStr = day.format('YYYY-MM-DD');
          const daySessions = sessions
            .filter((s) => dayjs(s.startAt).tz(TZ).format('YYYY-MM-DD') === dayStr)
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
          return (
            <Box key={dayStr} sx={{ mb: 2, ...fadeUpIn(dayIndex * motion.stagger.tight) }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 0.5 }}>
                {day.format('dddd, D MMMM')}
              </Typography>
              {daySessions.length === 0 ? (
                <EmptyState title={t('today.noSessions')} description={t('portal.schedule.emptyDayDescription')} icon={<EventBusyRoundedIcon color="primary" />} />
              ) : (
                daySessions.map((sess, sessIndex) => (
                  <Card
                    key={sess.sessionId}
                    sx={{
                      mb: 1,
                      background: (theme) =>
                        `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04)} 100%)`,
                      ...fadeUpIn(sessIndex * motion.stagger.tight),
                    }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {dayjs(sess.startAt).tz(TZ).format('HH:mm')}–
                            {dayjs(sess.endAt).tz(TZ).format('HH:mm')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {sess.courtName} · {sess.staffName}
                          </Typography>
                          {sess.title && <Typography variant="caption">{sess.title}</Typography>}
                        </Box>
                        <Chip label={sess.sessionType} size="small" color="primary" variant="outlined" />
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}

