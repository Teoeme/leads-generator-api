import { SocialMediaAccount } from '../entities/SocialMediaAccount';
import { Lead } from '../entities/Lead';

export interface UserProfile {
  id: string;
  username: string;
  fullName?: string;
  bio?: string;
  profilePicUrl?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isPrivate?: boolean;
  isVerified?: boolean;
}

/**
 * Interfaz para representar un post en redes sociales
 */
export interface Post {
  id: string;
  caption?: string;
  mediaUrl?: string;
  likesCount?: number;
  commentsCount?: number;
  timestamp?: Date;
  owner?: {
    id: string;
    username: string;
    fullName?: string;
    profilePicUrl?: string;
  };
}



export interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp?: Date;
}
