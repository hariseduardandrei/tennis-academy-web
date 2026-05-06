import { apiClient } from './client';
import type {
  StudentDto,
  CreateStudentRequest,
  PatchStudentRequest,
  CreateAccountResponse,
} from './types';

function normalizeStudentsList(payload: unknown): StudentDto[] {
  if (Array.isArray(payload)) return payload as StudentDto[];
  if (!payload || typeof payload !== 'object') return [];

  const candidate = payload as Record<string, unknown>;
  if (Array.isArray(candidate.content)) return candidate.content as StudentDto[];
  if (Array.isArray(candidate.items)) return candidate.items as StudentDto[];
  if (Array.isArray(candidate.data)) return candidate.data as StudentDto[];

  return [];
}

export const studentsApi = {
  list: async (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    const payload = await apiClient.get<unknown>(`/students${q ? `?${q}` : ''}`);
    return normalizeStudentsList(payload);
  },
  get: (id: string) => apiClient.get<StudentDto>(`/students/${id}`),
  create: (req: CreateStudentRequest) => apiClient.post<StudentDto>('/students', req),
  patch: (id: string, req: PatchStudentRequest) =>
    apiClient.patch<StudentDto>(`/students/${id}`, req),
  createAccount: (id: string) =>
    apiClient.post<CreateAccountResponse>(`/students/${id}/create-account`, {}),
};
