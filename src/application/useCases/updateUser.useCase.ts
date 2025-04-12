import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/infrastructure/controllers/dtos/updateUser.dto';
import { SecurityConfigService } from 'src/config/securityConfig.service';
import { UserRepository } from 'src/infrastructure/repositories/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
    private readonly securityConfigService: SecurityConfigService,
    
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const updatedUserData: Partial<User> = { ...updateUserDto };
    
    if (updateUserDto.password) {
      updatedUserData.password = await bcrypt.hash(
        updateUserDto.password, 
        this.securityConfigService.getSaltRounds()
      );
    }

    const updatedUser = await this.userRepository.update(id, updatedUserData);
    return updatedUser;
  }
}