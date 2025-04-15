import { Controller, Request, Post, UseGuards, Body, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/services/auth.service';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { LoginDto } from './dtos/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'User authenticated successfully.', schema: { properties: { access_token: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async login(@Request() req) {
    console.log('Login request (user):', req.user); // O usuário autenticado estará aqui
    return this.authService.login(req.user);
  }
}