'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/AppLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}

