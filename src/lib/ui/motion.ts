import type { SxProps, Theme } from '@mui/material/styles';

export const motion = {
  easing: {
    standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
    entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  duration: {
    fast: 180,
    normal: 260,
    slow: 420,
  },
  stagger: {
    tight: 32,
    normal: 48,
  },
};

export function fadeUpIn(delayMs = 0): SxProps<Theme> {
  return {
    animation: `${motion.duration.normal}ms ${motion.easing.entrance} ${delayMs}ms 1 both fadeUpIn`,
    '@keyframes fadeUpIn': {
      '0%': { opacity: 0, transform: 'translate3d(0, 8px, 0)' },
      '100%': { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: 'none',
    },
  };
}

export function motionSafeTransition(value: string): SxProps<Theme> {
  return {
    transition: value,
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  };
}

