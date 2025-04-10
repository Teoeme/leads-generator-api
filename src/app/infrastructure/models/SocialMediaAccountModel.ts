import mongoose, { Schema, Document } from 'mongoose';
import { SocialMediaAccount, SocialMediaLastLoginStatus, SocialMediaType, SocialMediaAccountRole } from '../../domain/entities/SocialMediaAccount';

export interface SocialMediaAccountDocument extends Omit<SocialMediaAccount, 'id'>, Document {
  // Document ya tiene _id, así que omitimos id de SocialMediaAccount
}

const SocialMediaAccountSchema = new Schema<SocialMediaAccountDocument>(
  {
    userId: { type: String, required: true, index: true },
    instanceId: { type: String, required: true, index: true },
    type: { 
      type: String, 
      required: true, 
      enum: Object.values(SocialMediaType) 
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    lastLoginStatus: { type: String, enum: Object.values(SocialMediaLastLoginStatus) },
    sessionData: { type: Object },
    proxy: {
      proxyId: { type: Schema.Types.ObjectId, ref: 'ProxyConfiguration' },
      enabled: { type: Boolean, default: true }
    },
    roles: [{ 
      type: String, 
      enum: Object.values(SocialMediaAccountRole)
    }]
  },
  { timestamps: true }
);

// Índice compuesto para búsquedas por instanceId y type (no único)
SocialMediaAccountSchema.index({ instanceId: 1, type: 1 },{ unique: false });

// Índice compuesto para evitar duplicados de username por tipo en la misma instancia
// Esto permite múltiples cuentas de Instagram por instancia, pero no con el mismo username
SocialMediaAccountSchema.index({ instanceId: 1, type: 1, username: 1 }, { unique: true });

export const SocialMediaAccountModel = mongoose.model<SocialMediaAccountDocument>(
  'SocialMediaAccount', 
  SocialMediaAccountSchema
); 