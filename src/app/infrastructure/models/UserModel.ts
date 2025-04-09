import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../domain/entities/User';

// Definimos una interfaz que extiende Document pero con las propiedades de User
export interface UserDocument extends Omit<User, 'id'>, Document {
  // Document ya tiene _id, así que omitimos id de User
}

const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

// Exportamos el modelo
export const UserModel = mongoose.model<UserDocument>('User', UserSchema); 