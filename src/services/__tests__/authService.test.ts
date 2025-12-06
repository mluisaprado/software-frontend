import { authService } from '../authService';
import api from '../apiClient';
import { LoginCredentials, RegisterCredentials } from '../../types/auth.types';

// Mock del apiClient
jest.mock('../apiClient');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe hacer login exitosamente con credenciales válidas', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Login exitoso',
          data: {
            token: 'mock-token-123',
            user: {
              id: 1,
              email: 'test@example.com',
              name: 'Test User',
              role: 'user',
            },
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result.token).toBe('mock-token-123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
    });

    it('debe lanzar error con credenciales inválidas', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const mockError = {
        response: {
          data: {
            message: 'Credenciales inválidas',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.login(credentials)).rejects.toThrow(
        'Credenciales inválidas'
      );
    });
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const credentials: RegisterCredentials = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Usuario registrado exitosamente',
          data: {
            token: 'mock-token-456',
            user: {
              id: 2,
              email: 'newuser@example.com',
              name: 'New User',
              role: 'user',
            },
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.register(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/register', credentials);
      expect(result.token).toBe('mock-token-456');
      expect(result.user.email).toBe('newuser@example.com');
    });

    it('debe lanzar error si el email ya existe', async () => {
      const credentials: RegisterCredentials = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      const mockError = {
        response: {
          data: {
            message: 'El email ya está registrado',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.register(credentials)).rejects.toThrow(
        'El email ya está registrado'
      );
    });
  });

  describe('logout', () => {
    it('debe hacer logout exitosamente', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('no debe lanzar error si el logout falla', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('getProfile', () => {
    it('debe obtener el perfil del usuario', async () => {
      const mockProfile = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockProfile });

      const result = await authService.getProfile();

      expect(api.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockProfile);
    });

    it('debe lanzar error si no se puede obtener el perfil', async () => {
      const mockError = {
        response: {
          data: {
            message: 'No autorizado',
          },
        },
      };

      (api.get as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.getProfile()).rejects.toThrow('No autorizado');
    });
  });

  describe('validateToken', () => {
    it('debe retornar true si el token es válido', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: {} });

      const result = await authService.validateToken();

      expect(api.get).toHaveBeenCalledWith('/auth/validate');
      expect(result).toBe(true);
    });

    it('debe retornar false si el token es inválido', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Token inválido'));

      const result = await authService.validateToken();

      expect(result).toBe(false);
    });
  });
});

