import SportsTennisRoundedIcon from '@mui/icons-material/SportsTennisRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { SessionStaffInfo, SessionStudentInfo, SessionType } from '@/lib/api/types';

interface SessionTypeVisualSeed {
  color: string;
  icon: SvgIconComponent;
}

export interface SessionTypeVisual {
  color: string;
  icon: SvgIconComponent;
  rail: (theme: Theme) => string;
  surface: (theme: Theme) => string;
  shadow: (theme: Theme) => string;
}

const SESSION_TYPE_VISUALS: Record<SessionType, SessionTypeVisualSeed> = {
  TENNIS: { color: '#2E7D32', icon: SportsTennisRoundedIcon },
  FITNESS: { color: '#1565C0', icon: FitnessCenterRoundedIcon },
  MATCHPLAY: { color: '#E65100', icon: EmojiEventsRoundedIcon },
};

const FALLBACK_VISUAL: SessionTypeVisualSeed = {
  color: '#607D8B',
  icon: SportsTennisRoundedIcon,
};

export function getStaffDisplayName(staffUser: SessionStaffInfo): string {
  const fullName = [staffUser.firstName, staffUser.lastName].filter(Boolean).join(' ').trim();
  return fullName || staffUser.email;
}

export function getStudentDisplayName(student: SessionStudentInfo): string {
  return `${student.firstName} ${student.lastName}`.trim();
}

export function getVisibleStudentNames(
  students: SessionStudentInfo[],
  maxVisible: number,
): { names: string[]; hiddenCount: number } {
  const names = students.map(getStudentDisplayName);
  return {
    names: names.slice(0, maxVisible),
    hiddenCount: Math.max(names.length - maxVisible, 0),
  };
}

export function getSessionTypeVisual(sessionType: string): SessionTypeVisual {
  const seed = SESSION_TYPE_VISUALS[sessionType as SessionType] ?? FALLBACK_VISUAL;
  return {
    color: seed.color,
    icon: seed.icon,
    rail: (theme) => alpha(seed.color, theme.palette.mode === 'dark' ? 0.9 : 0.82),
    surface: (theme) =>
      `linear-gradient(160deg, ${alpha(seed.color, theme.palette.mode === 'dark' ? 0.42 : 0.22)} 0%, ${alpha(seed.color, theme.palette.mode === 'dark' ? 0.22 : 0.12)} 100%)`,
    shadow: (theme) => alpha(seed.color, theme.palette.mode === 'dark' ? 0.34 : 0.22),
  };
}

