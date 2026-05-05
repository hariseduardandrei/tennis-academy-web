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
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import { portalApi } from '@/lib/api/portal';
import { useI18n } from '@/lib/i18n';
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5">{t('portal.mySchedule')}</Typography>
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
        <Skeleton variant="rounded" height={300} />
      ) : (
        weekDays.map((day) => {
          const dayStr = day.format('YYYY-MM-DD');
          const daySessions = sessions
            .filter((s) => dayjs(s.startAt).tz(TZ).format('YYYY-MM-DD') === dayStr)
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
          return (
            <Box key={dayStr} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 0.5 }}>
                {day.format('dddd, D MMMM')}
              </Typography>
              {daySessions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                  {t('today.noSessions')}
                </Typography>
              ) : (
                daySessions.map((sess) => (
                  <Card key={sess.sessionId} sx={{ mb: 1 }}>
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
                        <Chip label={sess.sessionType} size="small" />
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

