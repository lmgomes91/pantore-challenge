import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import { AuthUserRepository } from '../infrastructure/repositories/authUser.repository';
import { AuthUserRole } from '../enums/authUserRole.enum';
import { CreateAuthUserDto } from '../infrastructure/controllers/dtos/createauthUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly jwtService: JwtService,
    private readonly securityConfigService: SecurityConfigService,
  ) {}

  async onModuleInit() {
    await this.createFirstAdmin();
  }

  private async createFirstAdmin() {
    const adminExists = await this.authUserRepository.findByRole(AuthUserRole.ADMIN);
    if (adminExists.length === 0) {
      const firstAdminEmail = this.securityConfigService.getFirstAdminEmail();
      const firstAdminPassword = this.securityConfigService.getFirstAdminPassword();

      if (firstAdminEmail && firstAdminPassword) {
        const hashedPassword = await bcrypt.hash(firstAdminPassword, await bcrypt.genSalt());

        const firstAdminDto: CreateAuthUserDto = {
          email: firstAdminEmail,
          password: hashedPassword,
          role: AuthUserRole.ADMIN,
          name: 'First Admin',
        };

        try {
          const createdAdmin = await this.authUserRepository.create(firstAdminDto);
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
    console.log('AuthService - validateUser method called:', { email });
    try {
      const user = await this.authUserRepository.findByEmail(email);
      if (!user) {
        console.log('AuthService - User not found for email:', email);
        return null;
      }
      const isMatch = await bcrypt.compare(pass, user.password);
      console.log('AuthService - Password comparison result:', isMatch);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
      console.log('AuthService - Incorrect password for user:', user.id);
      return null;
    } catch (error) {
      console.error('AuthService - Error in validateUser:', error);
      throw error;
    }
  }

  async login(user: any) {
    console.log('AuthService - login method called:', user.id);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}