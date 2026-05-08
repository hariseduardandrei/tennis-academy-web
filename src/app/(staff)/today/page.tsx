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
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import SportsTennisRoundedIcon from '@mui/icons-material/SportsTennisRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { motion as fm, useReducedMotion } from 'framer-motion';
import { sessionsApi } from '@/lib/api/sessions';
import { courtsApi } from '@/lib/api/courts';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { DensityToggle } from '@/components/DensityToggle';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { fadeUpIn, motion } from '@/lib/ui/motion';
import { useDensityPreference } from '@/lib/ui/density';
import { getSessionTypeVisual, getStaffDisplayName } from '@/lib/ui/sessionDisplay';
import type { SessionDto, CourtDto } from '@/lib/api/types';

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
                    courtSessions.map((sess, sessIndex) => {
                      const visual = getSessionTypeVisual(sess.sessionType);
                      const SessionTypeIcon = visual.icon;
                      return (
                        <Box
                          component={fm.div}
                          key={sess.id}
                          initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
                          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                          transition={reduceMotion ? undefined : { duration: 0.26, delay: sessIndex * 0.045 }}
                          whileHover={reduceMotion ? undefined : { y: -3 }}
                          sx={{
                            position: 'relative',
                            mb: isCompact ? 1.25 : 1.75,
                            p: isCompact ? 1.5 : 2,
                            borderRadius: 4,
                            bgcolor: (theme) => alpha(theme.palette.background.default, 0.58),
                            backgroundImage: (theme) => visual.surface(theme),
                            border: '1px solid',
                            borderColor: (theme) => alpha(visual.color, theme.palette.mode === 'dark' ? 0.38 : 0.26),
                            boxShadow: (theme) => `0 18px 34px ${visual.shadow(theme)}`,
                            backdropFilter: 'blur(8px)',
                            transition: `transform ${motion.duration.fast}ms ${motion.easing.standard}, border-color ${motion.duration.fast}ms ${motion.easing.standard}, box-shadow ${motion.duration.fast}ms ${motion.easing.standard}`,
                            ...fadeUpIn(sessIndex * motion.stagger.tight),
                            '&:hover': {
                              borderColor: (theme) => alpha(visual.color, theme.palette.mode === 'dark' ? 0.58 : 0.42),
                              boxShadow: (theme) => `0 24px 42px ${visual.shadow(theme)}`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 4,
                              borderTopLeftRadius: 16,
                              borderBottomLeftRadius: 16,
                              bgcolor: (theme) => visual.rail(theme),
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={800}>
                              {dayjs(sess.startAt).tz(TZ).format('HH:mm')}–
                              {dayjs(sess.endAt).tz(TZ).format('HH:mm')}
                            </Typography>
                            <Chip
                              label={t(`schedule.type.${sess.sessionType}` as any)}
                              size="small"
                              icon={<SessionTypeIcon sx={{ fontSize: isCompact ? 13 : 14 }} />}
                              sx={{
                                color: 'text.primary',
                                bgcolor: (theme) => alpha(visual.color, theme.palette.mode === 'dark' ? 0.28 : 0.16),
                                border: '1px solid',
                                borderColor: (theme) => alpha(visual.color, theme.palette.mode === 'dark' ? 0.45 : 0.24),
                              }}
                            />
                          </Box>

                          {sess.title && (
                            <Typography variant={isCompact ? 'caption' : 'body2'} fontWeight={700} sx={{ mb: isCompact ? 0.8 : 1.25 }}>
                              {sess.title}
                            </Typography>
                          )}

                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: isCompact ? 0.75 : 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18) }}>
                              <PersonRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" color="text.secondary">{t('today.coach')}</Typography>
                              <Typography variant={isCompact ? 'caption' : 'body2'} fontWeight={700}>{getStaffDisplayName(sess.staffUser)}</Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: isCompact ? 0.8 : 1.25 }}>
                            <Avatar sx={{ width: 24, height: 24, mt: 0.25, bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16) }}>
                              <GroupRoundedIcon sx={{ fontSize: 14, color: 'secondary.main' }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">{t('today.players')}</Typography>
                              {sess.students.length === 0 ? (
                                <Typography variant={isCompact ? 'caption' : 'body2'} fontWeight={700} sx={{ display: 'block' }}>
                                  {t('today.noPlayers')}
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.4 }}>
                                  {sess.students.slice(0, 6).map((student) => (
                                    <Box
                                      key={student.id}
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        px: 0.75,
                                        py: 0.2,
                                        borderRadius: 6,
                                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.10),
                                        border: '1px solid',
                                        borderColor: (theme) => alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.28 : 0.20),
                                        transition: 'background-color 150ms ease, border-color 150ms ease',
                                        '&:hover': {
                                          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
                                          borderColor: (theme) => alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.42 : 0.34),
                                        },
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 16,
                                          height: 16,
                                          fontSize: '0.55rem',
                                          fontWeight: 800,
                                          bgcolor: (theme) => alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.55 : 0.45),
                                        }}
                                      >
                                        {(student.firstName[0] ?? '').toUpperCase()}{(student.lastName[0] ?? '').toUpperCase()}
                                      </Avatar>
                                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
                                        {student.firstName} {student.lastName}
                                      </Typography>
                                    </Box>
                                  ))}
                                  {sess.students.length > 6 && (
                                    <Box
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        px: 0.75,
                                        py: 0.2,
                                        borderRadius: 6,
                                        bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
                                        border: '1px solid',
                                        borderColor: 'divider',
                                      }}
                                    >
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                        +{sess.students.length - 6}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Stack>


                          <CardActions sx={{ p: 0, mt: isCompact ? 0.6 : 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => router.push(`/sessions/${sess.id}/complete`)}
                            >
                              {t('today.complete')}
                            </Button>
                          </CardActions>
                        </Box>
                      );
                    })
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

