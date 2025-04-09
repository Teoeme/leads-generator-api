import { SocialMediaType } from './SocialMediaAccount';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  RESPONDED = 'responded',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  REJECTED = 'rejected'
}

export interface Lead {
  id?: string;
  userId: string;
  socialMediaType: SocialMediaType;
  socialMediaId: string;
  username: string;
  fullName?: string;
  profileUrl: string;
  profilePicUrl?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isPrivate?: boolean;
  isVerified?: boolean;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  businessCategory?: string;
  tags?: string[];
  notes?: string;
  status: LeadStatus;
  source?: string;
  sourceUrl?: string;
  lastContactDate?: Date;
  lastResponseDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  lastInteractionAt?: Date;
} 