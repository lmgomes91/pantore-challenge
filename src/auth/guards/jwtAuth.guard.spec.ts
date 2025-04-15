import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwtAuth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should call super.canActivate with the context', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer mockToken',
      },
      logIn: jest.fn(),
    };

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

    const canActivateMock = jest.fn().mockReturnValue(true);
    (AuthGuard('jwt').prototype as any).canActivate = canActivateMock;

    guard.canActivate(mockContext);

    expect(canActivateMock).toHaveBeenCalledWith(mockContext);

    delete (AuthGuard('jwt').prototype as any).canActivate;
  });

  it('should return the result of super.canActivate', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer mockToken',
      },
      logIn: jest.fn(),
    };

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

    const expectedResult = false;
    const canActivateMock = jest.fn().mockReturnValue(expectedResult);
    (AuthGuard('jwt').prototype as any).canActivate = canActivateMock;

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(expectedResult);

    delete (AuthGuard('jwt').prototype as any).canActivate;
  });
});