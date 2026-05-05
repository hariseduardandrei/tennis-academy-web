import { apiClient } from './client';
import type { CourtDto } from './types';

export const courtsApi = {
  list: () => apiClient.get<CourtDto[]>('/courts'),
};

