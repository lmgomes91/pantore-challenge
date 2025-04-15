import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { User } from 'src/user/domain/entities/user.entity';
import { UserRole } from 'src/user/enums/userRole.enum';
import { JwtService } from '@nestjs/jwt';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from 'src/auth/services/auth.service';
import { LocalStrategy } from 'src/auth/strategies/local.strategy';
import { LoginDto } from './dtos/login.dto';
import { AuthUserRepository } from '../repositories/authUser.repository';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  const loginDto: LoginDto = { email: 'test@example.com', password: 'securePassword' };
  const mockUserEntity = new User('someId', 'Test User', loginDto.email, 'hashedPassword', UserRole.CLIENT);
  const mockAccessToken = 'mocked_access_token';

  const mockUserAuthService = {
    findByEmail: jest.fn(),
    findByRole: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue(mockUserEntity),
  };
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue(mockAccessToken),
  };
  const mockSecurityConfigService = {
    getFirstAdminEmail: jest.fn().mockReturnValue('admin@example.com'),
    getFirstAdminPassword: jest.fn().mockReturnValue('adminPassword'),
    getJwtSecret: jest.fn().mockReturnValue('testSecret'),
  };
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'security.jwtSecret') {
        return 'testSecret';
      }
      return undefined;
    }),
  };
  const mockLocalStrategy = {
    validate: jest.fn().mockResolvedValue(mockUserEntity),
  };

  const createTestingModule = async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: AuthUserRepository, useValue: mockUserAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: SecurityConfigService, useValue: mockSecurityConfigService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LocalStrategy, useValue: mockLocalStrategy },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  };

  beforeEach(async () => {
    await createTestingModule();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should successfully login and return an access token', async () => {
    const localStrategyMock = app.get<LocalStrategy>(LocalStrategy) as any;
    (localStrategyMock.validate as jest.Mock).mockResolvedValue(mockUserEntity);
    jest.spyOn(app.get(AuthService), 'login').mockResolvedValue({ access_token: mockAccessToken });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(HttpStatus.OK)
      .expect((response) => {
        expect(response.body).toHaveProperty('access_token');
        expect(response.body.access_token).toEqual(mockAccessToken);
      })
      .then(() => {
        expect(localStrategyMock.validate).toHaveBeenCalledWith(loginDto.email, loginDto.password);
        expect(app.get(AuthService).login).toHaveBeenCalledWith(mockUserEntity);
      });
  });

  it('should return Unauthorized if authentication fails (LocalStrategy returns null)', async () => {
    const localStrategyMock = app.get<LocalStrategy>(LocalStrategy) as any;
    (localStrategyMock.validate as jest.Mock).mockResolvedValue(null);
    jest.spyOn(app.get(AuthService), 'login').mockResolvedValue({ access_token: mockAccessToken });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(HttpStatus.UNAUTHORIZED)
      .then(() => {
        expect(localStrategyMock.validate).toHaveBeenCalledWith(loginDto.email, loginDto.password);
        expect(app.get(AuthService).login).not.toHaveBeenCalled();
      });
  });

  it('should return Unauthorized if user is not found by UserService', async () => {
    const userServiceMock = app.get<AuthUserRepository>(AuthUserRepository) as any;
    (userServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

    const localStrategyMock = app.get<LocalStrategy>(LocalStrategy) as any;
    (localStrategyMock.validate as jest.Mock).mockResolvedValue(null);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(HttpStatus.UNAUTHORIZED)
      .then(() => {
        expect(localStrategyMock.validate).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      });
  });
});