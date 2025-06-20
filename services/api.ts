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
    const response = await axios.get(`${BASE_URL}/posts/${id}`, {
      params: {
        _embed: true,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    return response.data;
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
      console.log('Check-in token:', token ? 'Token exists' : 'No token found');
      if (!token) throw new Error('No authentication token found');
      
      console.log('Making check-in request to:', 'https://oppotunitieshubbackend.onrender.com/api/users/check-in');
      const response = await axios.post(`https://oppotunitieshubbackend.onrender.com/api/users/check-in`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      console.log('Check-in response status:', response.status);
      console.log('Check-in response data:', response.data);
      return response.data;
    } catch (error) {
      console.log('Check-in error:', error);
      if (axios.isAxiosError(error)) {
        console.log('Check-in axios error response:', error.response?.data);
        console.log('Check-in axios error status:', error.response?.status);
        throw new Error(error.response?.data?.message || 'Failed to check in');
      }
      throw error;
    }
  },
};

export default api; 