import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthUser } from 'src/auth/domain/entities/authUser.entity';
import { AuthUserRole } from 'src/auth/enums/authUserRole.enum';
import { AuthUserRepositoryInterface } from './interfaces/authUser.repository.interface';
import { AuthUserDocument } from 'src/auth/schemas/authUser.schema';

@Injectable()
export class AuthUserRepository implements AuthUserRepositoryInterface{
  constructor(
    @InjectModel(AuthUser.name) private readonly userModel: Model<AuthUserDocument>
  ) {}

  async create(userData: Partial<AuthUser>): Promise<AuthUser> {
    const newUser = new this.userModel(userData);
    await newUser.save();

    return newUser.toObject() as AuthUser;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? (user.toObject() as AuthUser) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? (user.toObject() as AuthUser) : null;
  }

    async findByRole(role: AuthUserRole): Promise<AuthUser[]> {
    const users = await this.userModel.find({ role: role }).exec();
    return users.map(user => user.toObject() as AuthUser);
  }
}