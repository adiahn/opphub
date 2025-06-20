export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ProfileData {
  bio: string;
  location: string;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  skills: any[];
  projects: any[];
  achievements: any[];
  education: any[];
  workExperience: any[];
}

export interface UserProfile {
  profile: ProfileData;
  streak: {
    current: number;
    longest: number;
    lastCheckIn: string | null;
  };
  _id: string;
  email: string;
  name: string;
  xp: number;
  level: string;
  stars: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
} 