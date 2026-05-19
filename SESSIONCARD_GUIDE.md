# SessionCard Component - Usage Guide

## Overview

The `SessionCard` component is a polished, responsive session display component for the Tennis Academy Web app. It presents session information with a clean, elevated card design featuring prominent time display, session type badging, coach/player information, and optional action buttons.

## Features

- ✅ **Clean MUI Card** with elevated shadow and gradient background
- ✅ **Prominent Time Display** in HH:mm–HH:mm format (h6 typography)
- ✅ **Session Type Badge** with dynamic icon
- ✅ **Coach & Player Info** via integrated SessionPeopleRows component
- ✅ **Left Accent Rail** with gradient and glow effect
- ✅ **Smooth Animations** using Framer Motion (respects `prefers-reduced-motion`)
- ✅ **Responsive Design** with compact mode for mobile
- ✅ **Dark Mode Support** with theme-aware colors
- ✅ **Accessible** with proper typography hierarchy

## Basic Usage

```tsx
import { SessionCard } from '@/components/SessionCard';
import type { SessionDto } from '@/lib/api/types';

function MyComponent({ session }: { session: SessionDto }) {
  return (
    <SessionCard
      session={session}
      onComplete={() => console.log('Complete clicked')}
      completeLabel="Complete"
    />
  );
}
```

## With Internationalization

```tsx
import { SessionCard } from '@/components/SessionCard';
import { useI18n } from '@/lib/i18n';

function MyComponent({ session }: { session: SessionDto }) {
  const { t } = useI18n();

  return (
    <SessionCard
      session={session}
      onComplete={() => handleComplete(session.id)}
      completeLabel={t('today.complete')}
      coachLabel={t('today.coach')}
      playersLabel={t('today.players')}
      noPlayersLabel={t('today.noPlayers')}
    />
  );
}
```

## List of Cards with Staggered Animation

```tsx
import Stack from '@mui/material/Stack';
import { useDensityPreference } from '@/lib/ui/density';
import { useReducedMotion } from 'framer-motion';

function SessionList({ sessions }: { sessions: SessionDto[] }) {
  const { t } = useI18n();
  const { density } = useDensityPreference('comfortable');
  const reduceMotion = useReducedMotion();
  const isCompact = density === 'compact';

  return (
    <Stack spacing={isCompact ? 1.25 : 1.75}>
      {sessions.map((session, index) => (
        <SessionCard
          key={session.id}
          session={session}
          onComplete={() => handleComplete(session.id)}
          completeLabel={t('today.complete')}
          coachLabel={t('today.coach')}
          playersLabel={t('today.players')}
          noPlayersLabel={t('today.noPlayers')}
          compact={isCompact}
          index={index}
          reduceMotion={reduceMotion}
        />
      ))}
    </Stack>
  );
}
```

## In a Grid Layout

```tsx
import Grid from '@mui/material/Grid';

function SessionGrid({ sessions }: { sessions: SessionDto[] }) {
  const { t } = useI18n();
  const { density } = useDensityPreference('comfortable');

  return (
    <Grid container spacing={2}>
      {sessions.map((session, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={session.id}>
          <SessionCard
            session={session}
            onComplete={() => handleComplete(session.id)}
            completeLabel={t('today.complete')}
            compact={density === 'compact'}
            index={index}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

## Read-Only Card (No Action Button)

```tsx
function ReadOnlyCard({ session }: { session: SessionDto }) {
  return (
    <SessionCard
      session={session}
      coachLabel="Coach"
      playersLabel="Players"
      /* onComplete is optional - omit to hide the action button */
    />
  );
}
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `session` | `SessionDto` | The session data to display (startAt, endAt, sessionType, staffUser, students, etc.) |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onComplete` | `() => void` | `undefined` | Callback when action button is clicked. If not provided, button is hidden. |
| `completeLabel` | `string` | `"Complete"` | Text for the action button. Example: `t('today.complete')` |
| `coachLabel` | `string` | `"Coach"` | Label for the coach section. Example: `t('today.coach')` |
| `playersLabel` | `string` | `"Players"` | Label for the players section. Example: `t('today.players')` |
| `noPlayersLabel` | `string` | `"No players"` | Message when no players are assigned. Example: `t('today.noPlayers')` |
| `compact` | `boolean` | `false` | Enable compact mode (smaller padding, font sizes). Use for mobile/dense displays. |
| `index` | `number` | `0` | Animation stagger index for entrance effect. Use in lists: `map((item, idx) => <SessionCard index={idx} />)` |
| `reduceMotion` | `boolean` | `false` | Disable animations. Respects `useReducedMotion()` from Framer Motion. |

## Layout Structure

```
┌────────────────────────────────────┐
│ ▌ Left accent rail (gradient)     │
│                                   │
│ Card Content:                     │
│ ┌──────────────────────────────┐ │
│ │ Time (h6)     [Type Badge]   │ │
│ │ HH:mm–HH:mm                  │ │
│ ├──────────────────────────────┤ │
│ │ Optional Title (subtitle2)   │ │
│ ├──────────────────────────────┤ │
│ │ Coach & Players Section      │ │
│ │ • Coach avatar + name pill   │ │
│ │ • Player avatars + pills     │ │
│ └────────────────────────���─────┘ │
│                                   │
│  [Complete Button] (right-align)  │
└────────────────────────────────────┘
```

## Styling & Theming

### Color System

- **Session Type Color**: Automatically determined by `sessionType` (TENNIS, FITNESS, MATCHPLAY)
- **Text Colors**: Uses theme palette (`text.primary`, `text.secondary`)
- **Background**: Gradient background with session type color tint
- **Accent Rail**: Gradient from session type color to semi-transparent

### Dark Mode

The component automatically adapts to dark mode:
- Shadows and elevations adjust for visibility
- Border colors adapt based on `theme.palette.mode`
- Background tints are theme-aware using `alpha()`

### Responsive Typography

| Size | Desktop (h6) | Compact |
|------|-------------|---------|
| Time | 1.25rem | 1.05rem |
| Title | 0.95rem | 0.9rem |
| Button | medium | small |

## Animations

- **Entrance**: Fade + slide up + scale (0.26s)
- **Hover**: Lift + scale (smooth transition)
- **Stagger**: 45ms delay between items in lists
- **Accessibility**: Respects `prefers-reduced-motion` preference

## Real-World Examples

### Example 1: Today's Sessions Page

See `/src/app/(staff)/today/page.tsx` for the production implementation.

```tsx
<Stack spacing={isCompact ? 1.25 : 1.75}>
  {courtSessions.map((sess, sessIndex) => (
    <SessionCard
      key={sess.id}
      session={sess}
      onComplete={() => router.push(`/sessions/${sess.id}/complete`)}
      completeLabel={t('today.complete')}
      coachLabel={t('today.coach')}
      playersLabel={t('today.players')}
      noPlayersLabel={t('today.noPlayers')}
      compact={isCompact}
      index={sessIndex}
      reduceMotion={reduceMotion}
    />
  ))}
</Stack>
```

## Integration Checklist

- [ ] Import component: `import { SessionCard } from '@/components/SessionCard';`
- [ ] Get i18n: `const { t } = useI18n();`
- [ ] Get density: `const { density } = useDensityPreference('comfortable');`
- [ ] Get reduce motion: `const reduceMotion = useReducedMotion();`
- [ ] Pass session data: `session={sessionData}`
- [ ] Handle callback: `onComplete={() => router.push(...)}`
- [ ] Pass i18n labels: `completeLabel={t('today.complete')}`
- [ ] Enable compact mode: `compact={density === 'compact'}`
- [ ] Set animation index: `index={idx}` in lists
- [ ] Pass reduce motion: `reduceMotion={reduceMotion}`

## Files Modified

- `src/components/SessionCard.tsx` - New component
- `src/app/(staff)/today/page.tsx` - Updated to use SessionCard
- `src/components/SessionCard.examples.ts` - Documentation

## Performance Considerations

- Component is lightweight with minimal re-renders
- Uses Framer Motion for GPU-accelerated animations
- SessionPeopleRows is memoized internally
- Respects reduce motion preferences for accessibility

## Future Enhancements

Potential improvements for future versions:
- Add edit button for staff
- Add delete confirmation
- Add session copy/duplicate
- Add inline editing capabilities
- Export to calendar
- Share session details

