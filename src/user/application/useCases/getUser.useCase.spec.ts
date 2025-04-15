import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase } from './getUser.useCase';
import { User } from 'src/user/domain/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const userRepositoryMock = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        { provide: UserRepository, useValue: userRepositoryMock },
      ],
    }).compile();

    getUserUseCase = module.get<GetUserUseCase>(GetUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(getUserUseCase).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user if found by id', async () => {
      const userId = 'someId';
      // const expectedUser = new User(userId, 'Test User', 'test@example.com', 'hashed', 'client');
      const expectedUser: Omit<User, 'password'> = { id: userId, name: 'Test User', email: 'test@example.com', role: 'client' };
      
      (userRepository.findById as jest.Mock).mockResolvedValue(expectedUser);

      const result = await getUserUseCase.findById(userId);
      expect(result).toEqual(expectedUser);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return null if user is not found by id', async () => {
      const userId = 'nonExistingId';
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(getUserUseCase.findById(userId)).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user is not found and exception is desired', async () => {
      const userId = 'nonExistingId';
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(getUserUseCase.findById(userId)).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should re-throw any error from userRepository.findById', async () => {
      const userId = 'someId';
      const error = new Error('Database error');
      (userRepository.findById as jest.Mock).mockRejectedValue(error);

      await expect(getUserUseCase.findById(userId)).rejects.toThrow(error);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers: Omit<User, 'password'>[] = [
        { id: '1', name: 'User 1', email: 'user1@example.com', role: 'client' },
        { id: '2', name: 'User 2', email: 'user2@example.com', role: 'admin' },
      ];
      (userRepository.findAll as jest.Mock).mockResolvedValue(expectedUsers);

      const result = await getUserUseCase.findAll();
      expect(result).toEqual(expectedUsers);
      expect(userRepository.findAll).toHaveBeenCalled();
    });

    it('should return an empty array if no users exist', async () => {
      (userRepository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await getUserUseCase.findAll();
      expect(result).toEqual([]);
      expect(userRepository.findAll).toHaveBeenCalled();
    });

    it('should re-throw any error from userRepository.findAll', async () => {
      const error = new Error('Database error');
      (userRepository.findAll as jest.Mock).mockRejectedValue(error);

      await expect(getUserUseCase.findAll()).rejects.toThrow(error);
      expect(userRepository.findAll).toHaveBeenCalled();
    });
  });
});