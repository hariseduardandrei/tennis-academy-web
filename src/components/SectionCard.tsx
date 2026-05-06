'use client';

import React from 'react';
import Paper from '@mui/material/Paper';
import type { PaperProps } from '@mui/material/Paper';
import { motion } from '@/lib/ui/motion';

export function SectionCard(props: PaperProps) {
  return (
    <Paper
      elevation={0}
      {...props}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        background: (theme) => theme.palette.background.paper,
        transition: `transform ${motion.duration.fast}ms ${motion.easing.standard}, box-shadow ${motion.duration.normal}ms ${motion.easing.standard}, border-color ${motion.duration.fast}ms ${motion.easing.standard}`,
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: (theme) => theme.shadows[4],
        },
        ...props.sx,
      }}
    />
  );
}




