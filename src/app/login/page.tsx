'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import { useAuth } from '@/components/AuthProvider';
import { useI18n } from '@/lib/i18n';
import { isStudent } from '@/lib/auth';
import { ApiError } from '@/lib/api/client';
import { fadeUpIn, motion } from '@/lib/ui/motion';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // AuthProvider sets user; determine redirect
      const raw = localStorage.getItem('ta_user');
      const user = raw ? JSON.parse(raw) : null;
      if (isStudent(user?.role)) router.replace('/student');
      else router.replace('/today');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('auth.loginError'));
      } else {
        setError(t('auth.serviceError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: (theme) =>
            `radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.24)} 0%, transparent 24%), radial-gradient(circle at bottom right, ${alpha(theme.palette.secondary.main, 0.22)} 0%, transparent 20%)`,
          pointerEvents: 'none',
        }}
      />
      <Card
        sx={{
          width: '100%',
          maxWidth: 1120,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          animation: 'loginShellEnter 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          '@keyframes loginShellEnter': {
            '0%': { opacity: 0, transform: 'translate3d(0, 18px, 0) scale(0.985)' },
            '100%': { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            background: (theme) =>
              `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12)} 0%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08)} 100%)`,
            borderRight: { md: (theme) => `1px solid ${theme.palette.divider}` },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: { md: 620 },
            animation: 'panelFadeIn 520ms cubic-bezier(0.22, 1, 0.36, 1)',
            '@keyframes panelFadeIn': {
              '0%': { opacity: 0, transform: 'translate3d(-10px, 0, 0)' },
              '100%': { opacity: 1, transform: 'translate3d(0, 0, 0)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          <Box>
            <Chip label={t('login.premiumBadge')} color="primary" variant="outlined" sx={{ mb: 3 }} />
            <Typography variant="h2" sx={{ maxWidth: 520, mb: 2 }}>
              {t('login.heroTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
              {t('login.heroDescription')}
            </Typography>
          </Box>

          <Stack spacing={2.5} sx={{ mt: 5 }}>
            {[
              t('login.feature.schedule'),
              t('login.feature.completion'),
              t('login.feature.portal'),
            ].map((item, idx) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ...fadeUpIn(idx * motion.stagger.normal) }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: (theme) => `0 0 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                  }}
                />
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <CardContent
          sx={{
            p: { xs: 3, md: 5 },
            display: 'flex',
            alignItems: 'center',
            animation: 'panelSlideIn 620ms cubic-bezier(0.22, 1, 0.36, 1)',
            '@keyframes panelSlideIn': {
              '0%': { opacity: 0, transform: 'translate3d(10px, 0, 0)' },
              '100%': { opacity: 1, transform: 'translate3d(0, 0, 0)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ color: 'primary.main', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800 }}>
                {t('login.signInEyebrow')}
              </Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>{t('auth.welcome')}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {t('login.signInDescription')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                fullWidth
              />
              <TextField
                label={t('auth.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ mt: 1, minHeight: 50 }}
              >
                {loading ? t('auth.loggingIn') : t('auth.loginBtn')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

