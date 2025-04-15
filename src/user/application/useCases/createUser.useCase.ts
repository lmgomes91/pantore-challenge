import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import { v4 } from 'uuid';
import { UserRole } from 'src/user/enums/userRole.enum';
import { CreateUserDto } from 'src/user/infrastructure/controllers/dtos/createUser.dto';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

@Injectable()
export class CreateUserUseCase {

  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
    private readonly securityConfigService: SecurityConfigService,
  ) { }

  async execute(createUserDto: CreateUserDto): Promise<User> {
    try {
      console.log('CreateUserUseCase.execute called with:', createUserDto);
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        this.securityConfigService.getSaltRounds()
      );

      const id = v4();

      const newUser = new User(
        id,
        createUserDto.name,
        createUserDto.email,
        hashedPassword,
        UserRole.CLIENT,
      );
      return await this.userRepository.create(newUser);
    } catch (error) {
      console.error('Error in CreateUserUseCase:', error);
      throw error;
    }
  }
}