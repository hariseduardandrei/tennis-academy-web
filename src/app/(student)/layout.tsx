'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/AppLayout';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['STUDENT']}>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}

