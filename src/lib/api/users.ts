import { apiClient } from './client';
import type { CreateStaffUserRequest, PatchStaffUserRequest, StaffUserDto } from './types';

function toApiLanguage(language: 'ro' | 'en'): 'RO' | 'EN' {
  return language.toUpperCase() as 'RO' | 'EN';
}

function normalizeStaffList(payload: unknown): StaffUserDto[] {
  if (Array.isArray(payload)) return payload as StaffUserDto[];
  if (!payload || typeof payload !== 'object') return [];

  const candidate = payload as Record<string, unknown>;
  if (Array.isArray(candidate.content)) return candidate.content as StaffUserDto[];
  if (Array.isArray(candidate.items)) return candidate.items as StaffUserDto[];
  if (Array.isArray(candidate.data)) return candidate.data as StaffUserDto[];

  return [];
}

export const usersApi = {
  listStaff: async (): Promise<StaffUserDto[]> => {
    const payload = await apiClient.get<unknown>('/users/staff');
    return normalizeStaffList(payload);
  },

  createStaff: (req: CreateStaffUserRequest) =>
    apiClient.post<StaffUserDto>('/users', {
      ...req,
      language: toApiLanguage(req.language),
    }),

  patchStaff: (id: string, req: PatchStaffUserRequest) =>
    apiClient.patch<StaffUserDto>(`/users/${id}`, {
      ...req,
      ...(req.language ? { language: toApiLanguage(req.language) } : {}),
    }),
};
