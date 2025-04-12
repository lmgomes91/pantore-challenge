import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('LocalStrategy - Método validate chamado:', { email, password });
    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        console.log('LocalStrategy - validateUser retornou null (credenciais inválidas)');
        throw new UnauthorizedException();
      }
      console.log('LocalStrategy - Usuário validado:', user);
      return user;
    } catch (error) {
      console.error('LocalStrategy - Erro no validate:', error);
      throw error;
    }
  }
}
