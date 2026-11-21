import { User, type IUser } from "../models/User.js";

export class UserRepository {
  public async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email });
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  public async findByEmailWithPassword(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email }).select("+passwordHash");
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  public async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  public async create(userData: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<IUser> {
    try {
      return await User.create(userData);
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

export const userRepository = new UserRepository();
