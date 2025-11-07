import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';
import api from './apiClient';

const normalizeAuthResponse = (payload: any): AuthResponse => {
  const token =
    payload?.data?.token ??
    payload?.token ??
    payload?.data?.accessToken ??
    payload?.accessToken;

  const user =
    payload?.data?.user ??
    payload?.user ??
    payload?.data?.data?.user ??
    payload?.data?.payload?.user ??
    payload?.data;

  if (!token || !user) {
    throw new Error('Respuesta de autenticación inválida: faltan token o usuario.');
  }

  return {
    token,
    user,
    message: payload?.message ?? payload?.data?.message,
  };
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const auth = normalizeAuthResponse(response.data);
      return auth;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', credentials);
      const auth = normalizeAuthResponse(response.data);
      return auth;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrarse');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  async getProfile(): Promise<any> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  },

  // Método para verificar si el token es válido
  async validateToken(): Promise<boolean> {
    try {
      await api.get('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  },
};
