import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from 'src/infrastructure/controllers/dtos/createUser.dto';
import { User } from 'src/domain/entities/user.entity';
import { UserRole } from './enums/userRole.enum';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel({ ...createUserDto, userId: uuidv4() });
    newUser.password = await bcrypt.hash(newUser.password, await bcrypt.genSalt());
    return newUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userModel.find({ role: role }).exec();
  }

}