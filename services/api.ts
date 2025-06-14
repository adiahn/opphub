import axios from 'axios';

const BASE_URL = 'https://opportunitieshub.ng/wp-json/wp/v2';

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

export const api = {
  getPosts: async (page: number = 1, perPage: number = 10): Promise<PostsResponse> => {
    const response = await axios.get(`${BASE_URL}/posts`, {
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

  getPost: async (id: number): Promise<Post> => {
    const response = await axios.get(`${BASE_URL}/posts/${id}`, {
      params: {
        _embed: true,
      },
    });
    return response.data;
  },

  getFreshPosts: async (perPage: number = 5): Promise<Post[]> => {
    const response = await axios.get(`${BASE_URL}/posts`, {
      params: {
        _embed: true,
        per_page: perPage,
      },
    });
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${BASE_URL}/categories`, {
      params: {
        per_page: 100,
      },
    });
    return response.data;
  },
}; 