import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SecurityConfigService } from 'src/config/securityConfig.service';
import { CreateUserDto } from 'src/infrastructure/controllers/dtos/createUser.dto';
import { UserRole } from 'src/user/enums/userRole.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly securityConfigService: SecurityConfigService,
  ) {}
  
  async onModuleInit() {
    await this.createFirstAdmin();
  }

  private async createFirstAdmin() {
    const adminExists = await this.userService.findByRole(UserRole.ADMIN);
    if (adminExists.length === 0) {
      const firstAdminEmail = this.securityConfigService.getFirstAdminEmail();
      const firstAdminPassword = this.securityConfigService.getFirstAdminPassword();

      if (firstAdminEmail && firstAdminPassword) {
        const hashedPassword = await bcrypt.hash(firstAdminPassword, await bcrypt.genSalt());

        const firstAdminDto: CreateUserDto = {
          email: firstAdminEmail,
          password: hashedPassword,
          role: UserRole.ADMIN,
          name: 'First Admin',
        };

        try {
          const createdAdmin = await this.userService.create(firstAdminDto);
          console.log('First administrator created:', createdAdmin.email);
        } catch (error) {
          console.error('Error creating the first administrator:', error);
        }
      } else {
        console.warn('Environment variables FIRST_ADMIN_EMAIL or FIRST_ADMIN_PASSWORD not defined.');
      }
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('AuthService - Método validateUser chamado:', { email });
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        console.log('AuthService - Usuário não encontrado para o email:', email);
        return null;
      }
      const isMatch = await bcrypt.compare(pass, user.password);
      console.log('AuthService - Resultado da comparação da senha:', isMatch);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
      console.log('AuthService - Senha incorreta para o usuário:', user.id);
      return null;
    } catch (error) {
      console.error('AuthService - Erro no validateUser:', error);
      throw error;
    }
  }

  async login(user: any) {
    console.log('AuthService - Método login chamado:', user.id);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}