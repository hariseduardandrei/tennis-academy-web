'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import MenuIcon from '@mui/icons-material/Menu';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import EventIcon from '@mui/icons-material/Event';
import { useAuth } from './AuthProvider';
import { useI18n } from '@/lib/i18n';
import { isAdmin, isStaff } from '@/lib/auth';

const DRAWER_WIDTH = 220;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const staffNav = [
    { label: t('nav.today'), icon: <TodayIcon />, href: '/today' },
    { label: t('nav.schedule'), icon: <CalendarMonthIcon />, href: '/schedule' },
    { label: t('nav.students'), icon: <PeopleIcon />, href: '/students' },
    ...(isAdmin(user?.role)
      ? [{ label: t('nav.billing'), icon: <PaymentIcon />, href: '/billing' }]
      : []),
  ];

  const studentNav = [
    { label: t('nav.home'), icon: <HomeIcon />, href: '/student' },
    { label: t('nav.mySchedule'), icon: <EventIcon />, href: '/student/schedule' },
    { label: t('nav.myHistory'), icon: <HistoryIcon />, href: '/student/history' },
  ];

  const navItems = isStaff(user?.role) ? staffNav : studentNav;

  const drawer = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Toolbar>
        <Typography variant="subtitle1" fontWeight={700} color="primary">
          🎾 Tennis Academy
        </Typography>
      </Toolbar>
      <Divider />
      <List dense>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              selected={pathname === item.href || pathname.startsWith(item.href + '/')}
              onClick={() => {
                router.push(item.href);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🎾 Tennis Academy
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Typography variant="caption">{user?.email}</Typography>
            </MenuItem>
            <Divider />
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
          p: 3,
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

