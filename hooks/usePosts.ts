import api, { Category, Post, PostsResponse } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const POSTS_QUERY_KEY = 'posts';
export const FRESH_POSTS_QUERY_KEY = 'freshPosts';
export const CATEGORIES_QUERY_KEY = 'categories';

export const usePosts = (page: number = 1) => {
  return useQuery<PostsResponse>({
    queryKey: [POSTS_QUERY_KEY, page],
    queryFn: () => api.getPosts(page),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useFreshPosts = () => {
  return useQuery<Post[]>({
    queryKey: [FRESH_POSTS_QUERY_KEY],
    queryFn: () => api.getFreshPosts(),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: () => api.getCategories(),
    staleTime: 1000 * 60 * 30, // Categories don't change often, so keep them fresh for 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}; 