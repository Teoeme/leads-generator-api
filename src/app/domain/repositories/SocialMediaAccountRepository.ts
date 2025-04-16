import { SocialMediaAccount, SocialMediaType } from '../entities/SocialMediaAccount';

export interface SocialMediaAccountRepository {
  find(): Promise<SocialMediaAccount[]>;
  findById(id: string): Promise<SocialMediaAccount | null>;
  findByUserId(userId: string): Promise<SocialMediaAccount[]>;
  findByUserIdAndType(userId: string, type: SocialMediaType): Promise<SocialMediaAccount | null>;
  findByUsernameAndType(username:string,type:SocialMediaType):Promise<SocialMediaAccount | null>;
  create(account: SocialMediaAccount): Promise<SocialMediaAccount>;
  update(id: string, account: Partial<SocialMediaAccount>): Promise<SocialMediaAccount | null>;
  delete(id: string): Promise<boolean>;
} 