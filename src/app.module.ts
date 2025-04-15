import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfigService } from './common/config/databaseConfig.service';
import { AuthModule } from './auth/auth.module';
import { SecurityConfigService } from './common/config/securityConfig.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const databaseConfigService = new DatabaseConfigService(configService);
        return {
          uri: databaseConfigService.getMongoUri(),
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule
  ],
  providers: [SecurityConfigService],
  exports: [SecurityConfigService]
})
export class AppModule {}
