import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from 'src/infrastructure/repositories/user.repository';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}