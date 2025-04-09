import { SocialMediaAccount, SocialMediaType } from '../entities/SocialMediaAccount';

export interface SocialMediaAccountRepository {
  findById(id: string): Promise<SocialMediaAccount | null>;
  findByUserId(userId: string): Promise<SocialMediaAccount[]>;
  findByInstanceId(instanceId: string): Promise<SocialMediaAccount[]>;
  findByUserIdAndType(userId: string, type: SocialMediaType): Promise<SocialMediaAccount | null>;
  findByInstanceIdAndUsername(instanceId: string, username: string, type: SocialMediaType): Promise<SocialMediaAccount | null>;
  create(account: SocialMediaAccount): Promise<SocialMediaAccount>;
  update(id: string, account: Partial<SocialMediaAccount>): Promise<SocialMediaAccount | null>;
  delete(id: string): Promise<boolean>;
} 