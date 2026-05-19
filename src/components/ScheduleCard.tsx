'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha } from '@mui/material/styles';
import { motion as fm } from 'framer-motion';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getSessionTypeVisual, getStaffDisplayName } from '@/lib/ui/sessionDisplay';
import type { SessionDto } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'Europe/Bucharest';

interface ScheduleCardProps {
  session: SessionDto;
  blockHeight: number;
  top: number;
  isCompact: boolean;
  reduceMotion: boolean | null;
  showTitle: boolean;
  showActions: boolean;
  coachLabel: string;
  playersLabel: string;
  noPlayersLabel: string;
  completeLabel: string;
  editLabel: string;
  deleteLabel: string;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ScheduleCard({
  session,
  blockHeight,
  top,
  isCompact,
  reduceMotion,
  showTitle,
  showActions,
  coachLabel,
  playersLabel,
  noPlayersLabel,
  completeLabel,
  editLabel,
  deleteLabel,
  onComplete,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const visual = getSessionTypeVisual(session.sessionType);
  const SessionTypeIcon = visual.icon;
  const dense = blockHeight < (isCompact ? 136 : 152);
  const veryDense = blockHeight < (isCompact ? 118 : 132);
  const playersMaxHeight = dense ? (isCompact ? 58 : 68) : (isCompact ? 78 : 98);
  const players = (session.students ?? []).filter((student) =>
    Boolean(student.firstName?.trim() || student.lastName?.trim()),
  );
  const playerNames = players.map((student) => `${student.firstName} ${student.lastName}`.trim()).join(', ');

  return (
    <Tooltip
      title={(
        <Box>
          <Typography variant="caption" fontWeight={700} display="block">
            {getStaffDisplayName(session.staffUser)}
          </Typography>
          <Typography variant="caption" display="block">
            {session.students.map((student) => `${student.firstName} ${student.lastName}`).join(', ') || noPlayersLabel}
          </Typography>
        </Box>
      )}
      placement="right"
    >
      <Box
        component={fm.div}
        initial={reduceMotion ? false : { opacity: 0, y: 7, scale: 0.99 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={reduceMotion ? undefined : { duration: 0.22 }}
        whileHover={reduceMotion ? undefined : { y: -2 }}
        sx={{
          position: 'absolute',
          top,
          left: 4,
          right: 4,
          height: blockHeight,
          minHeight: 86,
          backgroundImage: (theme) => visual.surface(theme),
          color: 'white',
          borderRadius: 2,
          p: veryDense ? 1 : 2,
          pl: veryDense ? 1.5 : 2.5,
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid',
          borderColor: (theme) => alpha(visual.color, theme.palette.mode === 'dark' ? 0.52 : 0.34),
          boxShadow: (theme) => `0 14px 24px ${visual.shadow(theme)}`,
          transition: 'transform 180ms ease, opacity 180ms ease, box-shadow 180ms ease',
          '&:hover': { opacity: 0.96 },
          display: 'flex',
          flexDirection: 'column',
          gap: veryDense ? 0.55 : 1,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: (theme) => visual.rail(theme),
          }}
        />

        {/* Top row: time left, sport icon right */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            fontWeight={800}
            sx={{ fontSize: '0.875rem', lineHeight: 1.2, flex: 1, minWidth: 0, pr: 0.5 }}
            noWrap
          >
            {dayjs(session.startAt).tz(TZ).format('HH:mm')}–{dayjs(session.endAt).tz(TZ).format('HH:mm')}
          </Typography>
          <SessionTypeIcon sx={{ fontSize: isCompact ? 13 : 14, opacity: 0.94, flexShrink: 0 }} />
        </Box>

        {showTitle && (
          <Typography variant="caption" display="block" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {session.title}
          </Typography>
        )}

        <Box sx={{ display: 'grid', gap: veryDense ? 0.6 : 1, minWidth: 0, minHeight: 0, flex: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Avatar sx={{ width: 16, height: 16, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.24) }}>
                <PersonRoundedIcon sx={{ fontSize: 10, color: 'primary.main' }} />
              </Avatar>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.2, opacity: 0.92 }}>
                {coachLabel}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {getStaffDisplayName(session.staffUser)}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Avatar sx={{ width: 16, height: 16, bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.24) }}>
                <GroupRoundedIcon sx={{ fontSize: 10, color: 'secondary.main' }} />
              </Avatar>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.2, opacity: 0.92 }}>
                {playersLabel}
              </Typography>
            </Box>

            {players.length === 0 ? (
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2, opacity: 0.94, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {noPlayersLabel}
              </Typography>
            ) : veryDense ? (
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {playerNames}
              </Typography>
            ) : (
              <Box
                sx={{
                  maxHeight: playersMaxHeight,
                  minHeight: 0,
                  overflowY: 'auto',
                  pr: 0.25,
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'flex-start' }}>
                  {players.map((student) => (
                    <Typography
                      key={student.id}
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        lineHeight: 1.2,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        pr: 0.35,
                      }}
                    >
                      {student.firstName} {student.lastName}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {showActions && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 'auto' }}>
            <Tooltip title={completeLabel}>
              <IconButton
                size="small"
                sx={{ color: 'white', p: 0.25 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
              >
                <CheckCircleIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title={editLabel}>
              <IconButton
                size="small"
                sx={{ color: 'white', p: 0.25 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title={deleteLabel}>
              <IconButton
                size="small"
                sx={{ color: 'white', p: 0.25 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}

