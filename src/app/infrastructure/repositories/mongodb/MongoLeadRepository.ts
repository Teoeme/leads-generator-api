import { Lead, LeadStatus } from '../../../domain/entities/Lead';
import { SocialMediaType } from '../../../domain/entities/SocialMediaAccount';
import { LeadRepository } from '../../../domain/repositories/LeadRepository';
import { LeadModel, LeadDocument } from '../../models/LeadModel';

export class MongoLeadRepository implements LeadRepository {
  async findById(id: string): Promise<Lead | null> {
    const lead = await LeadModel.findById(id).lean();
    if (!lead) return null;
    return this.mapToLead(lead as LeadDocument);
  }

  async find(filter?:any): Promise<Lead[]> {
    const leads = await LeadModel.find(filter).lean();
    return leads.map(lead => this.mapToLead(lead as LeadDocument));
  }

  async findByStatus( status: LeadStatus): Promise<Lead[]> {
    const leads = await LeadModel.find({ status }).lean();
    return leads.map(lead => this.mapToLead(lead as LeadDocument));
  }

  async findBySocialMediaId(socialMediaId: string): Promise<Lead | null> {
    const lead = await LeadModel.findOne({ socialMediaId }).lean();
    if (!lead) return null;
    return this.mapToLead(lead as LeadDocument);
  }

  async create(lead: Lead): Promise<Lead> {
    // Verificar si ya existe un lead con el mismo userId y socialMediaId
    const existingLead = await LeadModel.findOne({
      userId: lead.userId,
      socialMediaType: lead.socialMediaType,
      socialMediaId: lead.socialMediaId
    }).lean();

    if (existingLead) {
      // Si ya existe, actualizamos los datos
      const updatedLead = await LeadModel.findByIdAndUpdate(
        existingLead._id,
        { ...lead, updatedAt: new Date() },
        { new: true }
      ).lean();
      
      return this.mapToLead(updatedLead as LeadDocument);
    }

    // Si no existe, creamos uno nuevo
    const newLead = new LeadModel(lead);
    await newLead.save();
    return this.mapToLead(newLead);
  }

  async createMany(leads: Lead[]): Promise<Lead[]> {
    const leadsToAdd = []

    for (const lead of leads) {
      const alreadyExists = await this.findBySocialMediaId(lead.socialMediaId);
      if (alreadyExists){
        await this.update(alreadyExists.id!, lead);
      }else{
        leadsToAdd.push(lead);
      }
    }

    const newLeads = await LeadModel.insertMany(leadsToAdd);
    return newLeads.map(lead => this.mapToLead(lead as LeadDocument));
  }

  async findBySocialMediaType(type: SocialMediaType): Promise<Lead[]> {
    const leads = await LeadModel.find({ socialMediaType: type }).lean();
    return leads.map(lead => this.mapToLead(lead as LeadDocument));
  }



  async update(id: string, lead: Partial<Lead>): Promise<Lead | null> {
    const updatedLead = await LeadModel.findByIdAndUpdate(id, lead, { new: true }).lean();
    if (!updatedLead) return null;
    return this.mapToLead(updatedLead as LeadDocument);
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
    const updatedLead = await LeadModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (!updatedLead) return null;
    return this.mapToLead(updatedLead as LeadDocument);
  }

  async delete(id: string): Promise<boolean> {
    const result = await LeadModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async search(userId: string, query: string): Promise<Lead[]> {
    const leads = await LeadModel.find({
      userId,
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { website: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).lean();
    
    return leads.map(lead => this.mapToLead(lead as LeadDocument));
  }


  async findByCampaignId(campaignId: string): Promise<Lead[]> {
    const leads = await LeadModel.find({ campaignId }).lean();
    return leads.map(lead => this.mapToLead(lead as LeadDocument));
  }

  private mapToLead(lead: LeadDocument | any): Lead {
    return {
      id: lead._id.toString(),
      userId: lead.userId,
      socialMediaType: lead.socialMediaType,
      socialMediaId: lead.socialMediaId,
      campaignId: lead.campaignId,
      username: lead.username,
      fullName: lead.fullName,
      profileUrl: lead.profileUrl,
      email: lead.email,
      phone: lead.phone,
      bio: lead.bio,
      location: lead.location,
      website: lead.website,
      followersCount: lead.followersCount,
      followingCount: lead.followingCount,
      postsCount: lead.postsCount,
      isPrivate: lead.isPrivate,
      isVerified: lead.isVerified,
      status: lead.status as LeadStatus,
      notes: lead.notes,
      tags: lead.tags,
      lastContactDate: lead.lastContactDate,
      source: lead.source,
      sourceUrl: lead.sourceUrl,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    };
  }
} 