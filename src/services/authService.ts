import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';
import api from './apiClient';
import storage from '../utils/storage';
import { API_BASE_URL } from './apiClient';

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

  // Método para subir foto de perfil
  async uploadProfilePicture(file: File | Blob): Promise<{ profile_picture: string }> {
    try {
      const token = await storage.getItem('authToken');
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Error al subir la foto de perfil');
      }

      const data = await response.json();
      // El backend devuelve { data: { profile_picture: "/uploads/profile-pictures/..." } }
      return {
        profile_picture: data?.data?.profile_picture || data?.profile_picture || '',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Error al subir la foto de perfil');
    }
  },
};
