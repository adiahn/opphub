import { wordpressClient } from '@/services/apiClient';
import { Category, Post, PostsResponse } from '@/types/posts';
import { useQuery } from '@tanstack/react-query';

export const POSTS_QUERY_KEY = 'posts';
export const CATEGORIES_QUERY_KEY = 'categories';

export const usePosts = (page: number = 1, perPage: number = 10) => {
  return useQuery<PostsResponse, Error>({
    queryKey: [POSTS_QUERY_KEY, page, perPage],
    queryFn: async () => {
      try {
        const response = await wordpressClient.get<Post[]>(`/posts`, {
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
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const usePost = (id: number) => {
  return useQuery<Post, Error>({
    queryKey: [POSTS_QUERY_KEY, id],
    queryFn: async () => {
      try {
        const response = await wordpressClient.get<Post>(`/posts/${id}`, {
          params: { _embed: true },
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useFreshPosts = (perPage: number = 5) => {
  return useQuery<Post[], Error>({
    queryKey: [POSTS_QUERY_KEY, 'fresh'],
    queryFn: async () => {
      try {
        const response = await wordpressClient.get<Post[]>(`/posts`, {
          params: {
            _embed: true,
            per_page: perPage,
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching fresh posts:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      try {
        const response = await wordpressClient.get<Category[]>(`/categories`, {
          params: {
            per_page: 100,
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: 1000,
  });
}; 