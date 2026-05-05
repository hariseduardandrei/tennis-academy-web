'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/AppLayout';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'COACH', 'TRAINER']}>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}

