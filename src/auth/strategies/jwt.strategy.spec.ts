import { JwtStrategy } from './jwt.strategy';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import { AuthUserRepository } from '../infrastructure/repositories/authUser.repository';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let securityConfigService: SecurityConfigService;
  let authUserRepository: AuthUserRepository;

  const mockSecurityConfigService = {
    getJwtSecret: jest.fn().mockReturnValue('test-secret'),
  };

  const mockAuthUserRepository = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: SecurityConfigService, useValue: mockSecurityConfigService },
        { provide: AuthUserRepository, useValue: mockAuthUserRepository },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    securityConfigService = module.get<SecurityConfigService>(SecurityConfigService);
    authUserRepository = module.get<AuthUserRepository>(AuthUserRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should call authUserRepository.findByEmail with the email from the payload', async () => {
    const mockPayload = { email: 'test@example.com', sub: 'userId', role: 'client' };
    await jwtStrategy.validate(mockPayload);
    expect(authUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should return the user if findByEmail returns a user', async () => {
    const mockPayload = { email: 'test@example.com', sub: 'userId', role: 'client' };
    const mockUser = { id: 'userId', email: 'test@example.com', role: 'client' };
    mockAuthUserRepository.findByEmail.mockResolvedValue(mockUser);
    const user = await jwtStrategy.validate(mockPayload);
    expect(user).toEqual(mockUser);
  });

  it('should return null if findByEmail returns null', async () => {
    const mockPayload = { email: 'nonexistent@example.com', sub: 'userId', role: 'client' };
    mockAuthUserRepository.findByEmail.mockResolvedValue(null);
    const user = await jwtStrategy.validate(mockPayload);
    expect(user).toBeNull();
  });

  it('should handle errors thrown by authUserRepository.findByEmail', async () => {
    const mockPayload = { email: 'error@example.com', sub: 'userId', role: 'client' };
    const mockError = new Error('Database error');
    mockAuthUserRepository.findByEmail.mockRejectedValue(mockError);
    await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(mockError);
  });
});