import { useQuery } from '@tanstack/react-query';
import { publicStatsService, type PublicStats } from '@/services/publicStatsService';

export const PUBLIC_STATS_KEY = ['public-stats'] as const;

export const usePublicStats = () => {
  return useQuery<PublicStats>({
    queryKey: PUBLIC_STATS_KEY,
    queryFn: publicStatsService.getStats,
    staleTime: 5 * 60 * 1000,
  });
};
