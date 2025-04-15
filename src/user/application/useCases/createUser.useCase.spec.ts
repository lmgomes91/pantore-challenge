import { TestingModule, Test } from "@nestjs/testing";
import * as bcrypt from 'bcrypt';
import { SecurityConfigService } from "src/common/config/securityConfig.service";
import { User } from "src/user/domain/entities/user.entity";
import { CreateUserUseCase } from "./createUser.useCase";
import { ConflictException } from "@nestjs/common";
import { CreateUserDto } from "src/user/infrastructure/controllers/dtos/createUser.dto";
import { UserRepository } from "src/user/infrastructure/repositories/user.repository";
import { UserRole } from "src/user/enums/userRole.enum";

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let userRepository: UserRepository;
  let securityConfigService: SecurityConfigService;

  beforeEach(async () => {
    const userRepositoryMock = {
      create: jest.fn(),
    };

    const securityConfigServiceMock = {
      getSaltRounds: jest.fn().mockReturnValue(10),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: SecurityConfigService, useValue: securityConfigServiceMock },
      ],
    }).compile();

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    securityConfigService = module.get<SecurityConfigService>(SecurityConfigService);
  });

  it('should be defined', () => {
    expect(createUserUseCase).toBeDefined();
  });

  it('should create a new user successfully', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const createdUserEntity = new User(
      'mockId',
      createUserDto.name,
      createUserDto.email,
      'hashedPassword',
      UserRole.CLIENT,
    );
    (userRepository.create as jest.Mock).mockResolvedValue(createdUserEntity);

    (securityConfigService.getSaltRounds as jest.Mock).mockReturnValue(10);

    const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

    const result = await createUserUseCase.execute(createUserDto);

    expect(bcryptHashSpy).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(userRepository.create).toHaveBeenCalledWith(expect.any(User));
    expect(result).toEqual(createdUserEntity);
  });

  it('should throw ConflictException if userRepository.create throws it', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Duplicate User',
      email: 'existing@example.com',
      password: 'password456',
    };

    (userRepository.create as jest.Mock).mockRejectedValue(new ConflictException('Email already exists'));

    (securityConfigService.getSaltRounds as jest.Mock).mockReturnValue(10);

    const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

    await expect(createUserUseCase.execute(createUserDto)).rejects.toThrow(ConflictException);

    expect(bcryptHashSpy).toHaveBeenCalledWith(createUserDto.password, 10);

    expect(userRepository.create).toHaveBeenCalledWith(expect.any(User));
  });

  
});