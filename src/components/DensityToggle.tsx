'use client';

import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded';
import DensitySmallRoundedIcon from '@mui/icons-material/DensitySmallRounded';
import { alpha } from '@mui/material/styles';
import { useI18n } from '@/lib/i18n';
import type { DensityMode } from '@/lib/ui/density';

interface DensityToggleProps {
  density: DensityMode;
  onChange: (density: DensityMode) => void;
}

export function DensityToggle({ density, onChange }: DensityToggleProps) {
  const { t } = useI18n();

  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      exclusive
      value={density}
      onChange={(_, value: DensityMode | null) => {
        if (value) onChange(value);
      }}
      aria-label={t('common.density')}
      sx={{
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        borderRadius: 3,
      }}
    >
      <ToggleButton value="comfortable" aria-label={t('common.comfortable')}>
        <Tooltip title={t('common.comfortable')}>
          <ViewAgendaRoundedIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="compact" aria-label={t('common.compact')}>
        <Tooltip title={t('common.compact')}>
          <DensitySmallRoundedIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

