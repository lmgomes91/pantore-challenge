import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SecurityConfigService } from 'src/common/config/securityConfig.service';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthUserRepository } from './infrastructure/repositories/authUser.repository';
import { AuthUser } from './domain/entities/authUser.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthUserSchema } from './schemas/authUser.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuthUser.name, schema:  AuthUserSchema}]),
    // UserModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const securityConfigService = new SecurityConfigService(configService);
        return {
          secret: securityConfigService.getJwtSecret(),
          signOptions: { expiresIn: '1h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, SecurityConfigService, RolesGuard, AuthUserRepository],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}