import { Test, TestingModule } from '@nestjs/testing';
import { FilterUsersUseCase } from './filterUsers.useCase';
import { User } from 'src/user/domain/entities/user.entity';
import { UserRepository } from 'src/user/infrastructure/repositories/user.repository';

describe('FilterUsersUseCase', () => {
  let filterUsersUseCase: FilterUsersUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const userRepositoryMock = {
      filter: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterUsersUseCase,
        { provide: UserRepository, useValue: userRepositoryMock },
      ],
    }).compile();

    filterUsersUseCase = module.get<FilterUsersUseCase>(FilterUsersUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(filterUsersUseCase).toBeDefined();
  });

  it('should call userRepository.filter with the provided criteria and return users without passwords', async () => {
    const criteria: Partial<User> = { name: 'Test', role: 'client' };
    const mockUsersWithPassword: User[] = [
      new User('1', 'Test User', 'test@example.com', 'hashed1', 'client'),
      new User('2', 'Another User', 'another@example.com', 'hashed2', 'client'),
    ];
    const expectedUsersWithoutPassword: Omit<User, 'password'>[] = [
      { id: '1', name: 'Test User', email: 'test@example.com', role: 'client' },
      { id: '2', name: 'Another User', email: 'another@example.com', role: 'client' },
    ];
    (userRepository.filter as jest.Mock).mockResolvedValue(mockUsersWithPassword);

    const result = await filterUsersUseCase.execute(criteria);
    expect(result).toEqual(expectedUsersWithoutPassword);
    expect(userRepository.filter).toHaveBeenCalledWith(criteria);
  });

  it('should call userRepository.filter even with empty criteria and return users without passwords', async () => {
    const criteria: Partial<User> = {};
    const mockUsersWithPassword: User[] = [
      new User('1', 'User A', 'a@example.com', 'hashedA', 'admin'),
      new User('2', 'User B', 'b@example.com', 'hashedB', 'client'),
    ];
    const expectedUsersWithoutPassword: Omit<User, 'password'>[] = [
      { id: '1', name: 'User A', email: 'a@example.com', role: 'admin' },
      { id: '2', name: 'User B', email: 'b@example.com', role: 'client' },
    ];
    (userRepository.filter as jest.Mock).mockResolvedValue(mockUsersWithPassword);

    const result = await filterUsersUseCase.execute(criteria);
    expect(result).toEqual(expectedUsersWithoutPassword);
    expect(userRepository.filter).toHaveBeenCalledWith(criteria);
  });

  it('should return an empty array if userRepository.filter returns an empty array', async () => {
    const criteria: Partial<User> = { name: 'NonExistent' };
    (userRepository.filter as jest.Mock).mockResolvedValue([]);

    const result = await filterUsersUseCase.execute(criteria);
    expect(result).toEqual([]);
    expect(userRepository.filter).toHaveBeenCalledWith(criteria);
  });

  it('should re-throw any error from userRepository.filter', async () => {
    const criteria: Partial<User> = { name: 'Test' };
    const error = new Error('Database filter error');
    (userRepository.filter as jest.Mock).mockRejectedValue(error);

    await expect(filterUsersUseCase.execute(criteria)).rejects.toThrow(error);
    expect(userRepository.filter).toHaveBeenCalledWith(criteria);
  });
});