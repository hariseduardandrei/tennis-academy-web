'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string;
}

export function PageHeader({ eyebrow, title, description, actions, badge }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        mb: 3,
      }}
    >
      <Box sx={{ maxWidth: 760 }}>
        {eyebrow && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontWeight: 800,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Typography variant="h3">{title}</Typography>
          {badge && <Chip label={badge} size="small" color="primary" variant="outlined" />}
        </Box>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.25, maxWidth: 680 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            '& > *': {
              transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
            },
            '& > *:hover': {
              transform: 'translateY(-1px)',
            },
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}




