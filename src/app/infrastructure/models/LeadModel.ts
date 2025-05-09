import mongoose, { Schema, Document } from 'mongoose';
import { Lead, LeadStatus } from '../../domain/entities/Lead';

export interface LeadDocument extends Omit<Lead, 'id'>, Document {
  // Document ya tiene _id, así que omitimos id de Lead
}

const LeadSchema = new Schema<LeadDocument>(
  {
    userId: { type: String, required: true, index: true },
    socialMediaType: { type: String, required: true },
    socialMediaId: { type: String, required: true },
    campaignId: { type: String, required: false, ref: 'Campaign' },
    username: { type: String, required: true },
    fullName: { type: String },
    profileUrl: { type: String },
    email: { type: String },
    phone: { type: String },
    bio: { type: String },
    location: { type: String },
    website: { type: String },
    followersCount: { type: Number },
    followingCount: { type: Number },
    postsCount: { type: Number },
    isPrivate: { type: Boolean },
    isVerified: { type: Boolean },
    status: { 
      type: String, 
      required: true, 
      enum: Object.values(LeadStatus),
      default: LeadStatus.NEW
    },
    notes: { type: String },
    tags: [{ type: String }],
    lastContactDate: { type: Date },
    source: { type: String },
    sourceUrl: { type: String }
  },
  { timestamps: true }
);

LeadSchema.index({campaignId: 1})
LeadSchema.index({socialMediaType: 1})
LeadSchema.index({status: 1})

export const LeadModel = mongoose.model<LeadDocument>('Lead', LeadSchema); 