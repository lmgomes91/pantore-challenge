import { AuthUser } from "src/auth/domain/entities/authUser.entity"
import { AuthUserRole } from "src/auth/enums/authUserRole.enum"

export interface AuthUserRepositoryInterface {
    create(userData: Partial<AuthUser>): Promise<AuthUser>
    findByEmail(email: string): Promise<AuthUser | null>
    findById(id: string): Promise<AuthUser | null>
    findByRole(role: AuthUserRole): Promise<AuthUser[]>
}