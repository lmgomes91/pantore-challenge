import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
  ) {}

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error in GetUserUseCase (findById):', error);
      throw error;
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    try {
      const users = await this.userRepository.findAll();
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      console.error('Error in GetUserUseCase (findAll):', error);
      throw error;
    }
  }
}