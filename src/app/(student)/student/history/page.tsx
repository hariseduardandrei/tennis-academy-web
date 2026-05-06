'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { portalApi } from '@/lib/api/portal';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { fadeUpIn, motion } from '@/lib/ui/motion';
import type { MyHistoryItemResponse } from '@/lib/api/types';

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = 'Europe/Bucharest';

const PAGE_SIZE = 10;

const ATTENDANCE_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  PRESENT: 'success',
  LATE: 'warning',
  ABSENT: 'error',
};

export default function StudentHistoryPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<MyHistoryItemResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback((off: number) => {
    setLoading(true);
    setLoadError(false);
    portalApi
      .getHistory(PAGE_SIZE, off)
      .then((res) => {
        setItems((prev) => (off === 0 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setOffset(off + res.items.length);
      })
      .catch(() => {
        setLoadError(true);
        if (off === 0) {
          setItems([]);
          setTotal(0);
          setOffset(0);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(0); }, [load]);

  return (
    <Box>
      <PageHeader
        eyebrow={t('portal.history.eyebrow')}
        title={t('portal.history')}
        description={t('portal.history.description')}
      />

      {loading && offset === 0 ? (
        <Skeleton variant="rounded" height={340} />
      ) : loadError && items.length === 0 ? (
        <ErrorState
          title={t('common.error')}
          description={t('portal.history.loadError')}
          onRetry={() => load(0)}
          retryLabel={t('common.retry')}
        />
      ) : items.length === 0 ? (
        <EmptyState title={t('portal.noHistory')} description={t('portal.history.emptyDescription')} icon={<HistoryRoundedIcon color="primary" />} />
      ) : (
        <>
          {items.map((item, idx) => (
            <Card
              key={item.sessionId}
              sx={{
                mb: 2,
                background: (theme) =>
                  `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.06 : 0.03)} 100%)`,
                ...fadeUpIn(idx * motion.stagger.tight),
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {dayjs(item.startAt).tz(TZ).format('ddd D MMM YYYY · HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.courtName} · {item.staffName}
                    </Typography>
                    {item.title && <Typography variant="caption">{item.title}</Typography>}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {item.attendanceStatus && (
                      <Chip
                        label={t(`complete.${item.attendanceStatus.toLowerCase()}` as any)}
                        size="small"
                        color={ATTENDANCE_COLORS[item.attendanceStatus] ?? 'default'}
                      />
                    )}
                  </Box>
                </Box>

                {(item.load || item.rpe || item.studentNotes) && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {item.durationMinutes && (
                        <Typography variant="caption" color="text.secondary">
                          {item.durationMinutes} min
                        </Typography>
                      )}
                      {item.rpe && (
                        <Typography variant="caption" color="text.secondary">
                          RPE: {item.rpe}
                        </Typography>
                      )}
                      {item.load && (
                        <Chip label={`${t('portal.load')}: ${item.load}`} size="small" color="info" />
                      )}
                    </Box>
                    {item.studentNotes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {item.studentNotes}
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {offset < total && (
            <Button onClick={() => load(offset)} disabled={loading} variant="outlined" fullWidth>
              {loading ? t('common.loading') : t('portal.history.loadMore')}
            </Button>
          )}
        </>
      )}
    </Box>
  );
}

