import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://opportunitieshub.ng/wp-json/wp/v2';

const getToken = async () => {
  return await SecureStore.getItemAsync('userToken');
};

export interface Post {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
    }>>;
    author?: Array<{
      name: string;
      avatar_urls?: {
        '96': string;
      };
    }>;
  };
}

export interface Category {
  id: number;
  name: string;
  count: number;
}

export interface PostsResponse {
  data: Post[];
  totalPages: number;
}

export interface CommunityUser {
  _id: string;
  name: string;
  xp: number;
  level: string;
  stars: number;
  profile: {
    bio?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    skills?: {
        name: string;
        level: string;
        yearsOfExperience: number;
        _id: string;
    }[];
  };
}

export interface CommunityLeaderboardResponse {
  users: CommunityUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasMore: boolean;
  };
}

const api = {
  getPosts: async (page: number = 1, perPage: number = 10): Promise<PostsResponse> => {
    const url = `${BASE_URL}/posts`;
    
    try {
      const response = await axios.get(url, {
        params: {
          _embed: true,
          per_page: perPage,
          page,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      return {
        data: response.data,
        totalPages: parseInt(response.headers['x-wp-totalpages'] || '1'),
      };
    } catch (error) {
      throw error;
    }
  },

  getPost: async (id: number): Promise<Post> => {
    const url = `${BASE_URL}/posts/${id}`;
    try {
      const response = await axios.get(url, {
        params: { _embed: true },
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Network request failed: ${error.message}`);
      }
      throw error;
    }
  },

  getFreshPosts: async (perPage: number = 5): Promise<Post[]> => {
    const url = `${BASE_URL}/posts`;
    
    try {
      const response = await axios.get(url, {
        params: {
          _embed: true,
          per_page: perPage,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    const url = `${BASE_URL}/categories`;
    
    try {
      const response = await axios.get(url, {
        params: {
          per_page: 100,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkIn: async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      
      const response = await axios.post(`https://oppotunitieshubbackend.onrender.com/api/users/check-in`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to check in');
      }
      throw error;
    }
  },

  getCommunityLeaderboard: async (page: number = 1, limit: number = 20): Promise<CommunityLeaderboardResponse> => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      
      const response = await axios.get(`https://oppotunitieshubbackend.onrender.com/api/community/leaderboard`, {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
      }
      throw error;
    }
  },
};

export default api; 