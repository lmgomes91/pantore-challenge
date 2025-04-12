import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepositoryInterface } from './interfaces/user.repository.interface';
import { User as UserEntity } from 'src/domain/entities/user.entity';
import { UserDocument, UserSchemaDefinition } from 'src/user/schemas/user.schema';
import { UserRole } from 'src/user/enums/userRole.enum';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const createdUser = new this.userModel(user);
    await createdUser.save();
    return createdUser.toObject() as UserEntity;
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity | null> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
    return updatedUser ? updatedUser.toObject() as UserEntity : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? user.toObject() as UserEntity : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? user.toObject() as UserEntity : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => user.toObject() as UserEntity);
  }

  async filter(criteria: Partial<UserEntity>): Promise<UserEntity[]> {
    const users = await this.userModel.find(criteria).exec();
    return users.map(user => user.toObject() as UserEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result
  }

  async updateRole(id: string, role: UserRole): Promise<UserEntity | null> {
    const user = await this.userModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
    return user ? user.toObject() as UserEntity : null;
  }
}