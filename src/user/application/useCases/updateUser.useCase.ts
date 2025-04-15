import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import { UpdateUserDto } from 'src/user/infrastructure/controllers/dtos/updateUser.dto';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
    private readonly securityConfigService: SecurityConfigService,

  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'> | null> {
    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }

      const updatedUserData: Partial<User> = { ...updateUserDto };
      delete updatedUserData.role;

      if (updateUserDto.password) {
        updatedUserData.password = await bcrypt.hash(
          updateUserDto.password,
          this.securityConfigService.getSaltRounds()
        );
      }

      const updatedUser = await this.userRepository.update(id, updatedUserData);

      if (!updatedUser) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;

    } catch (error) {
      console.error('Error in UpdateUserUseCase:', error);
      throw error;
    }
  }
}