'use client';

import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { motion } from '@/lib/ui/motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        minHeight: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: (theme) =>
          `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
        transition: `transform ${motion.duration.fast}ms ${motion.easing.standard}, box-shadow ${motion.duration.normal}ms ${motion.easing.standard}`,
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ maxWidth: 460 }}>
        <Box sx={{ mb: 2, fontSize: 28, lineHeight: 1, display: 'grid', placeItems: 'center' }}>
          {icon ?? <AutoAwesomeRoundedIcon color="primary" />}
        </Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mb: action ? 2.5 : 0 }}>
            {description}
          </Typography>
        )}
        {action}
      </Box>
    </Paper>
  );
}




