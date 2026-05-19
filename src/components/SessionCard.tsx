'use client';

/**
 * SessionCard Component
 *
 * A polished, responsive session card component for displaying tennis academy sessions.
 *
 * Features:
 * - Clean MUI Card with elevated shadow and gradient background
 * - Prominent time display (HH:mm format)
 * - Session type badge with icon
 * - Coach and player information via SessionPeopleRows
 * - Optional action button (Complete)
 * - Left accent rail with gradient
 * - Smooth animations (Framer Motion)
 * - Responsive compact mode
 * - Dark mode support
 *
 * Usage:
 * ```tsx
 * <SessionCard
 *   session={sessionData}
 *   onComplete={() => router.push(`/sessions/${session.id}/complete`)}
 *   completeLabel="Complete"
 *   coachLabel="Coach"
 *   playersLabel="Players"
 *   compact={false}
 *   index={0}
 * />
 * ```
 */

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { motion as fm } from 'framer-motion';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { SessionPeopleRows } from '@/components/SessionPeopleRows';
import { getSessionTypeVisual, getStaffDisplayName } from '@/lib/ui/sessionDisplay';
import type { SessionDto } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'Europe/Bucharest';

interface SessionCardProps {
  /** The session data to display */
  session: SessionDto;
  /** Callback function when the action button is clicked */
  onComplete?: () => void;
  /** Label for the action button */
  completeLabel?: string;
  /** Label for the coach section */
  coachLabel?: string;
  /** Label for the players section */
  playersLabel?: string;
  /** Label displayed when no players are assigned */
  noPlayersLabel?: string;
  /** Enable compact mode for smaller displays */
  compact?: boolean;
  /** Animation index for staggered entrance animations */
  index?: number;
  /** Whether to disable animations (respects prefers-reduced-motion) */
  reduceMotion?: boolean;
}

export function SessionCard({
  session,
  onComplete,
  completeLabel = 'Complete',
  coachLabel = 'Coach',
  playersLabel = 'Players',
  noPlayersLabel = 'No players',
  compact = false,
  index = 0,
  reduceMotion = false,
}: SessionCardProps) {
  const visual = getSessionTypeVisual(session.sessionType);
  const SessionTypeIcon = visual.icon;
  const startTime = dayjs(session.startAt).tz(TZ);
  const endTime = dayjs(session.endAt).tz(TZ);
  const timeString = `${startTime.format('HH:mm')}–${endTime.format('HH:mm')}`;

  return (
    <Box
      component={fm.div}
      initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? undefined : { duration: 0.26, delay: index * 0.045 }}
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.012 }}
      sx={{
        height: '100%',
      }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'visible',
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.96)} 0%, ${alpha(visual.color, theme.palette.mode === 'dark' ? 0.06 : 0.04)} 100%)`,
          boxShadow: (theme) => `0 4px 16px ${alpha(visual.color, 0.12)}`,
          border: '1.5px solid',
          borderColor: (theme) => alpha(visual.color, theme.palette.mode === 'dark' ? 0.28 : 0.18),
          transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
          '&:hover': {
            boxShadow: (theme) => `0 12px 32px ${visual.shadow(theme)}`,
            borderColor: (theme) => alpha(visual.color, theme.palette.mode === 'dark' ? 0.48 : 0.32),
          },
        }}
      >
        {/* Left accent rail */}
        <Box
          sx={{
            position: 'absolute',
            left: -6,
            top: 12,
            bottom: 12,
            width: 4,
            borderRadius: 2,
            background: (theme) =>
              `linear-gradient(180deg, ${visual.color} 0%, ${alpha(visual.color, 0.5)} 100%)`,
            boxShadow: (theme) => `0 0 12px ${alpha(visual.color, 0.4)}`,
            zIndex: 1,
          }}
        />

        {/* Card Content */}
        <CardContent
          sx={{
            flex: 1,
            pb: compact ? 1.5 : 2,
            pt: compact ? 2 : 2.2,
            px: compact ? 2 : 2.4,
          }}
        >
          <Stack spacing={compact ? 1.6 : 2.2}>
            {/* Header: Time + Session Type */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: compact ? '1.05rem' : '1.25rem',
                  letterSpacing: '-0.5px',
                  color: 'text.primary',
                }}
              >
                {timeString}
              </Typography>
              <Chip
                size="small"
                label={session.sessionType}
                icon={<SessionTypeIcon sx={{ fontSize: compact ? 12 : 14 }} />}
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  bgcolor: (theme) =>
                    alpha(visual.color, theme.palette.mode === 'dark' ? 0.24 : 0.12),
                  border: '1px solid',
                  borderColor: (theme) =>
                    alpha(visual.color, theme.palette.mode === 'dark' ? 0.4 : 0.22),
                  '& .MuiChip-icon': {
                    margin: 0,
                  },
                }}
              />
            </Box>

            {/* Session Title (if available) */}
            {session.title && (
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '-0.2px',
                  fontSize: compact ? '0.9rem' : '0.95rem',
                }}
              >
                {session.title}
              </Typography>
            )}

            {/* Coach and Players Section */}
            <Box sx={{ pt: compact ? 0.5 : 0.8 }}>
              <SessionPeopleRows
                coachName={getStaffDisplayName(session.staffUser)}
                students={session.students}
                coachLabel={coachLabel}
                playersLabel={playersLabel}
                noPlayersLabel={noPlayersLabel}
                compact={compact}
                maxStudentPills={compact ? 3 : 6}
              />
            </Box>
          </Stack>
        </CardContent>

        {/* Card Actions */}
        {onComplete && (
          <CardActions
            sx={{
              p: compact ? '1.2px 2px' : '1.6px 2.4px',
              pt: compact ? '0.8px' : '1.2px',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              size={compact ? 'small' : 'medium'}
              variant="contained"
              onClick={onComplete}
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'uppercase',
                fontSize: compact ? '0.75rem' : '0.8125rem',
                letterSpacing: '0.5px',
                px: compact ? 1.8 : 2.4,
                py: compact ? 0.6 : 0.8,
                background: (theme) =>
                  `linear-gradient(90deg, ${alpha(visual.color, 0.88)} 0%, ${alpha(visual.color, 0.68)} 100%)`,
                color: 'white',
                boxShadow: (theme) => `0 2px 8px ${alpha(visual.color, 0.18)}`,
                transition: 'all 180ms cubic-bezier(0.22,1,0.36,1)',
                '&:hover': {
                  background: (theme) =>
                    `linear-gradient(90deg, ${visual.color} 0%, ${alpha(visual.color, 0.88)} 100%)`,
                  boxShadow: (theme) => `0 6px 20px ${alpha(visual.color, 0.32)}`,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {completeLabel}
            </Button>
          </CardActions>
        )}
      </Card>
    </Box>
  );
}


