import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthUserRepository } from '../infrastructure/repositories/authUser.repository';
import { JwtService } from '@nestjs/jwt';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import * as bcrypt from 'bcrypt';
import { AuthUserRole } from '../enums/authUserRole.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let authUserRepository: AuthUserRepository;
  let jwtService: JwtService;
  let securityConfigService: SecurityConfigService;

  const mockAuthUserRepository = {
    findByRole: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockSecurityConfigService = {
    getFirstAdminEmail: jest.fn(),
    getFirstAdminPassword: jest.fn(),
  };

  const mockBcryptHash = jest.fn();
  const mockBcryptCompare = jest.fn();
  const mockBcryptGenSalt = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthUserRepository, useValue: mockAuthUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: SecurityConfigService, useValue: mockSecurityConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authUserRepository = module.get<AuthUserRepository>(AuthUserRepository);
    jwtService = module.get<JwtService>(JwtService);
    securityConfigService = module.get<SecurityConfigService>(SecurityConfigService);

    jest.spyOn(bcrypt, 'hash').mockImplementation(mockBcryptHash);
    jest.spyOn(bcrypt, 'compare').mockImplementation(mockBcryptCompare);
    jest.spyOn(bcrypt, 'genSalt').mockImplementation(mockBcryptGenSalt);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create the first admin if none exists', async () => {
      mockAuthUserRepository.findByRole.mockResolvedValue([]);
      mockSecurityConfigService.getFirstAdminEmail.mockReturnValue('admin@example.com');
      mockSecurityConfigService.getFirstAdminPassword.mockReturnValue('admin123');
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashedAdminPassword');
      mockAuthUserRepository.create.mockResolvedValue({ id: 'adminId', email: 'admin@example.com', role: AuthUserRole.ADMIN, name: 'First Admin' });

      await authService.onModuleInit();

      expect(mockAuthUserRepository.findByRole).toHaveBeenCalledWith(AuthUserRole.ADMIN);
      expect(mockSecurityConfigService.getFirstAdminEmail).toHaveBeenCalled();
      expect(mockSecurityConfigService.getFirstAdminPassword).toHaveBeenCalled();
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 'salt');
      expect(mockAuthUserRepository.create).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'hashedAdminPassword',
        role: AuthUserRole.ADMIN,
        name: 'First Admin',
      });
    });

    it('should not create the first admin if one already exists', async () => {
      mockAuthUserRepository.findByRole.mockResolvedValue([{ id: 'existingAdminId' }]);

      await authService.onModuleInit();

      expect(mockAuthUserRepository.findByRole).toHaveBeenCalledWith(AuthUserRole.ADMIN);
      expect(mockSecurityConfigService.getFirstAdminEmail).not.toHaveBeenCalled();
      expect(mockSecurityConfigService.getFirstAdminPassword).not.toHaveBeenCalled();
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockAuthUserRepository.create).not.toHaveBeenCalled();
    });

    it('should handle missing first admin credentials', async () => {
      mockAuthUserRepository.findByRole.mockResolvedValue([]);
      mockSecurityConfigService.getFirstAdminEmail.mockReturnValue(undefined);
      mockSecurityConfigService.getFirstAdminPassword.mockReturnValue('admin123');

      const consoleWarnSpy = jest.spyOn(console, 'warn');
      await authService.onModuleInit();

      expect(mockAuthUserRepository.findByRole).toHaveBeenCalledWith(AuthUserRole.ADMIN);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Environment variables FIRST_ADMIN_EMAIL or FIRST_ADMIN_PASSWORD not defined.');
      expect(mockAuthUserRepository.create).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle errors during first admin creation', async () => {
      mockAuthUserRepository.findByRole.mockResolvedValue([]);
      mockSecurityConfigService.getFirstAdminEmail.mockReturnValue('admin@example.com');
      mockSecurityConfigService.getFirstAdminPassword.mockReturnValue('admin123');
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashedAdminPassword');
      mockAuthUserRepository.create.mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = jest.spyOn(console, 'error');
      await authService.onModuleInit();

      expect(mockAuthUserRepository.findByRole).toHaveBeenCalledWith(AuthUserRole.ADMIN);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating the first administrator:', new Error('Database error'));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('validateUser', () => {
    it('should return the user without password if email and password match', async () => {
      const mockUser = { id: 'userId', email: 'test@example.com', password: 'hashedPassword', role: AuthUserRole.CLIENT, name: 'Test User' };
      mockAuthUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(mockAuthUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(result).toEqual({ id: 'userId', email: 'test@example.com', role: AuthUserRole.CLIENT, name: 'Test User' });
    });

    it('should return null if user is not found by email', async () => {
      mockAuthUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser('nonexistent@example.com', 'password');

      expect(mockAuthUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const mockUser = { id: 'userId', email: 'test@example.com', password: 'hashedPassword', role: AuthUserRole.CLIENT, name: 'Test User' };
      mockAuthUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(false);

      const result = await authService.validateUser('test@example.com', 'wrongPassword');

      expect(mockAuthUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      expect(result).toBeNull();
    });

    it('should handle errors during user validation', async () => {
      mockAuthUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(authService.validateUser('test@example.com', 'password')).rejects.toThrow('Database error');

      expect(mockAuthUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser = { id: 'userId', email: 'test@example.com', role: AuthUserRole.CLIENT };
      const mockToken = 'mockAccessToken';
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await authService.login(mockUser);

      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'userId', email: 'test@example.com', role: AuthUserRole.CLIENT });
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should handle errors during token generation', async () => {
      const mockUser = { id: 'userId', email: 'test@example.com', role: AuthUserRole.CLIENT };
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT error'));

      await expect(authService.login(mockUser)).rejects.toThrow('JWT error');

      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'userId', email: 'test@example.com', role: AuthUserRole.CLIENT });
    });
  });
});