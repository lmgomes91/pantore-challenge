import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './updateUser.useCase';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/user/domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/user/infrastructure/controllers/dtos/updateUser.dto';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let userRepository: UserRepository;
  let securityConfigService: SecurityConfigService;
  let bcryptHashSpy: jest.SpyInstance;

  beforeEach(async () => {
    const userRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const securityConfigServiceMock = {
      getSaltRounds: jest.fn().mockReturnValue(10),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: SecurityConfigService, useValue: securityConfigServiceMock },
      ],
    }).compile();

    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    securityConfigService = module.get<SecurityConfigService>(SecurityConfigService);
    bcryptHashSpy = jest.spyOn(bcrypt, 'hash');
  });

  it('should be defined', () => {
    expect(updateUserUseCase).toBeDefined();
  });

  it('should update a user successfully if user exists and data is valid', async () => {
    const userId = 'someId';
    const existingUser = new User(userId, 'Old Name', 'old@example.com', 'oldHash', 'client');
    const updateUserDto: UpdateUserDto = { name: 'New Name', email: 'new@example.com' };
    const updatedUserWithoutPassword: Omit<User, 'password'> = { id: userId, name: 'New Name', email: 'new@example.com', role: 'client' };

    (userRepository.findById as jest.Mock).mockResolvedValue(existingUser);
    (userRepository.update as jest.Mock).mockResolvedValue(updatedUserWithoutPassword);

    const result = await updateUserUseCase.execute(userId, updateUserDto);
    expect(result).toEqual(updatedUserWithoutPassword);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.update).toHaveBeenCalledWith(userId, { ...updateUserDto });
  });

  it('should update a user\'s password if provided in the DTO', async () => {
    const userId = 'someId';
    const existingUser = new User(userId, 'Test User', 'test@example.com', 'oldHash', 'client');
    const updateUserDto: UpdateUserDto = { password: 'newPassword' };
    const hashedPassword = 'hashedNewPassword';
    const updatedUserWithoutPassword: Omit<User, 'password'> = { id: userId, name: 'Test User', email: 'test@example.com', role: 'client' };

    (userRepository.findById as jest.Mock).mockResolvedValue(existingUser);
    (userRepository.update as jest.Mock).mockResolvedValue(updatedUserWithoutPassword);
    (securityConfigService.getSaltRounds as jest.Mock).mockReturnValue(10);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

    const result = await updateUserUseCase.execute(userId, updateUserDto);
    expect(result).toEqual(updatedUserWithoutPassword);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    expect(userRepository.update).toHaveBeenCalledWith(userId, { password: hashedPassword });
  });

  it('should throw NotFoundException if the user does not exist (findById returns null)', async () => {
    const userId = 'nonExistingId';
    const updateUserDto: UpdateUserDto = { name: 'New Name' };
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(updateUserUseCase.execute(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if the user exists but update operation fails (update returns null)', async () => {
    const userId = 'someId';
    const existingUser = new User(userId, 'Old Name', 'old@example.com', 'oldHash', 'client');
    const updateUserDto: UpdateUserDto = { name: 'New Name' };

    (userRepository.findById as jest.Mock).mockResolvedValue(existingUser);
    (userRepository.update as jest.Mock).mockResolvedValue(null);

    await expect(updateUserUseCase.execute(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.update).toHaveBeenCalledWith(userId, { ...updateUserDto });
  });

  it('should re-throw any error from userRepository.findById', async () => {
    const userId = 'someId';
    const updateUserDto: UpdateUserDto = { name: 'New Name' };
    const error = new Error('Database error');
    (userRepository.findById as jest.Mock).mockRejectedValue(error);

    await expect(updateUserUseCase.execute(userId, updateUserDto)).rejects.toThrow(error);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('should re-throw any error from userRepository.update', async () => {
    const userId = 'someId';
    const existingUser = new User(userId, 'Old Name', 'old@example.com', 'oldHash', 'client');
    const updateUserDto: UpdateUserDto = { name: 'New Name' };
    const error = new Error('Database update error');

    (userRepository.findById as jest.Mock).mockResolvedValue(existingUser);
    (userRepository.update as jest.Mock).mockRejectedValue(error);

    await expect(updateUserUseCase.execute(userId, updateUserDto)).rejects.toThrow(error);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.update).toHaveBeenCalledWith(userId, { name: 'New Name' });
  });
});