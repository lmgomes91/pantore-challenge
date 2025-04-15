import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole } from 'src/user/enums/userRole.enum';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

@Injectable()
export class PromoteUserToAdminUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      if (user.role === UserRole.ADMIN) {
        throw new BadRequestException(`User with ID "${id}" is already an administrator.`);
      }
      await this.userRepository.updateRole(id, UserRole.ADMIN);
    } catch (error) {
      console.error('Error in PromoteUserToAdminUseCase:', error);
      throw error;
    }
  }
}