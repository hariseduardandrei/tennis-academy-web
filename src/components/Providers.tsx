'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { alpha, ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nProvider } from '@/lib/i18n';
import { SnackbarProvider } from './SnackbarProvider';
import { AuthProvider } from './AuthProvider';

type ColorMode = 'light' | 'dark';

interface ColorModeContextValue {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

function buildTheme(mode: ColorMode) {
  const isDark = mode === 'dark';
  const primaryMain = isDark ? '#7CFFB2' : '#1D8E5A';
  const secondaryMain = isDark ? '#9AA6FF' : '#5B6CFF';
  const backgroundDefault = isDark ? '#09111C' : '#F6F8FC';
  const backgroundPaper = isDark ? '#0F1726' : '#FFFFFF';
  const textPrimary = isDark ? '#F5F7FB' : '#0F172A';
  const textSecondary = isDark ? '#AAB7CA' : '#526077';
  const borderColor = isDark ? alpha('#E6ECFF', 0.1) : alpha('#0F172A', 0.08);
  const softShadow = isDark
    ? '0 24px 80px rgba(2, 8, 23, 0.44)'
    : '0 24px 64px rgba(15, 23, 42, 0.08)';

  return createTheme({
    palette: {
      mode,
      primary: { main: primaryMain, light: isDark ? '#A7FFD0' : '#4CBF88', dark: isDark ? '#4DD88E' : '#136943' },
      secondary: { main: secondaryMain, light: isDark ? '#B8C0FF' : '#7B89FF', dark: isDark ? '#7182FF' : '#4052EF' },
      success: { main: isDark ? '#4ADE80' : '#15803D' },
      warning: { main: isDark ? '#FBBF24' : '#B45309' },
      error: { main: isDark ? '#FF7B8A' : '#DC365C' },
      background: { default: backgroundDefault, paper: backgroundPaper },
      text: { primary: textPrimary, secondary: textSecondary },
      divider: borderColor,
    },
    spacing: 8,
    shape: { borderRadius: 20 },
    typography: {
      fontFamily: 'var(--font-body), "Inter", "Segoe UI", sans-serif',
      h1: {
        fontFamily: 'var(--font-display), var(--font-body), sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(2.75rem, 4vw, 4.5rem)',
        lineHeight: 1,
        letterSpacing: '-0.04em',
      },
      h2: {
        fontFamily: 'var(--font-display), var(--font-body), sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(2.1rem, 3vw, 3.2rem)',
        lineHeight: 1.05,
        letterSpacing: '-0.035em',
      },
      h3: {
        fontFamily: 'var(--font-display), var(--font-body), sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(1.7rem, 2vw, 2.25rem)',
        lineHeight: 1.12,
        letterSpacing: '-0.03em',
      },
      h4: {
        fontFamily: 'var(--font-display), var(--font-body), sans-serif',
        fontWeight: 700,
        fontSize: '1.55rem',
        lineHeight: 1.15,
        letterSpacing: '-0.025em',
      },
      h5: {
        fontFamily: 'var(--font-display), var(--font-body), sans-serif',
        fontWeight: 700,
        fontSize: '1.25rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h6: {
        fontWeight: 650,
        fontSize: '1rem',
        lineHeight: 1.25,
        letterSpacing: '-0.015em',
      },
      body1: { fontSize: '0.975rem', lineHeight: 1.7, letterSpacing: '-0.01em' },
      body2: { fontSize: '0.875rem', lineHeight: 1.65, letterSpacing: '-0.01em' },
      caption: { fontSize: '0.76rem', lineHeight: 1.55, letterSpacing: '0.01em' },
      button: { fontWeight: 650, letterSpacing: '-0.01em', textTransform: 'none' },
    },
    shadows: [
      'none',
      '0 2px 8px rgba(15,23,42,0.03)',
      '0 6px 16px rgba(15,23,42,0.05)',
      '0 10px 24px rgba(15,23,42,0.08)',
      '0 16px 36px rgba(15,23,42,0.1)',
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
      softShadow,
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          html: {
            scrollBehavior: 'smooth',
          },
          body: {
            backgroundColor: backgroundDefault,
            backgroundImage: isDark
              ? 'radial-gradient(circle at top left, rgba(124,255,178,0.10), transparent 26%), radial-gradient(circle at top right, rgba(91,108,255,0.16), transparent 24%), linear-gradient(180deg, #09111C 0%, #0B1421 100%)'
              : 'radial-gradient(circle at top left, rgba(91,108,255,0.08), transparent 22%), radial-gradient(circle at top right, rgba(29,142,90,0.10), transparent 24%), linear-gradient(180deg, #F8FAFF 0%, #F3F7FC 100%)',
            minHeight: '100vh',
          },
          '*': {
            boxSizing: 'border-box',
          },
          '*::-webkit-scrollbar': {
            width: 10,
            height: 10,
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(isDark ? '#DDE7F5' : '#0F172A', 0.16),
            borderRadius: 999,
            border: `2px solid ${backgroundDefault}`,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(18px)',
            backgroundImage: 'none',
            borderBottom: `1px solid ${borderColor}`,
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: `1px solid ${borderColor}`,
            backgroundColor: alpha(backgroundPaper, isDark ? 0.82 : 0.76),
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${borderColor}`,
          },
          rounded: {
            borderRadius: 24,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 28,
            border: `1px solid ${borderColor}`,
            backgroundColor: alpha(backgroundPaper, isDark ? 0.82 : 0.92),
            backdropFilter: 'blur(16px)',
            boxShadow: softShadow,
            transition: 'transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 14,
            paddingInline: 18,
            transition: 'transform 160ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          },
          contained: {
            boxShadow: `0 10px 30px ${alpha(primaryMain, 0.26)}`,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 16px 38px ${alpha(primaryMain, 0.32)}`,
            },
          },
          outlined: {
            borderColor: borderColor,
            '&:hover': {
              borderColor: alpha(primaryMain, 0.4),
              backgroundColor: alpha(primaryMain, 0.06),
            },
          },
          text: {
            '&:hover': {
              backgroundColor: alpha(primaryMain, 0.06),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            transition: 'transform 160ms ease, background-color 180ms ease, color 180ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              backgroundColor: alpha(primaryMain, 0.08),
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: alpha(backgroundPaper, isDark ? 0.7 : 0.86),
            transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease, transform 160ms ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(primaryMain, 0.42),
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 4px ${alpha(primaryMain, 0.14)}`,
              transform: 'translateY(-1px)',
            },
          },
          notchedOutline: {
            borderColor: borderColor,
          },
          input: {
            paddingTop: 14,
            paddingBottom: 14,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: 999,
          },
          filled: {
            boxShadow: `inset 0 0 0 1px ${alpha('#FFFFFF', isDark ? 0.04 : 0.14)}`,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${borderColor}`,
            boxShadow: softShadow,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              color: textSecondary,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${borderColor}`,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 28,
            border: `1px solid ${borderColor}`,
            backgroundColor: alpha(backgroundPaper, isDark ? 0.9 : 0.98),
            backdropFilter: 'blur(20px)',
            boxShadow: softShadow,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 999,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(isDark ? '#0F172A' : '#111827', 0.92),
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            transform: 'none',
            borderRadius: 20,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: `1px solid ${borderColor}`,
          },
        },
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>('light');

  useEffect(() => {
    const stored = localStorage.getItem('ta_color_mode') as ColorMode | null;
    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(prefersDark ? 'dark' : 'light');
  }, []);

  const value = useMemo<ColorModeContextValue>(() => ({
    mode,
    toggleColorMode: () => {
      setMode((prev) => {
        const next = prev === 'light' ? 'dark' : 'light';
        localStorage.setItem('ta_color_mode', next);
        return next;
      });
    },
  }), [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <I18nProvider>
          <SnackbarProvider>
            <AuthProvider>{children}</AuthProvider>
          </SnackbarProvider>
        </I18nProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used inside Providers');
  return ctx;
}

