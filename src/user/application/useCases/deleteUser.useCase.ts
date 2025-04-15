import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const userExists = await this.userRepository.findById(id);
      if (!userExists) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }

      const deleted = await this.userRepository.delete(id);
      if (!deleted) {
        throw new NotFoundException(`Error when trying to delete user "${id}"`);
      }
    } catch (error) {
      console.error('Error in DeleteUserUseCase:', error);
      throw error;
    }
  }
}