import { apiClient } from './client';
import type {
  StudentDto,
  CreateStudentRequest,
  PatchStudentRequest,
  CreateAccountResponse,
} from './types';

export const studentsApi = {
  list: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return apiClient.get<StudentDto[]>(`/students${q ? `?${q}` : ''}`);
  },
  get: (id: string) => apiClient.get<StudentDto>(`/students/${id}`),
  create: (req: CreateStudentRequest) => apiClient.post<StudentDto>('/students', req),
  patch: (id: string, req: PatchStudentRequest) =>
    apiClient.patch<StudentDto>(`/students/${id}`, req),
  createAccount: (id: string) =>
    apiClient.post<CreateAccountResponse>(`/students/${id}/create-account`, {}),
};

