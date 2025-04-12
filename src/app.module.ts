import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfigService } from './config/databaseConfig.service';
import { AuthModule } from './auth/auth.module';
import { SecurityConfigService } from './config/securityConfig.service';

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
  // controllers: [AppController],
  // providers: [AppService],
  exports: [SecurityConfigService]
})
export class AppModule {}
