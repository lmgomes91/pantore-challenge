import { Test, TestingModule } from '@nestjs/testing';
import { PromoteUserToAdminUseCase } from './promoteUserToAdmin.useCase';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from 'src/user/domain/entities/user.entity';
import { UserRole } from 'src/user/enums/userRole.enum';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

describe('PromoteUserToAdminUseCase', () => {
  let promoteUserToAdminUseCase: PromoteUserToAdminUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const userRepositoryMock = {
      findById: jest.fn(),
      updateRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoteUserToAdminUseCase,
        { provide: UserRepository, useValue: userRepositoryMock },
      ],
    }).compile();

    promoteUserToAdminUseCase = module.get<PromoteUserToAdminUseCase>(PromoteUserToAdminUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(promoteUserToAdminUseCase).toBeDefined();
  });

  it('should promote a user to admin if the user exists and is not already an admin', async () => {
    const userId = 'someId';
    const existingUser = new User(userId, 'Test User', 'test@example.com', 'hashed', UserRole.CLIENT);
    (userRepository.findById as jest.Mock).mockResolvedValue(existingUser);
    (userRepository.updateRole as jest.Mock).mockResolvedValue(undefined); // Assume updateRole doesn't return anything significant

    await expect(promoteUserToAdminUseCase.execute(userId)).resolves.toBeUndefined();
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.updateRole).toHaveBeenCalledWith(userId, UserRole.ADMIN);
  });

  it('should throw NotFoundException if the user does not exist', async () => {
    const userId = 'nonExistingId';
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(promoteUserToAdminUseCase.execute(userId)).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if the user is already an admin', async () => {
    const userId = 'adminId';
    const existingAdmin = new User(userId, 'Admin User', 'admin@example.com', 'hashed', UserRole.ADMIN);
    (userRepository.findById as jest.Mock).mockResolvedValue(existingAdmin);

    await expect(promoteUserToAdminUseCase.execute(userId)).rejects.toThrow(BadRequestException);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it('should re-throw any error from userRepository.findById', async () => {
    const userId = 'someId';
    const error = new Error('Database error');
    (userRepository.findById as jest.Mock).mockRejectedValue(error);

    await expect(promoteUserToAdminUseCase.execute(userId)).rejects.toThrow(error);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it('should re-throw any error from userRepository.updateRole', async () => {
    const userId = 'someId';
    const existingUser = new User(userId, 'Test User', 'test@example.com', 'hashed', UserRole.CLIENT);
    (userRepository.findById as jest.Mock).mockResolvedValue(existingUser);
    const error = new Error('Database update error');
    (userRepository.updateRole as jest.Mock).mockRejectedValue(error);

    await expect(promoteUserToAdminUseCase.execute(userId)).rejects.toThrow(error);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.updateRole).toHaveBeenCalledWith(userId, UserRole.ADMIN);
  });
});