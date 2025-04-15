import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './deleteUser.useCase';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const userRepositoryMock = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        { provide: UserRepository, useValue: userRepositoryMock },
      ],
    }).compile();

    deleteUserUseCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(deleteUserUseCase).toBeDefined();
  });

  it('should delete a user successfully if user exists', async () => {
    const userId = 'someId';
    (userRepository.findById as jest.Mock).mockResolvedValue({});
    (userRepository.delete as jest.Mock).mockResolvedValue(true);

    await expect(deleteUserUseCase.execute(userId)).resolves.toBeUndefined();
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).toHaveBeenCalledWith(userId);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const userId = 'nonExistingId';
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if userRepository.delete fails', async () => {
    const userId = 'someId';
    (userRepository.findById as jest.Mock).mockResolvedValue({});
    (userRepository.delete as jest.Mock).mockResolvedValue(false);

    await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).toHaveBeenCalledWith(userId);
  });

  it('should re-throw any other error from userRepository.findById', async () => {
    const userId = 'someId';
    const error = new Error('Database error');
    (userRepository.findById as jest.Mock).mockRejectedValue(error);

    await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(error);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('should re-throw any other error from userRepository.delete', async () => {
    const userId = 'someId';
    const error = new Error('Database delete error');
    (userRepository.findById as jest.Mock).mockResolvedValue({});
    (userRepository.delete as jest.Mock).mockRejectedValue(error);

    await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(error);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).toHaveBeenCalledWith(userId);
  });
});