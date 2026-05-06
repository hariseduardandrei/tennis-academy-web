import { apiClient } from './client';
import type { BillingMonthResponse, PatchMembershipRequest, BillingStudentRow } from './types';

type BillingMonthApiResponse = BillingMonthResponse | BillingStudentRow[];

function normalizeRows(data: BillingMonthApiResponse | undefined): BillingStudentRow[] {
  if (Array.isArray(data)) return data;
  return data?.rows ?? [];
}

export const billingApi = {
  getMonth: async (year: number, month: number) => {
    const data = await apiClient.get<BillingMonthApiResponse>(`/billing/month?year=${year}&month=${month}`);
    return normalizeRows(data);
  },
  patchStudentMonth: (studentId: string, year: number, month: number, req: PatchMembershipRequest) =>
    apiClient.patch<BillingStudentRow>(`/billing/students/${studentId}/month?year=${year}&month=${month}`, req),
  getOverdue: async (year: number, month: number) => {
    const data = await apiClient.get<BillingStudentRow[] | undefined>(`/billing/overdue?year=${year}&month=${month}`);
    return data ?? [];
  },
};

