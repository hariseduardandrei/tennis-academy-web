'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import type { UserRole } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { LoadingState } from './LoadingState';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate home
      if (user.role === 'STUDENT') router.replace('/student');
      else router.replace('/today');
    }
  }, [loading, user, allowedRoles, router]);

  if (loading) {
    return <LoadingState title={t('auth.guard.title')} description={t('auth.guard.description')} fullScreen />;
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}

