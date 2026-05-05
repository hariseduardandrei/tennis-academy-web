import { apiClient } from './client';
import type { MyScheduleWeekResponse, MyHistoryResponse } from './types';

export const portalApi = {
  getScheduleWeek: (start: string) =>
    apiClient.get<MyScheduleWeekResponse>(`/my/schedule/week?start=${start}`),
  getHistory: (limit = 20, offset = 0) =>
    apiClient.get<MyHistoryResponse>(`/my/history?limit=${limit}&offset=${offset}`),
};

