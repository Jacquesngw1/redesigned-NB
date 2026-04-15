import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import {
  IUser,
  UserRole,
  CreateUserInput,
  UpdateUserInput,
  validateEmail,
  validatePassword,
} from '../models/User';

export interface UserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  create(user: IUser): Promise<IUser>;
  update(id: string, data: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}

export class UserService {
  constructor(private repository: UserRepository) {}

  async getUserById(id: string): Promise<IUser | null> {
    if (!id) {
      throw new Error('User ID is required');
    }
    return this.repository.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    if (!email) {
      throw new Error('Email is required');
    }
    return this.repository.findByEmail(email);
  }

  async getAllUsers(): Promise<IUser[]> {
    return this.repository.findAll();
  }

  async createUser(input: CreateUserInput): Promise<IUser> {
    if (!validateEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    const existingUser = await this.repository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const now = new Date();
    const user: IUser = {
      id: uuidv4(),
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      passwordHash,
      role: input.role || UserRole.USER,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(user);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<IUser> {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (input.email) {
      if (!validateEmail(input.email)) {
        throw new Error('Invalid email format');
      }
      const emailUser = await this.repository.findByEmail(input.email);
      if (emailUser && emailUser.id !== id) {
        throw new Error('Email is already in use by another user');
      }
    }

    const updateData: Partial<IUser> = {
      ...input,
      updatedAt: new Date(),
    };

    if (input.email) {
      updateData.email = input.email.toLowerCase().trim();
    }
    if (input.name) {
      updateData.name = input.name.trim();
    }

    const updatedUser = await this.repository.update(id, updateData);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    return this.repository.delete(id);
  }

  async verifyPassword(email: string, password: string): Promise<IUser | null> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    return isMatch ? user : null;
  }
}
