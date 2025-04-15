import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/useCases/createUser.useCase';
import { FilterUsersUseCase } from 'src/user/application/useCases/filterUsers.useCase';
import { GetUserUseCase } from 'src/user/application/useCases/getUser.useCase';
import { UpdateUserUseCase } from 'src/user/application/useCases/updateUser.useCase';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { DeleteUserUseCase } from 'src/user/application/useCases/deleteUser.useCase';
import { User } from 'src/user/domain/entities/user.entity';
import { PromoteUserToAdminUseCase } from 'src/user/application/useCases/promoteUserToAdmin.useCase';
import { UserController } from './infrastructure/controllers/user.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';

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
  ],
  exports: [],
})
export class UserModule {}