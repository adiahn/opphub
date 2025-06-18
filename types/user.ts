export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
  name: string;
  level: SkillLevel;
  yearsOfExperience: number;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  startDate: Date;
  endDate?: Date;
  isOngoing: boolean;
}

export interface Achievement {
  title: string;
  description: string;
  date: Date;
  issuer?: string;
  url?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate?: Date;
  isOngoing: boolean;
  description?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  isOngoing: boolean;
  description?: string;
}

export interface UserProfile {
  // Basic Account Information
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  // Profile Section
  // A. Contact Information
  bio?: string;
  location?: string;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  contactEmail?: string;

  // B. Skills
  skills: Skill[];

  // C. Projects
  projects: Project[];

  // D. Achievements
  achievements: Achievement[];

  // E. Education
  education: Education[];

  // F. Work Experience
  workExperience: WorkExperience[];

  // Additional fields for app functionality
  avatar?: string;
  xp: number;
  level: string;
} 