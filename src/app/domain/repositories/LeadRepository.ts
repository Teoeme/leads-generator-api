import { Lead, LeadStatus } from '../entities/Lead';
import { SocialMediaType } from '../entities/SocialMediaAccount';

export interface LeadRepository {
  findById(id: string): Promise<Lead | null>;
  findByUserId(userId: string): Promise<Lead[]>;
  findByUserIdAndStatus(userId: string, status: LeadStatus): Promise<Lead[]>;
  findByUserIdAndSocialMediaType(userId: string, type: SocialMediaType): Promise<Lead[]>;
  findByUserIdAndSocialMediaId(userId: string, socialMediaId: string): Promise<Lead | null>;
  create(lead: Lead): Promise<Lead>;
  update(id: string, lead: Partial<Lead>): Promise<Lead | null>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead | null>;
  delete(id: string): Promise<boolean>;
  search(userId: string, query: string): Promise<Lead[]>;
} 