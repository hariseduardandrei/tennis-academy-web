'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { studentsApi } from '@/lib/api/students';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { SectionCard } from '@/components/SectionCard';
import { fadeUpIn, motion } from '@/lib/ui/motion';
import type { StudentDto, StudentStatus } from '@/lib/api/types';

export default function StudentsPage() {
  const { t } = useI18n();
  const { showSuccess, showError } = useSnackbar();
  const router = useRouter();

  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [status, setStatus] = useState<StudentStatus>('ACTIVE');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    studentsApi
      .list({ status: statusFilter === 'ALL' ? undefined : statusFilter, search: search || undefined })
      .then(setStudents)
      .finally(() => setLoading(false));
  }, [statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await studentsApi.create({ firstName, lastName, phone: phone || undefined, dateOfBirth: dob || undefined, status });
      showSuccess(t('students.saved'));
      setCreateOpen(false);
      setFirstName(''); setLastName(''); setPhone(''); setDob('');
      load();
    } catch {
      showError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader
        eyebrow={t('students.header.eyebrow')}
        title={t('students.title')}
        description={t('students.header.description')}
        actions={(
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            {t('students.createStudent')}
          </Button>
        )}
      />

      <SectionCard sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: '1 1 240px', minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup
          size="small"
          value={statusFilter}
          exclusive
          onChange={(_, v) => { if (v) setStatusFilter(v); }}
        >
          <ToggleButton value="ALL">{t('students.filterAll')}</ToggleButton>
          <ToggleButton value="ACTIVE">{t('students.filterActive')}</ToggleButton>
          <ToggleButton value="INACTIVE">{t('students.filterInactive')}</ToggleButton>
        </ToggleButtonGroup>
        </Box>
      </SectionCard>

      {loading ? (
        <Skeleton variant="rounded" height={360} />
      ) : students.length === 0 ? (
        <EmptyState title={t('students.noResults')} description={t('students.emptyDescription')} icon={<PeopleRoundedIcon color="primary" />} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('students.lastName')}</TableCell>
                <TableCell>{t('students.firstName')}</TableCell>
                <TableCell>{t('students.phone')}</TableCell>
                <TableCell>{t('students.status')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, idx) => (
                <TableRow key={s.id} hover sx={fadeUpIn(idx * motion.stagger.tight)}>
                  <TableCell>{s.lastName}</TableCell>
                  <TableCell>{s.firstName}</TableCell>
                  <TableCell>{s.phone ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`students.status.${s.status}` as any)}
                      size="small"
                      color={s.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => router.push(`/students/${s.id}`)}>
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('students.createStudent')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label={t('students.firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} required fullWidth />
            <TextField label={t('students.lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} required fullWidth />
            <TextField label={t('students.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            <TextField label={t('students.dob')} type="date" value={dob} onChange={(e) => setDob(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField select label={t('students.status')} value={status} onChange={(e) => setStatus(e.target.value as StudentStatus)} fullWidth>
              <MenuItem value="ACTIVE">{t('students.status.ACTIVE')}</MenuItem>
              <MenuItem value="INACTIVE">{t('students.status.INACTIVE')}</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !firstName || !lastName}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

