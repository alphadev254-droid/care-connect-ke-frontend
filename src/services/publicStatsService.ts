import { api } from '@/lib/api';

export interface PublicStats {
  patients: number;
  caregivers: number;
  sessions: number;
  averageRating: string;
}

export const publicStatsService = {
  getStats: async (): Promise<PublicStats> => {
    const response = await api.get('/public/stats');
    return response.data.stats;
  },
};
