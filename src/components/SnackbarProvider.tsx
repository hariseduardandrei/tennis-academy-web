'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Severity = 'success' | 'error' | 'warning' | 'info';

interface SnackMsg {
  message: string;
  severity: Severity;
  key: number;
}

interface SnackbarContextValue {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<SnackMsg[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SnackMsg | null>(null);

  const show = useCallback((message: string, severity: Severity) => {
    setQueue((prev) => [...prev, { message, severity, key: Date.now() }]);
  }, []);

  React.useEffect(() => {
    if (!open && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [open, queue]);

  const handleClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSuccess: (m) => show(m, 'success'),
        showError: (m) => show(m, 'error'),
      }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        key={current?.key}
      >
        <Alert onClose={handleClose} severity={current?.severity ?? 'info'} sx={{ width: '100%' }}>
          {current?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be inside SnackbarProvider');
  return ctx;
}

