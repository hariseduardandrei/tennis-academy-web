'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { alpha, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import SportsTennisRoundedIcon from '@mui/icons-material/SportsTennisRounded';
import { useAuth } from './AuthProvider';
import { useI18n } from '@/lib/i18n';
import { isAdmin, isStaff } from '@/lib/auth';
import { useColorMode } from './Providers';

const DRAWER_WIDTH = 280;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const { mode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [headerVisible, setHeaderVisible] = useState(true);

  const staffNav = [
    { label: t('nav.today'), icon: <TodayRoundedIcon />, href: '/today' },
    { label: t('nav.schedule'), icon: <CalendarMonthRoundedIcon />, href: '/schedule' },
    { label: t('nav.students'), icon: <PeopleRoundedIcon />, href: '/students' },
    ...(isAdmin(user?.role)
      ? [
          { label: t('nav.billing'), icon: <PaymentsRoundedIcon />, href: '/billing' },
          { label: t('nav.staffUsers'), icon: <SupervisorAccountRoundedIcon />, href: '/users' },
        ]
      : []),
  ];

  const studentNav = [
    { label: t('nav.home'), icon: <HomeRoundedIcon />, href: '/student' },
    { label: t('nav.mySchedule'), icon: <EventRoundedIcon />, href: '/student/schedule' },
    { label: t('nav.myHistory'), icon: <HistoryRoundedIcon />, href: '/student/history' },
  ];

  const navItems = isStaff(user?.role) ? staffNav : studentNav;

  const roleLabel = user?.role ? user.role.replace('_', ' ') : 'Guest';

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;

        if (y < 72) {
          setHeaderVisible(true);
        } else if (delta > 8) {
          setHeaderVisible(false);
        } else if (delta < -8) {
          setHeaderVisible(true);
        }

        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const drawer = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: 'common.white',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: `0 14px 30px ${alpha(theme.palette.primary.main, 0.28)}`,
            }}
          >
            <SportsTennisRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>Tennis Academy</Typography>
            <Typography variant="caption" color="text.secondary">{t('layout.tagline')}</Typography>
          </Box>
        </Box>
      </Toolbar>
      <Box sx={{ px: 2.5, pb: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {t('layout.workspace')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 0.5 }}>{user?.email}</Typography>
          <Chip label={roleLabel} color="primary" size="small" variant="outlined" />
        </Box>
      </Box>
      <Divider sx={{ mx: 2.5 }} />
      <List dense sx={{ px: 1.5, py: 2, gap: 0.75, display: 'grid' }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              selected={pathname === item.href || pathname.startsWith(item.href + '/')}
              sx={{
                minHeight: 50,
                borderRadius: 3,
                mx: 0.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.14),
                  color: 'text.primary',
                },
              }}
              onClick={() => {
                router.push(item.href);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 650 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2.5, pt: 0 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {t('layout.designMode')}
          </Typography>
          <Typography variant="body2">
            {mode === 'dark' ? t('layout.mode.darkDescription') : t('layout.mode.lightDescription')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        color="transparent"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.72 : 0.76),
          transition: 'transform 220ms ease, opacity 220ms ease',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-110%)',
          opacity: headerVisible ? 1 : 0.96,
        }}
      >
        <Toolbar sx={{ minHeight: 76, px: { xs: 2, md: 3 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 1.5, display: { md: 'none' } }}
            aria-label="Open navigation"
          >
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {isStaff(user?.role) ? t('layout.header.staffTitle') : t('layout.header.studentTitle')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {isStaff(user?.role) ? t('layout.header.staffSubtitle') : t('layout.header.studentSubtitle')}
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 1.5 }}>
            {navItems.slice(0, 3).map((item) => (
              <Chip
                key={item.href}
                label={item.label}
                variant={pathname === item.href || pathname.startsWith(item.href + '/') ? 'filled' : 'outlined'}
                color={pathname === item.href || pathname.startsWith(item.href + '/') ? 'primary' : 'default'}
                onClick={() => router.push(item.href)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
          <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 1 }} aria-label="Toggle color mode">
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit" aria-label="Open profile menu">
            <Avatar sx={{ width: 38, height: 38, bgcolor: 'secondary.main', fontSize: 14, boxShadow: theme.shadows[3] }}>
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>{t('layout.signedInAs')}</Typography>
                <Typography variant="body2">{user?.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                toggleColorMode();
                setAnchorEl(null);
              }}
            >
              {mode === 'dark' ? t('layout.mode.lightAction') : t('layout.mode.darkAction')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setLocale(locale === 'ro' ? 'en' : 'ro');
                setAnchorEl(null);
              }}
            >
              {locale === 'ro' ? '🇬🇧 English' : '🇷🇴 Română'}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logout();
              }}
            >
              {t('nav.logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar - permanent on desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Sidebar - temporary on mobile */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          pt: { xs: '92px', md: '100px' },
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at 10% 0%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 28%), radial-gradient(circle at 100% 0%, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 24%)`,
          }}
        />
        <Box
          key={pathname}
          sx={{
            position: 'relative',
            zIndex: 1,
            animation: 'pageEnter 260ms cubic-bezier(0.22, 1, 0.36, 1)',
            '@keyframes pageEnter': {
              '0%': { opacity: 0, transform: 'translate3d(0, 10px, 0) scale(0.995)' },
              '100%': { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

