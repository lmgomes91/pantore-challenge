import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt'; 
import { CreateUserDto } from 'src/infrastructure/controllers/dtos/createUser.dto';
import { SecurityConfigService } from 'src/config/securityConfig.service';
import { UserRepository } from 'src/infrastructure/repositories/user.repository';
import { v4 } from 'uuid';

@Injectable()
export class CreateUserUseCase {
  
  constructor(
    @Inject()
    private readonly userRepository: UserRepository,
    private readonly securityConfigService: SecurityConfigService,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
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
      createUserDto.role,
    );

    return this.userRepository.create(newUser);
  }
}