'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { portalApi } from '@/lib/api/portal';
import { useI18n } from '@/lib/i18n';
import type { MyScheduleSessionResponse } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'Europe/Bucharest';

export default function StudentHomePage() {
  const { t } = useI18n();
  const [upcoming, setUpcoming] = useState<MyScheduleSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = dayjs().tz(TZ).startOf('isoWeek').format('YYYY-MM-DD');
    portalApi
      .getScheduleWeek(today)
      .then((res) => {
        // Show future sessions (next 7 days)
        const now = dayjs().tz(TZ);
        const future = res.sessions
          .filter((s) => dayjs(s.startAt).tz(TZ).isAfter(now))
          .slice(0, 5);
        setUpcoming(future);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('portal.title')}
      </Typography>

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        {t('portal.upcoming')}
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={200} />
      ) : upcoming.length === 0 ? (
        <Typography color="text.secondary">{t('portal.noUpcoming')}</Typography>
      ) : (
        upcoming.map((sess) => (
          <Card key={sess.sessionId} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {dayjs(sess.startAt).tz(TZ).format('dddd, D MMM · HH:mm')}–
                    {dayjs(sess.endAt).tz(TZ).format('HH:mm')}
                  </Typography>
                  {sess.title && <Typography variant="body2">{sess.title}</Typography>}
                  <Typography variant="body2" color="text.secondary">
                    {t('portal.court')}: {sess.courtName} · {t('portal.coach')}: {sess.staffName}
                  </Typography>
                </Box>
                <Chip label={sess.sessionType} size="small" />
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

