'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { studentsApi } from '@/lib/api/students';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useAuth } from '@/components/AuthProvider';
import { isAdmin } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import type { StudentDto, StudentStatus } from '@/lib/api/types';

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { showSuccess, showError } = useSnackbar();
  const { user } = useAuth();
  const router = useRouter();

  const [student, setStudent] = useState<StudentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accountDialog, setAccountDialog] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  // Edit form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [status, setStatus] = useState<StudentStatus>('ACTIVE');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    studentsApi.get(id).then((s) => {
      setStudent(s);
      setFirstName(s.firstName);
      setLastName(s.lastName);
      setPhone(s.phone ?? '');
      setDob(s.dateOfBirth ?? '');
      setStatus(s.status);
      setNotes(s.notes ?? '');
      setLoading(false);
    }).catch(() => {
      showError(t('common.error'));
      setLoading(false);
    });
  }, [id, showError, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await studentsApi.patch(id, {
        firstName, lastName,
        phone: phone || undefined,
        dateOfBirth: dob || undefined,
        status,
        notes: notes || undefined,
      });
      setStudent(updated);
      setEditing(false);
      showSuccess(t('students.saved'));
    } catch {
      showError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const res = await studentsApi.createAccount(id);
      setTempPassword(res.temporaryPassword);
      setAccountDialog(true);
      // Refresh to show userId
      const updated = await studentsApi.get(id);
      setStudent(updated);
    } catch {
      showError(t('common.error'));
    }
  };

  if (loading) return <Skeleton variant="rounded" height={400} />;
  if (!student) return <Typography color="error">{t('common.error')}</Typography>;

  return (
    <Box>
      <PageHeader
        eyebrow={t('students.profile.eyebrow')}
        title={`${student.firstName} ${student.lastName}`}
        description={t('students.profile.description')}
        badge={t(`students.status.${student.status}` as any)}
        actions={(
          <>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
              {t('common.back')}
            </Button>
            {!editing && (
              <Button variant="outlined" onClick={() => setEditing(true)}>
                {t('common.edit')}
              </Button>
            )}
            {isAdmin(user?.role) && !student.userId && (
              <Button variant="contained" color="secondary" onClick={handleCreateAccount}>
                {t('students.createAccount')}
              </Button>
            )}
          </>
        )}
      />

      <SectionCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label={t('students.firstName')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={!editing}
            sx={{ flex: 1, minWidth: 160 }}
          />
          <TextField
            label={t('students.lastName')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={!editing}
            sx={{ flex: 1, minWidth: 160 }}
          />
          <TextField
            label={t('students.phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!editing}
            sx={{ flex: 1, minWidth: 160 }}
          />
          <TextField
            label={t('students.dob')}
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            disabled={!editing}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: 160 }}
          />
          <TextField
            select
            label={t('students.status')}
            value={status}
            onChange={(e) => setStatus(e.target.value as StudentStatus)}
            disabled={!editing}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="ACTIVE">{t('students.status.ACTIVE')}</MenuItem>
            <MenuItem value="INACTIVE">{t('students.status.INACTIVE')}</MenuItem>
          </TextField>
        </Box>
        <TextField
          label={t('students.notes')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!editing}
          multiline
          rows={3}
          fullWidth
          sx={{ mt: 2 }}
        />
        {editing && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {t('common.save')}
            </Button>
            <Button onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
          </Box>
        )}
      </SectionCard>

      {/* Account created dialog */}
      <Dialog open={accountDialog} onClose={() => setAccountDialog(false)}>
        <DialogTitle>{t('students.createAccount')}</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 1 }}>
            {t('students.accountCreated')}
          </Alert>
          <Typography variant="h4" fontWeight={700}>{tempPassword}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('students.passwordOnceHint')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountDialog(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

