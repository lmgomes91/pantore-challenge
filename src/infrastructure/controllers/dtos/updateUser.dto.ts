import { IsOptional, IsString, IsEmail, IsIn, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'New user\'s name (optional)' })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name?: string;

  @ApiProperty({ description: 'New user\'s email (optional)' })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({ description: 'New user\'s password (optional)' })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @Length(6, 100, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  })
  password?: string;

  @ApiProperty({ description: 'New user\'s role (optional)' })
  @IsOptional()
  @IsIn(['admin', 'client'], { message: 'Role must be "admin" or "client"' })
  role?: 'admin' | 'client';
}