import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { LocalAuthGuard } from './localAuth.guard';
import { LocalStrategy } from '../strategies/local.strategy';
import { Test, TestingModule } from '@nestjs/testing';

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;
  let localStrategy: LocalStrategy;

  const mockLocalStrategy = {
    validate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAuthGuard,
        { provide: LocalStrategy, useValue: mockLocalStrategy },
      ],
    }).compile();

    guard = module.get<LocalAuthGuard>(LocalAuthGuard);
    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if the strategy validates the user', async () => {
    const mockRequest = { body: { email: 'test@example.com', password: 'password' }, user: undefined };
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    mockLocalStrategy.validate.mockResolvedValue({ id: 'userId', email: 'test@example.com' });

    const canActivate = await guard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockRequest.user).toEqual({ id: 'userId', email: 'test@example.com' });
    expect(mockLocalStrategy.validate).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should throw UnauthorizedException if email or password is missing', async () => {
    const mockRequestWithoutEmail = { body: { password: 'password' } };
    const mockContextWithoutEmail: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequestWithoutEmail),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    await expect(guard.canActivate(mockContextWithoutEmail)).rejects.toThrow(UnauthorizedException);
    expect(mockLocalStrategy.validate).not.toHaveBeenCalled();

    const mockRequestWithoutPassword = { body: { email: 'test@example.com' } };
    const mockContextWithoutPassword: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequestWithoutPassword),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    await expect(guard.canActivate(mockContextWithoutPassword)).rejects.toThrow(UnauthorizedException);
    expect(mockLocalStrategy.validate).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if the strategy validation fails (returns null)', async () => {
    const mockRequest = { body: { email: 'test@example.com', password: 'wrongPassword' }, user: undefined };
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    mockLocalStrategy.validate.mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    expect(mockLocalStrategy.validate).toHaveBeenCalledWith('test@example.com', 'wrongPassword');
    expect(mockRequest.user).toBeUndefined();
  });

  it('should throw UnauthorizedException if the strategy validation throws an error', async () => {
    const mockRequest = { body: { email: 'test@example.com', password: 'password' }, user: undefined };
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    const validationError = new Error('Authentication failed');
    mockLocalStrategy.validate.mockRejectedValue(validationError);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    expect(mockLocalStrategy.validate).toHaveBeenCalledWith('test@example.com', 'password');
    expect(mockRequest.user).toBeUndefined();
  });
});