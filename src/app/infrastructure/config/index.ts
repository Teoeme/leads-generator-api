import dotenv from 'dotenv';
import { StringValue } from 'ms';
import { MongoUserRepository } from '../repositories/mongodb/MongoUserRepository';
import bcrypt from 'bcrypt';

//Si estamos en desarrollo, usamos el archivo .env.development
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config();
}

const initializeData = async () => {
  const userRepository = new MongoUserRepository();
  const initialUsers=JSON.parse(process.env.INITIAL_USERS || '[]');

  try {
    for (const user of initialUsers) {
       // Hash password
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(user.password, salt);
      await userRepository.create({...user, password: hashedPassword});
    }
  } catch (error) {
    console.log('Error initializing data:', error);
  }
}

export {initializeData}

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