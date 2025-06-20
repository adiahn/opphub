import apiClient from '@/services/apiClient';
import { CommunityLeaderboardResponse } from '@/types/community';
import { useInfiniteQuery } from '@tanstack/react-query';

const LEADERBOARD_QUERY_KEY = 'communityLeaderboard';

const fetchLeaderboard = async ({ pageParam = 1 }: { pageParam: unknown }) => {
  const page = typeof pageParam === 'number' ? pageParam : 1;
  const { data } = await apiClient.get<CommunityLeaderboardResponse>('/community/leaderboard', {
    params: { page, limit: 20 },
  });
  return data;
};

export const useCommunityLeaderboard = () => {
  return useInfiniteQuery<CommunityLeaderboardResponse, Error>({
    queryKey: [LEADERBOARD_QUERY_KEY],
    queryFn: fetchLeaderboard,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}; 