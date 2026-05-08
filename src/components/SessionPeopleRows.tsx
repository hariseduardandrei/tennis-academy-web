import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import { alpha } from '@mui/material/styles';
import type { SessionStudentInfo } from '@/lib/api/types';

interface SessionPeopleRowsProps {
  coachName: string;
  students: SessionStudentInfo[];
  coachLabel: string;
  playersLabel: string;
  noPlayersLabel: string;
  compact?: boolean;
  maxStudentPills?: number;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function NamePill({
  label,
  initials,
  compact,
  tone,
}: {
  label: string;
  initials?: string;
  compact?: boolean;
  tone: 'primary' | 'secondary';
}) {
  return (
    <Box
      sx={{
        maxWidth: '100%',
        minWidth: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 0.4 : 0.5,
        px: compact ? 0.55 : 0.75,
        py: compact ? 0.1 : 0.2,
        borderRadius: 6,
        bgcolor: (theme) => alpha(theme.palette[tone].main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette[tone].main, theme.palette.mode === 'dark' ? 0.34 : 0.22),
      }}
    >
      {initials && (
        <Avatar
          sx={{
            width: compact ? 14 : 16,
            height: compact ? 14 : 16,
            fontSize: compact ? '0.5rem' : '0.55rem',
            fontWeight: 800,
            bgcolor: (theme) => alpha(theme.palette[tone].main, theme.palette.mode === 'dark' ? 0.55 : 0.45),
          }}
        >
          {initials}
        </Avatar>
      )}
      <Typography
        variant="caption"
        fontWeight={600}
        noWrap
        sx={{ fontSize: compact ? '0.66rem' : '0.7rem', lineHeight: 1.25, maxWidth: '100%' }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function SessionPeopleRows({
  coachName,
  students,
  coachLabel,
  playersLabel,
  noPlayersLabel,
  compact = false,
  maxStudentPills = 6,
}: SessionPeopleRowsProps) {
  return (
    <Stack spacing={compact ? 0.6 : 0.8} sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={compact ? 0.65 : 1} alignItems="flex-start" sx={{ minWidth: 0 }}>
        <Avatar
          sx={{
            width: compact ? 20 : 24,
            height: compact ? 20 : 24,
            mt: 0.15,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18),
          }}
        >
          <PersonRoundedIcon sx={{ fontSize: compact ? 12 : 14, color: 'primary.main' }} />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {coachLabel}
          </Typography>
          <Box sx={{ mt: 0.35, minWidth: 0 }}>
            <NamePill label={coachName} compact={compact} tone="primary" />
          </Box>
        </Box>
      </Stack>

      <Stack direction="row" spacing={compact ? 0.65 : 1} alignItems="flex-start" sx={{ minWidth: 0 }}>
        <Avatar
          sx={{
            width: compact ? 20 : 24,
            height: compact ? 20 : 24,
            mt: 0.15,
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
          }}
        >
          <GroupRoundedIcon sx={{ fontSize: compact ? 12 : 14, color: 'secondary.main' }} />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {playersLabel}
          </Typography>
          {students.length === 0 ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.35, fontWeight: 600 }}
            >
              {noPlayersLabel}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 0.35 : 0.5, mt: 0.35, minWidth: 0 }}>
              {students.slice(0, maxStudentPills).map((student) => (
                <NamePill
                  key={student.id}
                  label={`${student.firstName} ${student.lastName}`}
                  initials={getInitials(student.firstName, student.lastName)}
                  compact={compact}
                  tone="secondary"
                />
              ))}
              {students.length > maxStudentPills && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: compact ? 0.55 : 0.75,
                    py: compact ? 0.1 : 0.2,
                    borderRadius: 6,
                    bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: compact ? '0.66rem' : '0.7rem', fontWeight: 600 }}
                  >
                    +{students.length - maxStudentPills}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </Stack>
  );
}

