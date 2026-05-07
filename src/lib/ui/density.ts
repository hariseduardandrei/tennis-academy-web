'use client';

import { useCallback, useEffect, useState } from 'react';

export type DensityMode = 'compact' | 'comfortable';

const DENSITY_STORAGE_KEY = 'ta_staff_density';

export function useDensityPreference(initial: DensityMode = 'comfortable') {
  const [density, setDensityState] = useState<DensityMode>(initial);

  useEffect(() => {
    const stored = localStorage.getItem(DENSITY_STORAGE_KEY);
    if (stored === 'compact' || stored === 'comfortable') {
      setDensityState(stored);
    }
  }, []);

  const setDensity = useCallback((next: DensityMode) => {
    setDensityState(next);
    localStorage.setItem(DENSITY_STORAGE_KEY, next);
  }, []);

  return { density, setDensity };
}

