import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from './user.controller';
import { CreateUserUseCase } from 'src/user/application/useCases/createUser.useCase';
import { UpdateUserUseCase } from 'src/user/application/useCases/updateUser.useCase';
import { GetUserUseCase } from 'src/user/application/useCases/getUser.useCase';
import { FilterUsersUseCase } from 'src/user/application/useCases/filterUsers.useCase';
import { DeleteUserUseCase } from 'src/user/application/useCases/deleteUser.useCase';
import { PromoteUserToAdminUseCase } from 'src/user/application/useCases/promoteUserToAdmin.useCase';
import { User } from 'src/user/domain/entities/user.entity';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/enums/userRole.enum';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  const mockCreateUserUseCase = { execute: jest.fn().mockResolvedValue(new User('someId', 'Test User', 'test@example.com', 'hashedPassword', 'client')) };
  const mockUpdateUserUseCase = { execute: jest.fn().mockResolvedValue(new User('updatedId', 'Updated User', 'updated@example.com', 'newPassword', 'client')) };
  const mockGetUserUseCase = {
    findById: jest.fn().mockResolvedValue(new User('someId', 'Test User', 'test@example.com', 'hashedPassword', 'client')),
    findAll: jest.fn().mockResolvedValue([
      new User('someId', 'Test User', 'test@example.com', 'hashedPassword', 'client'),
      new User('anotherId', 'Another User', 'another@example.com', 'otherPassword', 'admin'),
    ]),
  };
  const mockFilterUsersUseCase = { execute: jest.fn().mockResolvedValue([new User('filteredId', 'Filtered User', 'filtered@example.com', 'filterPass', 'client')]) };
  const mockDeleteUserUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
  const mockPromoteUserToAdminUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
  const mockJwtAuthGuard = { canActivate: () => true };
  const mockRolesGuard = { canActivate: () => true };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
        { provide: UpdateUserUseCase, useValue: mockUpdateUserUseCase },
        { provide: GetUserUseCase, useValue: mockGetUserUseCase },
        { provide: FilterUsersUseCase, useValue: mockFilterUsersUseCase },
        { provide: DeleteUserUseCase, useValue: mockDeleteUserUseCase },
        { provide: PromoteUserToAdminUseCase, useValue: mockPromoteUserToAdminUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    const createUserDto: CreateUserDto = { name: 'Test User', email: 'test@example.com', password: 'securePassword' };
    it('should create a new user and return it', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED)
        .expect((response) => expect(response.body).toEqual(expect.objectContaining({ id: expect.any(String), name: createUserDto.name, email: createUserDto.email, role: UserRole.CLIENT })));
    });
  });

  describe('PUT /users/:id', () => {
    const updateUserDto: UpdateUserDto = { name: 'Updated User', email: 'updated@example.com', role: 'client' };
    it('should update a user and return it', async () => {
      return request(app.getHttpServer())
        .put('/users/someId')
        .send(updateUserDto)
        .expect(HttpStatus.OK)
        .expect((response) => expect(response.body).toEqual(expect.objectContaining({ id: 'updatedId', name: updateUserDto.name, email: updateUserDto.email, role: updateUserDto.role })));
    });
  });

  describe('GET /users/:id', () => {
    it('should find a user by id and return it', async () => {
      return request(app.getHttpServer())
        .get('/users/someId')
        .expect(HttpStatus.OK)
        .expect((response) => expect(response.body).toEqual(expect.objectContaining({ id: 'someId', name: 'Test User', email: 'test@example.com', role: 'client' })));
    });
  });

  describe('GET /users', () => {
    it('should return a list of users', async () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.OK)
        .expect((response) => expect(response.body).toHaveLength(2));
    });

    it('should filter users based on query parameters', async () => {
      return request(app.getHttpServer())
        .get('/users?name=Filtered User')
        .expect(HttpStatus.OK)
        .expect((response) => expect(response.body).toHaveLength(1));
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user and return no content', async () => {
      return request(app.getHttpServer())
        .delete('/users/someId')
        .expect(HttpStatus.OK);
    });
  });

  describe('POST /users/promote/:id', () => {
    it('should promote a user to admin', async () => {
      (mockPromoteUserToAdminUseCase.execute as jest.Mock).mockResolvedValue(undefined);
      return request(app.getHttpServer())
        .post('/users/promote/successId')
        .expect(HttpStatus.OK)
        .expect((response) => expect(response.body).toEqual({ message: 'User with ID successId promoted to administrator.' }));
    });

    it('should return a message indicating failure when the use case throws an error', async () => {
      (mockPromoteUserToAdminUseCase.execute as jest.Mock).mockRejectedValue(new Error('Failed to promote user in use case'));
      return request(app.getHttpServer())
        .post('/users/promote/errorId')
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body).toEqual({ message: 'Failed to promote user in use case' });
        });
    });

    it('should return a generic failure message if the use case error has no message', async () => {
      (mockPromoteUserToAdminUseCase.execute as jest.Mock).mockRejectedValue(new Error());
      return request(app.getHttpServer())
        .post('/users/promote/anotherErrorId')
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body).toEqual({ message: 'Failed to promote user.' });
        });
    });
  });
});