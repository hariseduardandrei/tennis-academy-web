'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import BlockIcon from '@mui/icons-material/Block';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import dayjs from 'dayjs';
import { billingApi } from '@/lib/api/billing';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import type { BillingStudentRow, MembershipStatus } from '@/lib/api/types';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const STATUS_COLOR: Record<MembershipStatus, 'success' | 'error' | 'default'> = {
  PAID: 'success',
  DUE: 'error',
  WAIVED: 'default',
};

export default function BillingPage() {
  const { t } = useI18n();
  const { showSuccess, showError } = useSnackbar();

  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [tab, setTab] = useState(0); // 0=month, 1=overdue
  const [rows, setRows] = useState<BillingStudentRow[]>([]);
  const [overdueRows, setOverdueRows] = useState<BillingStudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const res = await billingApi.getMonth(year, month);
        setRows(res);
      } else {
        const res = await billingApi.getOverdue(year, month);
        setOverdueRows(res);
      }
    } finally {
      setLoading(false);
    }
  }, [tab, year, month]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (row: BillingStudentRow, status: MembershipStatus) => {
    try {
      await billingApi.patchStudentMonth(row.studentId, year, month, { status });
      showSuccess(t('billing.saved'));
      load();
    } catch {
      showError(t('common.error'));
    }
  };

  const displayRows = tab === 0 ? rows : overdueRows;
  const safeRows = displayRows ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5">{t('billing.title')}</Typography>
        <TextField
          select
          label={t('billing.year')}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          size="small"
          sx={{ width: 100 }}
        >
          {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
        <TextField
          select
          label={t('billing.month')}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          size="small"
          sx={{ width: 120 }}
        >
          {MONTHS.map((m) => (
            <MenuItem key={m} value={m}>
              {dayjs(`2024-${String(m).padStart(2, '0')}-01`).format('MMMM')}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={t('billing.title')} />
        <Tab label={t('billing.overdueTitle')} icon={<WarningAmberIcon />} iconPosition="start" />
      </Tabs>

      {loading ? (
        <Skeleton variant="rounded" height={300} />
      ) : safeRows.length === 0 ? (
        <Typography color="text.secondary">{t('common.noData')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('billing.student')}</TableCell>
                <TableCell>{t('billing.status')}</TableCell>
                <TableCell>{t('billing.amount')}</TableCell>
                <TableCell>{t('billing.dueDate')}</TableCell>
                <TableCell>{t('billing.paidAt')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeRows.map((row) => (
                <TableRow key={row.studentId} hover>
                  <TableCell>
                    {row.firstName} {row.lastName}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`billing.status.${row.status}` as any)}
                      size="small"
                      color={STATUS_COLOR[row.status]}
                    />
                  </TableCell>
                  <TableCell>{row.amount ? `${row.amount} RON` : '—'}</TableCell>
                  <TableCell>
                    {row.dueDate ? dayjs(row.dueDate).format('D MMM YYYY') : '—'}
                  </TableCell>
                  <TableCell>
                    {row.paidAt ? dayjs(row.paidAt).format('D MMM YYYY HH:mm') : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      {row.status !== 'PAID' && (
                        <IconButton
                          size="small"
                          color="success"
                          title={t('billing.markPaid')}
                          onClick={() => updateStatus(row, 'PAID')}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                      {row.status !== 'DUE' && (
                        <IconButton
                          size="small"
                          color="error"
                          title={t('billing.markDue')}
                          onClick={() => updateStatus(row, 'DUE')}
                        >
                          <RadioButtonUncheckedIcon fontSize="small" />
                        </IconButton>
                      )}
                      {row.status !== 'WAIVED' && (
                        <IconButton
                          size="small"
                          title={t('billing.markWaived')}
                          onClick={() => updateStatus(row, 'WAIVED')}
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

