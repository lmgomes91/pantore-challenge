import { Controller, Post, Body, Get, Param, Query, Put, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateUserUseCase } from 'src/user/application/useCases/createUser.useCase';
import { CreateUserDto } from './dtos/createUser.dto';
import { FilterUsersUseCase } from 'src/user/application/useCases/filterUsers.useCase';
import { GetUserUseCase } from 'src/user/application/useCases/getUser.useCase';
import { UpdateUserUseCase } from 'src/user/application/useCases/updateUser.useCase';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DeleteUserUseCase } from 'src/user/application/useCases/deleteUser.useCase';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { UserRole } from 'src/user/enums/userRole.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PromoteUserToAdminUseCase } from 'src/user/application/useCases/promoteUserToAdmin.useCase';
import { User } from 'src/user/domain/entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly filterUsersUseCase: FilterUsersUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly promoteUserToAdminUseCase: PromoteUserToAdminUseCase,
  ) { }

  @Post()
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso', type: User })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID do usuário a ser atualizado' })
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso', type: User })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'> | null> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID do usuário a ser buscado' })
  @ApiOkResponse({ description: 'Usuário encontrado', type: User })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async findById(@Param('id') id: string): Promise<Omit<User, 'password'> | null> {
    return this.getUserUseCase.findById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Lista de usuários', type: [User] })
  @ApiQuery({ name: 'name', required: false, description: 'Filtrar por nome' })
  @ApiQuery({ name: 'email', required: false, description: 'Filtrar por email' })
  @ApiQuery({ name: 'role', required: false, description: 'Filtrar por função (admin ou cliente)' })
  async findAll(@Query() query: any): Promise<Omit<User, 'password'>[]> {
    console.log('Query:', query);
    if (query && Object.keys(query).length > 0) {
      return this.filterUsersUseCase.execute(query);
    }
    return this.getUserUseCase.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The user has been successfully deleted.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }

  @Post('promote/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'ID do usuário a ser promovido' })
  @ApiOkResponse({ description: 'Usuário promovido a administrador com sucesso.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @HttpCode(HttpStatus.OK)
  async promoteUserToAdmin(@Param('id') id: string) {
    try {
      await this.promoteUserToAdminUseCase.execute(id);
      return { message: `User with ID ${id} promoted to administrator.` };
    } catch (error) {
      return { message: error.message || 'Failed to promote user.' };
    }
  }

}