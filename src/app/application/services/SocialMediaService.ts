import { SocialMediaAccount } from '../../domain/entities/SocialMediaAccount';
import { Lead } from '../../domain/entities/Lead';
import { Post } from '../../domain/services/SocialMediaService';
import { Page } from 'playwright';

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



export interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp?: Date;
}

export abstract class SocialMediaService {
  abstract loggedIn: boolean;
  private _account: SocialMediaAccount;

  constructor(account: SocialMediaAccount) {
    this._account = account;
  }

  public getAccount(): SocialMediaAccount {
    return this._account;
  }

  abstract login(): Promise<boolean>;
  abstract loginInBrowser(page: Page): Promise<boolean>;
  abstract syncBrowserSessionWithApi(page: Page): Promise<void>;
  abstract syncSessionWithBrowser(page: Page): Promise<void>;
  abstract verifyLoginSuccess(page: Page): Promise<boolean>;
  abstract handlePostLoginDialogs(page: Page): Promise<void>;
  abstract logout(): Promise<boolean>;
  abstract getCurrentUser(): Promise<UserProfile>;
  abstract getUserProfile(username: string): Promise<UserProfile>;
  abstract getUserPosts(username: string, limit?: number): Promise<Post[]>;
  abstract getUserFollowers(username: string, limit?: number): Promise<UserProfile[]>;
  abstract getUserFollowing(username: string, limit?: number): Promise<UserProfile[]>;
  abstract getPostLikes(postId: string, limit?: number): Promise<UserProfile[]>;
  abstract getPostComments(postId: string, limit?: number): Promise<Comment[]>;
  abstract sendMessage(username: string, message: string): Promise<boolean>;
  abstract followUser(username: string): Promise<boolean>;
  abstract likePost(postId: string): Promise<boolean>;
  abstract commentOnPost(postId: string, comment: string): Promise<boolean>;
  abstract searchUsers(query: string, limit?: number): Promise<UserProfile[]>;
  abstract extractLeadsFromFollowers(username: string, limit?: number): Promise<Lead[]>;
  abstract extractLeadsFromLikes(postId: string, limit?: number): Promise<Lead[]>;
  abstract getPost(postId: string): Promise<Post>;
  abstract getHashtagPosts(hashtag: string, limit?: number): Promise<Post[]>;
  abstract setLoggedIn(loggedIn: boolean): void;
  abstract setStateFromBrowser(sessionData: any): Promise<void>;



  /**
   * Genera un UUID v4
   */
  public generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Genera un ID de dispositivo Android
   */
  public generateAndroidDeviceId(): string {
    const uuid = this.generateUUID();
    const androidId = `android-${uuid.substring(0, 16)}`;
    return androidId;
  }

} 