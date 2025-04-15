import { User } from 'src/user/domain/entities/user.entity';
import { UserRole } from 'src/user/enums/userRole.enum';

export interface UserRepositoryInterface {
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  filter(criteria: Partial<User>): Promise<User[]>;
  delete(id: string): Promise<boolean>;
  updateRole(id: string, role: UserRole): Promise<User | null>;
}