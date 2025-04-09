import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserDocument } from '../../models/UserModel';


const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export class UserRepositoryImpl implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return UserModel.findById(id).lean();
  }

  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email }).lean();
  }

  async findByUsername(username: string): Promise<User | null> {
    return UserModel.findOne({ username }).lean();
  }

  async create(user: User): Promise<User> {
    const newUser = new UserModel(user);
    await newUser.save();
    return newUser.toObject();
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    return UserModel.findByIdAndUpdate(id, user, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
} 