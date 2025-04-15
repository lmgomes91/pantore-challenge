import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

@Injectable()
export class FilterUsersUseCase {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
  ) {}

  async execute(criteria: Partial<User>): Promise<Omit<User, 'password'>[]> {
    try {
      
      const users =  await this.userRepository.filter(criteria);
      
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      console.error('Error in FilterUsersUseCase:', error);
      throw error;
    }
  }
}