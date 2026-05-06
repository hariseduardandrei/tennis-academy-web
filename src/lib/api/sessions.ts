import { apiClient } from './client';
import type {
  SessionDto,
  CreateSessionRequest,
  PatchSessionRequest,
  ReplaceStudentsRequest,
  CompleteSessionRequest,
  SessionMetricsResponse,
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
