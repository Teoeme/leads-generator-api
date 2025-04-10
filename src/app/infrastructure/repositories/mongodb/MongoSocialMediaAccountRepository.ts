import { SocialMediaAccount, SocialMediaType } from '../../../domain/entities/SocialMediaAccount';
import { SocialMediaAccountRepository } from '../../../domain/repositories/SocialMediaAccountRepository';
import { SocialMediaAccountModel, SocialMediaAccountDocument } from '../../models/SocialMediaAccountModel';

export class MongoSocialMediaAccountRepository implements SocialMediaAccountRepository {
  async findById(id: string): Promise<SocialMediaAccount | null> {
    const account = await SocialMediaAccountModel.findById(id).lean();
    if (!account) return null;
    return this.mapToSocialMediaAccount(account as SocialMediaAccountDocument);
  }

  async findByUserId(userId: string): Promise<SocialMediaAccount[]> {
    const accounts = await SocialMediaAccountModel.find({ userId }).lean();
    return accounts.map(account => this.mapToSocialMediaAccount(account as SocialMediaAccountDocument));
  }

  async findByInstanceId(instanceId: string): Promise<SocialMediaAccount[]> {
    const accounts = await SocialMediaAccountModel.find({ instanceId }).lean();
    return accounts.map(account => this.mapToSocialMediaAccount(account as SocialMediaAccountDocument));
  }

  async findByUserIdAndType(userId: string, type: SocialMediaType): Promise<SocialMediaAccount | null> {
    const account = await SocialMediaAccountModel.findOne({ userId, type }).lean();
    if (!account) return null;
    return this.mapToSocialMediaAccount(account as SocialMediaAccountDocument);
  }

  async findByInstanceIdAndUsername(instanceId: string, username: string, type: SocialMediaType): Promise<SocialMediaAccount | null> {
    const account = await SocialMediaAccountModel.findOne({ instanceId, username, type }).lean();
    if (!account) return null;
    return this.mapToSocialMediaAccount(account as SocialMediaAccountDocument);
  }

  async create(account: SocialMediaAccount): Promise<SocialMediaAccount> {
    const newAccount = new SocialMediaAccountModel({
      userId: account.userId,
      instanceId: account.instanceId,
      type: account.type,
      username: account.username,
      password: account.password,
      isActive: account.isActive,
      lastLogin: account.lastLogin,
      lastLoginStatus: account.lastLoginStatus,
      sessionData: account.sessionData,
      proxy: account.proxy,
      roles: account.roles
    });
    await newAccount.save();
    return this.mapToSocialMediaAccount(newAccount);
  }

  async update(id: string, account: Partial<SocialMediaAccount>): Promise<SocialMediaAccount | null> {
    const updatedAccount = await SocialMediaAccountModel.findByIdAndUpdate(id, account, { new: true }).lean();
    if (!updatedAccount) return null;
    return this.mapToSocialMediaAccount(updatedAccount as SocialMediaAccountDocument);
  }

  async delete(id: string): Promise<boolean> {
    const result = await SocialMediaAccountModel.findByIdAndDelete(id);
    return !!result;
  }

  private mapToSocialMediaAccount(account: SocialMediaAccountDocument | any): SocialMediaAccount {
    return {
      id: account._id.toString(),
      userId: account.userId,
      instanceId: account.instanceId,
      type: account.type as SocialMediaType,
      username: account.username,
      password: account.password,
      isActive: account.isActive,
      lastLogin: account.lastLogin,
      lastLoginStatus: account.lastLoginStatus,
      sessionData: account.sessionData,
      proxy: account.proxy,
      roles: account.roles,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }
} 