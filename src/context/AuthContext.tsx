import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';
import { authService } from '../services/authService';
import storage from '../utils/storage';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_TOKEN'; payload: { user: User; token: string } };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [error, setError] = React.useState<string | null>(null);

  // Restaurar token al iniciar la app
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await storage.getItem('authToken');
        const userData = await storage.getItem('userData');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch({ type: 'RESTORE_TOKEN', payload: { user, token } });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error restoring token:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreToken();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      setError(null);
      
      const response: AuthResponse = await authService.login(credentials);
      
      // Guardar token y datos del usuario
      await storage.setItem('authToken', response.token);
      await storage.setItem('userData', JSON.stringify(response.user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.user, token: response.token } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      setError(null);
      
      const response: AuthResponse = await authService.register(credentials);
      
      // Guardar token y datos del usuario
      await storage.setItem('authToken', response.token);
      await storage.setItem('userData', JSON.stringify(response.user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.user, token: response.token } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      setError(errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const logout = async () => {
    try {
      await storage.deleteItem('authToken');
      await storage.deleteItem('userData');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const clearError = () => {
    setError(null);
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
