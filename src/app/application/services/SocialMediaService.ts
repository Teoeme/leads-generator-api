import { ProxyAssignment, SocialMediaAccount } from '../../domain/entities/SocialMediaAccount';
import { Lead } from '../../domain/entities/Lead';
import { Post } from '../../domain/services/SocialMediaService';
import { Page } from 'playwright';
import { ProxyConfiguration } from '../../domain/entities/Proxy/ProxyConfiguration';

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
  private _proxy: ProxyConfiguration | null;

  constructor(account: SocialMediaAccount,proxy: ProxyConfiguration | null) {
    this._account = account;
    this._proxy = proxy;
  }

  public getAccount(): SocialMediaAccount {
    return this._account;
  }


  public getProxy(): ProxyConfiguration | null {
    return this._proxy;
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
  abstract extractLeadsFromFollowers(username: string, limit?: number): Promise<Omit<Lead, 'campaignId'>[]>;
  abstract extractLeadsFromLikes(postId: string, limit?: number): Promise<Omit<Lead, 'campaignId'>[]>;
  abstract getPost(postId: string): Promise<Post>;
  abstract getHashtagPosts(hashtag: string, limit?: number): Promise<Post[]>;
  abstract setLoggedIn(loggedIn: boolean): void;
  abstract setStateFromBrowser(sessionData: any): Promise<void>;
  abstract goToHome(page: Page): Promise<void>;


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