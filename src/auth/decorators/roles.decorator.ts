import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/enums/userRole.enum';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);