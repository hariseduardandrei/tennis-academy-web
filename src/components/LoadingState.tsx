'use client';

import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingStateProps {
  title: string;
  description?: string;
  fullScreen?: boolean;
}

export function LoadingState({ title, description, fullScreen = false }: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: fullScreen ? '100vh' : 220,
        px: 3,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={34} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: description ? 0.5 : 0 }}>{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        )}
      </Box>
    </Box>
  );
}

