'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import SportsTennisRoundedIcon from '@mui/icons-material/SportsTennisRounded';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { sessionsApi } from '@/lib/api/sessions';
import { courtsApi } from '@/lib/api/courts';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { fadeUpIn, motion } from '@/lib/ui/motion';
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
  const [loadError, setLoadError] = useState(false);

  const today = dayjs().tz(TZ).format('YYYY-MM-DD');

  const loadData = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    Promise.all([sessionsApi.listWeek(today), courtsApi.list()])
      .then(([s, c]) => {
        // Filter to today only
        const todaySessions = s.filter((sess) =>
          dayjs(sess.startAt).tz(TZ).format('YYYY-MM-DD') === today,
        );
        setSessions(todaySessions);
        setCourts(c);
      })
      .catch(() => {
        setLoadError(true);
        setSessions([]);
        setCourts([]);
      })
      .finally(() => setLoading(false));
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sessionsByCourt = (courtId: number) =>
    sessions
      .filter((s) => s.court.id === courtId)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  if (loading) {
    return (
      <Box>
        <PageHeader
          eyebrow={t('today.header.eyebrowLoading')}
          title={t('today.title')}
          description={t('today.header.descriptionLoading')}
          badge={dayjs().tz(TZ).format('D MMM')}
        />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={260} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box>
        <PageHeader
          eyebrow={t('today.header.eyebrow')}
          title={t('today.title')}
          description={t('today.header.description')}
          badge={dayjs().tz(TZ).format('dddd, D MMMM YYYY')}
        />
        <ErrorState
          title={t('common.error')}
          description={t('today.loadError')}
          onRetry={loadData}
          retryLabel={t('common.retry')}
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        eyebrow={t('today.header.eyebrow')}
        title={t('today.title')}
        description={t('today.header.description')}
        badge={dayjs().tz(TZ).format('dddd, D MMMM YYYY')}
      />
      <Grid container spacing={2}>
        {courts.map((court, courtIndex) => {
          const courtSessions = sessionsByCourt(court.id);
          return (
            <Grid item xs={12} sm={6} md={3} key={court.id} sx={fadeUpIn(courtIndex * motion.stagger.tight)}>
              <Card
                sx={{
                  minHeight: 280,
                  background: (theme) =>
                    `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04)} 100%)`,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="h6" color="primary.main">
                      {court.name}
                    </Typography>
                    <Chip label={t('today.sessionsCount', { count: courtSessions.length })} size="small" variant="outlined" />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {courtSessions.length === 0 ? (
                    <EmptyState title={t('today.noSessions')} description={t('today.emptyCourtDescription')} icon={<SportsTennisRoundedIcon color="primary" />} />
                  ) : (
                    courtSessions.map((sess, sessIndex) => (
                      <Box
                        key={sess.id}
                        sx={{
                          mb: 1.5,
                          p: 1.75,
                          borderRadius: 3,
                          bgcolor: (theme) => alpha(theme.palette.background.default, 0.72),
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: `transform ${motion.duration.fast}ms ${motion.easing.standard}, border-color ${motion.duration.fast}ms ${motion.easing.standard}, background-color ${motion.duration.fast}ms ${motion.easing.standard}`,
                          ...fadeUpIn(sessIndex * motion.stagger.tight),
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={700}>
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
                          <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                            {sess.title}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {sess.staffUser.email} · {sess.students.length} studenți
                        </Typography>
                        <CardActions sx={{ p: 0, mt: 1.5 }}>
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

