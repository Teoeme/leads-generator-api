import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserModel, UserDocument } from '../../models/UserModel';

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).lean();
    if (!user) return null;
    return this.mapToUser(user as UserDocument);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return null;
    return this.mapToUser(user as UserDocument);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return null;
    return this.mapToUser(user as UserDocument);
  }

  async create(user: User): Promise<User> {
    const newUser = new UserModel({
      username: user.username,
      email: user.email,
      password: user.password
    });
    await newUser.save();
    return this.mapToUser(newUser);
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, user, { new: true }).lean();
    if (!updatedUser) return null;
    return this.mapToUser(updatedUser as UserDocument);
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  private mapToUser(user: UserDocument | any): User {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
} 