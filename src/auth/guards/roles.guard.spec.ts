import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthUserRole } from '../enums/authUserRole.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', () => {
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { role: AuthUserRole.CLIENT } }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return true if the user role matches one of the required roles', () => {
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { role: AuthUserRole.ADMIN } }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([AuthUserRole.ADMIN, AuthUserRole.CLIENT]);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return false if the user role does not match any of the required roles', () => {
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { role: AuthUserRole.CLIENT } }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;
  
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([AuthUserRole.ADMIN]);
    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should return false if the user object is missing in the request', () => {
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([AuthUserRole.ADMIN]);
    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should return false if the user role is missing in the request', () => {
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: {} }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([AuthUserRole.ADMIN]);
    expect(guard.canActivate(mockContext)).toBe(false);
  });
});