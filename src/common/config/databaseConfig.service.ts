import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService {
  constructor(private readonly configService: ConfigService) {}

  getMongoUri(): string {
    const uri = this.configService.get<string>('MONGODB_URI');
    if (!uri) {
      throw new Error('Environment variable MONGODB_URI is not defined.');
    }
    return uri;
  }
}