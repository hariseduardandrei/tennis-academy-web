import { apiClient } from './client';
import type { BillingMonthResponse, PatchMembershipRequest, BillingStudentRow } from './types';

export const billingApi = {
  getMonth: (year: number, month: number) =>
    apiClient.get<BillingMonthResponse>(`/billing/month?year=${year}&month=${month}`),
  patchStudentMonth: (studentId: string, year: number, month: number, req: PatchMembershipRequest) =>
    apiClient.patch<BillingStudentRow>(`/billing/students/${studentId}/month?year=${year}&month=${month}`, req),
  getOverdue: (year: number, month: number) =>
    apiClient.get<BillingStudentRow[]>(`/billing/overdue?year=${year}&month=${month}`),
};

