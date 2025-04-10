import mongoose, { Schema, Document } from 'mongoose';
import { ProxyConfiguration, ProxyProtocol, ProxyStatus } from '../../../../domain/entities/Proxy/ProxyConfiguration';

// Extender la interfaz con Document de Mongoose
export type ProxyConfigurationDocument = Omit<ProxyConfiguration, 'id'> & Document;

// Crear el esquema
const ProxyConfigurationSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    server: { 
      type: String, 
      required: true,
      trim: true 
    },
    username: { 
      type: String,
      trim: true 
    },
    password: { 
      type: String
    },
    protocol: { 
      type: String, 
      enum: Object.values(ProxyProtocol),
      default: ProxyProtocol.HTTP,
      required: true
    },
    status: { 
      type: String, 
      enum: Object.values(ProxyStatus),
      default: ProxyStatus.INACTIVE,
      required: true
    },
    country: { 
      type: String,
      trim: true 
    },
    lastChecked: { 
      type: Date 
    },
    ip: { 
      type: String,
      trim: true 
    },
    responseTime: { 
      type: Number 
    },
    successRate: { 
      type: Number,
      min: 0,
      max: 100 
    },
    notes: { 
      type: String 
    },
    tags: [{ 
      type: String,
      trim: true 
    }],
    usageCount: { 
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    versionKey: false // No incluir __v de control de versiones
  }
);

// Crear índices para búsquedas eficientes
ProxyConfigurationSchema.index({ server: 1 }, { unique: true });
ProxyConfigurationSchema.index({ status: 1 });
ProxyConfigurationSchema.index({ country: 1 });
ProxyConfigurationSchema.index({ tags: 1 });

// Crear el modelo
export const ProxyConfigurationModel = mongoose.model<ProxyConfigurationDocument>(
  'ProxyConfiguration',
  ProxyConfigurationSchema
); 