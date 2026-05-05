import { apiClient } from './client';
import type { LoginRequest, LoginResponse, MeResponse } from './types';

export const authApi = {
  login: (req: LoginRequest) => apiClient.postPublic<LoginResponse>('/auth/login', req),
  me: () => apiClient.get<MeResponse>('/me'),
};

