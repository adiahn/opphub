import api from '@/services/api';
import { useInfiniteQuery } from '@tanstack/react-query';

const LEADERBOARD_QUERY_KEY = 'communityLeaderboard';

export function useCommunityLeaderboard(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: [LEADERBOARD_QUERY_KEY],
    queryFn: ({ pageParam = 1 }) => api.getCommunityLeaderboard(pageParam, limit),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
} 