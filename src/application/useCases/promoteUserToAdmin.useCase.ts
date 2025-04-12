import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'src/infrastructure/repositories/user.repository';
import { UserRole } from 'src/user/enums/userRole.enum';

@Injectable()
export class PromoteUserToAdminUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException(`User with ID "${id}" is already an administrator.`);
    }
    await this.userRepository.updateRole(id, UserRole.ADMIN);
  }
}