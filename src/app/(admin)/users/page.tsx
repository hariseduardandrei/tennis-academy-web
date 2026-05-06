'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { ApiError } from '@/lib/api/client';
import { usersApi } from '@/lib/api/users';
import { useI18n } from '@/lib/i18n';
import { useSnackbar } from '@/components/SnackbarProvider';
import type { CreateStaffUserRequest, StaffUserDto } from '@/lib/api/types';

const ROLES: Array<'ADMIN' | 'COACH' | 'TRAINER'> = ['ADMIN', 'COACH', 'TRAINER'];
const LANGUAGES: Array<'ro' | 'en'> = ['ro', 'en'];

export default function UsersPage() {
  const { t } = useI18n();
  const { showSuccess, showError } = useSnackbar();

  const getRoleLabel = (role: 'ADMIN' | 'COACH' | 'TRAINER') => t(`users.staff.role.${role}` as const);

  const [users, setUsers] = useState<StaffUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [listUnavailable, setListUnavailable] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createPayload, setCreatePayload] = useState<CreateStaffUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'COACH',
    language: 'ro',
  });
  const [creating, setCreating] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUserDto | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'COACH' | 'TRAINER'>('COACH');
  const [editLanguage, setEditLanguage] = useState<'ro' | 'en'>('ro');
  const [updating, setUpdating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setListUnavailable(false);
    try {
      const staff = await usersApi.listStaff();
      setUsers(staff);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
        setListUnavailable(true);
        setUsers([]);
      } else {
        showError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  }, [showError, t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await usersApi.createStaff(createPayload);
      showSuccess(t('users.staff.created'));
      setCreateOpen(false);
      setCreatePayload({ firstName: '', lastName: '', email: '', password: '', role: 'COACH', language: 'ro' });
      await loadUsers();
    } catch {
      showError(t('common.error'));
    } finally {
      setCreating(false);
    }
  };

  const openEditDialog = (u: StaffUserDto) => {
    setEditingUser(u);
    setEditFirstName(u.firstName ?? '');
    setEditLastName(u.lastName ?? '');
    setEditRole(u.role);
    setEditLanguage((u.language?.toLowerCase() === 'en' ? 'en' : 'ro') as 'ro' | 'en');
    setEditOpen(true);
  };

  const handlePatch = async () => {
    if (!editingUser) return;
    setUpdating(true);
    try {
      await usersApi.patchStaff(editingUser.id, {
        firstName: editFirstName,
        lastName: editLastName,
        role: editRole,
        language: editLanguage,
      });
      showSuccess(t('users.staff.updated'));
      setEditOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
        showError(t('users.staff.updateNotAvailable'));
      } else {
        showError(t('common.error'));
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h5">{t('users.staff.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ ml: 'auto' }} onClick={() => setCreateOpen(true)}>
          {t('users.staff.add')}
        </Button>
      </Box>

      {listUnavailable && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('users.staff.listNotAvailable')}
        </Alert>
      )}

      {loading ? (
        <Skeleton variant="rounded" height={280} />
      ) : users.length === 0 ? (
        <Typography color="text.secondary">{t('common.noData')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('users.staff.firstName')}</TableCell>
                <TableCell>{t('users.staff.lastName')}</TableCell>
                <TableCell>{t('auth.email')}</TableCell>
                <TableCell>{t('users.staff.role')}</TableCell>
                <TableCell>{t('nav.language')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.firstName ?? '-'}</TableCell>
                  <TableCell>{u.lastName ?? '-'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={getRoleLabel(u.role)} size="small" color={u.role === 'ADMIN' ? 'secondary' : 'primary'} />
                  </TableCell>
                  <TableCell>{(u.language ?? 'ro').toUpperCase()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEditDialog(u)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('users.staff.add')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={t('users.staff.firstName')}
              value={createPayload.firstName}
              onChange={(e) => setCreatePayload((p) => ({ ...p, firstName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label={t('users.staff.lastName')}
              value={createPayload.lastName}
              onChange={(e) => setCreatePayload((p) => ({ ...p, lastName: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label={t('auth.email')}
              type="email"
              value={createPayload.email}
              onChange={(e) => setCreatePayload((p) => ({ ...p, email: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label={t('auth.password')}
              type="password"
              value={createPayload.password}
              onChange={(e) => setCreatePayload((p) => ({ ...p, password: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              select
              label={t('users.staff.role')}
              value={createPayload.role}
              onChange={(e) => setCreatePayload((p) => ({ ...p, role: e.target.value as CreateStaffUserRequest['role'] }))}
              fullWidth
            >
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>{getRoleLabel(role)}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t('nav.language')}
              value={createPayload.language}
              onChange={(e) => setCreatePayload((p) => ({ ...p, language: e.target.value as 'ro' | 'en' }))}
              fullWidth
            >
              {LANGUAGES.map((lng) => (
                <MenuItem key={lng} value={lng}>{lng.toUpperCase()}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating || !createPayload.firstName.trim() || !createPayload.lastName.trim() || !createPayload.email || !createPayload.password}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('common.edit')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label={t('users.staff.firstName')} value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required fullWidth />
            <TextField label={t('users.staff.lastName')} value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required fullWidth />
            <TextField label={t('auth.email')} value={editingUser?.email ?? ''} disabled fullWidth />
            <TextField select label={t('users.staff.role')} value={editRole} onChange={(e) => setEditRole(e.target.value as 'ADMIN' | 'COACH' | 'TRAINER')} fullWidth>
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>{getRoleLabel(role)}</MenuItem>
              ))}
            </TextField>
            <TextField select label={t('nav.language')} value={editLanguage} onChange={(e) => setEditLanguage(e.target.value as 'ro' | 'en')} fullWidth>
              {LANGUAGES.map((lng) => (
                <MenuItem key={lng} value={lng}>{lng.toUpperCase()}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handlePatch} disabled={updating || !editFirstName.trim() || !editLastName.trim()}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

