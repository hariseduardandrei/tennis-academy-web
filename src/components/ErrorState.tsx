'use client';

import React from 'react';
import Button from '@mui/material/Button';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { EmptyState } from './EmptyState';

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, description, onRetry, retryLabel = 'Retry' }: ErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<WarningAmberRoundedIcon color="warning" />}
      action={onRetry ? <Button variant="outlined" onClick={onRetry}>{retryLabel}</Button> : undefined}
    />
  );
}

