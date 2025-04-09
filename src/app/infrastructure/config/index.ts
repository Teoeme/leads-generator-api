import dotenv from 'dotenv';
import { StringValue } from 'ms';

dotenv.config();

export default {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001'
  },
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/social-scraper'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d' as StringValue
  }
}; 