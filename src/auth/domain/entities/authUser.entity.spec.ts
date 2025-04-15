import { AuthUser } from './authUser.entity';

describe('AuthUser', () => {
  describe('Instanciação Bem-Sucedida', () => {
    it('should create an AuthUser instance with valid parameters', () => {
      const id = 'someId';
      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'securePassword';
      const role = 'client';

      const authUser = new AuthUser(id, name, email, password, role);

      expect(authUser).toBeInstanceOf(AuthUser);
      expect(authUser.id).toBe(id);
      expect(authUser.name).toBe(name);
      expect(authUser.email).toBe(email);
      expect(authUser.password).toBe(password);
      expect(authUser.role).toBe(role);
    });
  });

  describe('Falha na Instanciação (Cenários Condicionais)', () => {
    it('should allow instantiation even with empty string parameters (JavaScript behavior)', () => {
      const id = '';
      const name = '';
      const email = '';
      const password = '';
      const role = 'admin';

      const authUser = new AuthUser(id, name, email, password, role);

      expect(authUser).toBeInstanceOf(AuthUser);
      expect(authUser.id).toBe(id);
      expect(authUser.name).toBe(name);
      expect(authUser.email).toBe(email);
      expect(authUser.password).toBe(password);
      expect(authUser.role).toBe(role);
    });

    it('should allow instantiation even with null or undefined parameters (JavaScript behavior)', () => {
      const id = null as any;
      const name = undefined as any;
      const email = null as any;
      const password = undefined as any;
      const role = 'client';

      const authUser = new AuthUser(id, name, email, password, role);

      expect(authUser).toBeInstanceOf(AuthUser);
      expect(authUser.id).toBe(id);
      expect(authUser.name).toBe(name);
      expect(authUser.email).toBe(email);
      expect(authUser.password).toBe(password);
      expect(authUser.role).toBe(role);
    });

    it('should allow instantiation even with incorrect role type (JavaScript behavior - no type checking at runtime)', () => {
      const id = 'someId';
      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'securePassword';
      const role = 'invalid-role' as any;

      const authUser = new AuthUser(id, name, email, password, role);

      expect(authUser).toBeInstanceOf(AuthUser);
      expect(authUser.id).toBe(id);
      expect(authUser.name).toBe(name);
      expect(authUser.email).toBe(email);
      expect(authUser.password).toBe(password);
      expect(authUser.role).toBe('invalid-role' as any);
    });
  });
});