import { Lead, LeadStatus } from '../entities/Lead';
import { SocialMediaType } from '../entities/SocialMediaAccount';

export interface LeadRepository {
  findById(id: string): Promise<Lead | null>;
  create(lead: Lead): Promise<Lead>;
  createMany(leads: Lead[]): Promise<Lead[]>;
  update(id: string, lead: Partial<Lead>): Promise<Lead | null>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead | null>;
  delete(id: string): Promise<boolean>;
  search(userId: string, query: string): Promise<Lead[]>;
  findByCampaignId(campaignId: string): Promise<Lead[]>;
  find(filter?:any): Promise<Lead[]>;
  findByStatus(status: LeadStatus): Promise<Lead[]>;
} 