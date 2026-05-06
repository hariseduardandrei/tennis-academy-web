'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { isStudent } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { LoadingState } from '@/components/LoadingState';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if (isStudent(user.role)) router.replace('/student');
      else router.replace('/today');
    }
  }, [loading, user, router]);

  return (
    <LoadingState title={t('auth.guard.title')} description={t('auth.guard.description')} fullScreen />
  );
}

