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