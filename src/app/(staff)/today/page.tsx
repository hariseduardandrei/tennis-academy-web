'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import SportsTennisRoundedIcon from '@mui/icons-material/SportsTennisRounded';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useReducedMotion } from 'framer-motion';
import { sessionsApi } from '@/lib/api/sessions';
import { courtsApi } from '@/lib/api/courts';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { DensityToggle } from '@/components/DensityToggle';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SessionCard } from '@/components/SessionCard';
import { fadeUpIn, motion } from '@/lib/ui/motion';
import { useDensityPreference } from '@/lib/ui/density';
import type { SessionDto, CourtDto } from '@/lib/api/types';
import Stack from '@mui/material/Stack';

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'Europe/Bucharest';

export default function TodayPage() {
  const { t } = useI18n();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { density, setDensity } = useDensityPreference('comfortable');
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

  const isCompact = density === 'compact';

  if (loading) {
    return (
      <Box>
        <PageHeader
          eyebrow={t('today.header.eyebrowLoading')}
          title={t('today.title')}
          description={t('today.header.descriptionLoading')}
          badge={dayjs().tz(TZ).format('D MMM')}
          actions={<DensityToggle density={density} onChange={setDensity} />}
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
          actions={<DensityToggle density={density} onChange={setDensity} />}
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
        actions={<DensityToggle density={density} onChange={setDensity} />}
      />
      <Grid container spacing={2}>
        {courts.map((court, courtIndex) => {
          const courtSessions = sessionsByCourt(court.id);
          return (
            <Grid item xs={12} sm={6} md={3} key={court.id} sx={fadeUpIn(courtIndex * motion.stagger.tight)}>
              <Card
                sx={{
                  minHeight: 320,
                  borderRadius: 6,
                  p: 0,
                  overflow: 'visible',
                  background: (theme) =>
                    `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.10 : 0.06)} 100%)`,
                  boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.10)}`,
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid',
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
                  position: 'relative',
                  transition: 'box-shadow 220ms cubic-bezier(0.22,1,0.36,1), border-color 220ms cubic-bezier(0.22,1,0.36,1)',
                  '&:hover': {
                    boxShadow: (theme) => `0 16px 48px ${alpha(theme.palette.primary.main, 0.18)}`,
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.32),
                  },
                }}
              >
                {/* Rail accent, outside content, with glow */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -8,
                    top: 24,
                    bottom: 24,
                    width: 7,
                    borderRadius: 8,
                    background: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.success.main, 0.82)} 0%, ${alpha(theme.palette.success.light, 0.38)} 100%)`,
                    boxShadow: (theme) => `0 0 16px 2px ${alpha(theme.palette.success.main, 0.22)}`,
                    zIndex: 2,
                  }}
                />
                <CardContent sx={{ p: isCompact ? 2 : 2.8, pt: isCompact ? 2.2 : 3.2, pb: isCompact ? 2.2 : 3.2, position: 'relative', zIndex: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '-0.5px', fontSize: isCompact ? '1.08rem' : '1.18rem', lineHeight: 1 }}>
                      {court.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      <Chip label={t('today.sessionsCount', { count: courtSessions.length })} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2.2 }} />
                  {courtSessions.length === 0 ? (
                    <EmptyState title={t('today.noSessions')} description={t('today.emptyCourtDescription')} icon={<SportsTennisRoundedIcon color="primary" />} />
                  ) : (
                    <Stack spacing={isCompact ? 1.25 : 1.75}>
                       {courtSessions.map((sess, sessIndex) => (
                         <SessionCard
                           key={sess.id}
                           session={sess}
                           onComplete={() => router.push(`/sessions/${sess.id}/complete`)}
                           completeLabel={t('today.complete')}
                           coachLabel={t('today.coach')}
                           playersLabel={t('today.players')}
                           noPlayersLabel={t('today.noPlayers')}
                           compact={isCompact}
                           index={sessIndex}
                           reduceMotion={reduceMotion ?? false}
                         />
                       ))}
                     </Stack>
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

