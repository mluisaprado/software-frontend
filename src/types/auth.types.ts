export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating?: number;
  tripsCount?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface AuthError {
  message: string;
  field?: string;
}
