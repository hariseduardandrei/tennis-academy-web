import { apiClient } from './client';
import type {
  SessionDto,
  CreateSessionRequest,
  PatchSessionRequest,
  ReplaceStudentsRequest,
  CompleteSessionRequest,
  SessionMetricsResponse,
  StaffUserDto,
} from './types';

export const sessionsApi = {
  listWeek: (start: string) =>
    apiClient.get<SessionDto[]>(`/schedule/week?start=${start}`),
  create: (req: CreateSessionRequest) => apiClient.post<SessionDto>('/sessions', req),
  patch: (id: string, req: PatchSessionRequest) =>
    apiClient.patch<SessionDto>(`/sessions/${id}`, req),
  delete: (id: string) => apiClient.delete<void>(`/sessions/${id}`),
  replaceStudents: (id: string, req: ReplaceStudentsRequest) =>
    apiClient.put<SessionDto>(`/sessions/${id}/students`, req),
  complete: (id: string, req: CompleteSessionRequest) =>
    apiClient.post<void>(`/sessions/${id}/complete`, req),
  getMetrics: (id: string) =>
    apiClient.get<SessionMetricsResponse>(`/sessions/${id}/metrics`),
};

// TODO: Add GET /users endpoint for staff user picker when backend provides it
export const usersApi = {
  listStaff: () => apiClient.get<StaffUserDto[]>('/users/staff'),
};

