export enum SocialMediaType {
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  TIKTOK = 'TIKTOK'
}

export enum SocialMediaLastLoginStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}



export interface SocialMediaAccount {
  id?: string;
  userId: string;
  instanceId: string;
  type: SocialMediaType;
  username: string;
  password: string;
  isActive?: boolean;
  lastLogin?: Date;
  lastLoginStatus?: SocialMediaLastLoginStatus;
  sessionData?: any;
  createdAt?: Date;
  updatedAt?: Date;
} 