import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../services/auth.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  it('should return the user if validation is successful', async () => {
    const mockUser = { id: 'userId', email: 'test@example.com', name: 'Test User' };
    mockAuthService.validateUser.mockResolvedValue(mockUser);

    const user = await localStrategy.validate('test@example.com', 'password');

    expect(user).toEqual(mockUser);
    expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(localStrategy.validate('nonexistent@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    expect(authService.validateUser).toHaveBeenCalledWith('nonexistent@example.com', 'password');
  });

  it('should throw the error if AuthService.validateUser throws an error', async () => {
    const mockError = new Error('Database error');
    mockAuthService.validateUser.mockRejectedValue(mockError);

    await expect(localStrategy.validate('test@example.com', 'password')).rejects.toThrow(mockError);
    expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
  });
});