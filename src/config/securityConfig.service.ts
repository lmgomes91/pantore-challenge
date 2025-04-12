import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityConfigService {
  constructor(private readonly configService: ConfigService) {}

  getSaltRounds(): number {
    const saltRoundsEnv = this.configService.get<string>('SALT_ROUNDS');
    if (!saltRoundsEnv) {
      console.warn('Environment variable SALT_ROUNDS is not defined. Using default value.');
      return 10;
    }
    return parseInt(saltRoundsEnv, 10);
  }

  getJwtSecret(): string {
    const jwtSecretEnv = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecretEnv) {
      throw new Error('Environment variable JWT_SECRET is not defined.');
    }
    return jwtSecretEnv;
  }

  getFirstAdminEmail(): string | undefined {
    return this.configService.get<string>('FIRST_ADMIN_EMAIL');
  }

  getFirstAdminPassword(): string | undefined {
    return this.configService.get<string>('FIRST_ADMIN_PASSWORD');
  }
}