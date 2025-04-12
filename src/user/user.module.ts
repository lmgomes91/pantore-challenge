import { Module } from '@nestjs/common';
import { UserController } from '../infrastructure/controllers/user.controller';
import { CreateUserUseCase } from '../application/useCases/createUser.useCase';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { FilterUsersUseCase } from 'src/application/useCases/filterUsers.useCase';
import { GetUserUseCase } from 'src/application/useCases/getUser.useCase';
import { UpdateUserUseCase } from 'src/application/useCases/updateUser.useCase';
import { SecurityConfigService } from 'src/config/securityConfig.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { DeleteUserUseCase } from 'src/application/useCases/deleteUser.useCase';
import { UserService } from './user.service';
import { User } from 'src/domain/entities/user.entity';
import { PromoteUserToAdminUseCase } from 'src/application/useCases/promoteUserToAdmin.useCase';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserUseCase,
    FilterUsersUseCase,
    UserRepository,
    SecurityConfigService,
    DeleteUserUseCase,
    PromoteUserToAdminUseCase,
    UserService
  ],
  exports: [UserService],
})
export class UserModule {}