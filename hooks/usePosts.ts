import apiClient from '@/services/apiClient';
import { Category, Post, PostsResponse } from '@/types/posts';
import { useQuery } from '@tanstack/react-query';

export const POSTS_QUERY_KEY = 'posts';
export const CATEGORIES_QUERY_KEY = 'categories';

// Base URL for the WordPress API
const BASE_URL = 'https://opportunitieshub.ng/wp-json/wp/v2';

export const usePosts = (page: number = 1, perPage: number = 10) => {
  return useQuery<PostsResponse, Error>({
    queryKey: [POSTS_QUERY_KEY, page, perPage],
    queryFn: async () => {
      const response = await apiClient.get<Post[]>(`${BASE_URL}/posts`, {
        params: {
          _embed: true,
          per_page: perPage,
          page,
        },
      });
      return {
        data: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages'] || '1'),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePost = (id: number) => {
  return useQuery<Post, Error>({
    queryKey: [POSTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Post>(`${BASE_URL}/posts/${id}`, {
        params: { _embed: true },
      });
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFreshPosts = (perPage: number = 5) => {
  return useQuery<Post[], Error>({
    queryKey: [POSTS_QUERY_KEY, 'fresh'],
    queryFn: async () => {
      const response = await apiClient.get<Post[]>(`${BASE_URL}/posts`, {
        params: {
          _embed: true,
          per_page: perPage,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>(`${BASE_URL}/categories`, {
        params: {
          per_page: 100,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}; 