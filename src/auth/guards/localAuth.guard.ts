import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from '../strategies/local.strategy';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(
    private localStrategy: LocalStrategy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, password } = request.body;

    console.log('LocalAuthGuard (manual) - Recebido:', { email, password });

    if (!email || !password) {
      console.log('LocalAuthGuard (manual) - Email ou senha ausentes.');
      throw new UnauthorizedException();
    }

    try {
      const user = await this.localStrategy.validate(email, password);
      console.log('LocalAuthGuard (manual) - Resultado da validação da estratégia:', user);

      if (!user) {
        console.log('LocalAuthGuard (manual) - Validação falhou.');
        throw new UnauthorizedException();
      }

      request.user = user;
      return true;

    } catch (error) {
      console.error('LocalAuthGuard (manual) - Erro durante a autenticação:', error);
      throw new UnauthorizedException();
    }
  }
}