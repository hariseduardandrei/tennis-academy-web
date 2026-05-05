'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { sessionsApi } from '@/lib/api/sessions';
import { courtsApi } from '@/lib/api/courts';
import { useI18n } from '@/lib/i18n';
import type { SessionDto, CourtDto } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'Europe/Bucharest';

const SESSION_TYPE_COLORS: Record<string, 'success' | 'info' | 'warning'> = {
  TENNIS: 'success',
  FITNESS: 'info',
  MATCHPLAY: 'warning',
};

export default function TodayPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [courts, setCourts] = useState<CourtDto[]>([]);
  const [loading, setLoading] = useState(true);

  const today = dayjs().tz(TZ).format('YYYY-MM-DD');

  useEffect(() => {
    Promise.all([sessionsApi.listWeek(today), courtsApi.list()])
      .then(([s, c]) => {
        // Filter to today only
        const todaySessions = s.filter((sess) =>
          dayjs(sess.startAt).tz(TZ).format('YYYY-MM-DD') === today,
        );
        setSessions(todaySessions);
        setCourts(c);
      })
      .finally(() => setLoading(false));
  }, [today]);

  const sessionsByCourt = (courtId: number) =>
    sessions
      .filter((s) => s.court.id === courtId)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>{t('today.title')}</Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('today.title')} — {dayjs().tz(TZ).format('dddd, D MMMM YYYY')}
      </Typography>
      <Grid container spacing={2}>
        {courts.map((court) => {
          const courtSessions = sessionsByCourt(court.id);
          return (
            <Grid item xs={12} sm={6} md={3} key={court.id}>
              <Card sx={{ minHeight: 200 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom>
                    {court.name}
                  </Typography>
                  {courtSessions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('today.noSessions')}
                    </Typography>
                  ) : (
                    courtSessions.map((sess) => (
                      <Box
                        key={sess.id}
                        sx={{
                          mb: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {dayjs(sess.startAt).tz(TZ).format('HH:mm')}–
                            {dayjs(sess.endAt).tz(TZ).format('HH:mm')}
                          </Typography>
                          <Chip
                            label={t(`schedule.type.${sess.sessionType}` as any)}
                            size="small"
                            color={SESSION_TYPE_COLORS[sess.sessionType] ?? 'default'}
                          />
                        </Box>
                        {sess.title && (
                          <Typography variant="caption" display="block">
                            {sess.title}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {sess.staffUser.email} · {sess.students.length} studenți
                        </Typography>
                        <CardActions sx={{ p: 0, mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => router.push(`/sessions/${sess.id}/complete`)}
                          >
                            {t('today.complete')}
                          </Button>
                        </CardActions>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

