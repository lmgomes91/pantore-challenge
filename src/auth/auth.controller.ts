import { Controller, Request, Post, UseGuards, Body, ValidationPipe } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'User authenticated successfully.', schema: { properties: { access_token: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async login(@Request() req) {
    console.log('Login request:', req.body);
    return this.authService.login(req.body);
  }
}