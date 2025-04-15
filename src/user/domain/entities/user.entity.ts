import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ description: 'ID único do usuário' })
  id: string;

  @ApiProperty({ description: 'Nome do usuário' })
  name: string;

  @ApiProperty({ description: 'Email do usuário' })
  email: string;

  // @ApiProperty({ description: 'Senha do usuário (não exposta na resposta)' })
  password: string;

  @ApiProperty({ enum: ['client', 'admin'], description: 'Função do usuário' })
  role: 'admin' | 'client';

  constructor(id: string, name: string, email: string, password: string, role: 'admin' | 'client') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }
}