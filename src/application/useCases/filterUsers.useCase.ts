import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from 'src/infrastructure/repositories/user.repository';

@Injectable()
export class FilterUsersUseCase {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
  ) {}

  async execute(criteria: Partial<User>): Promise<User[]> {
    return this.userRepository.filter(criteria);
  }
}