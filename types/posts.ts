export interface Post {
  id: number;
  date: string;
  link: string;
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