import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { authAPI } from '@/api/endpoints';
import { isAxiosError } from 'axios';
import type { ApiErrorBody, LoginRequest, UpdateMeRequest, User } from '@/types';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResult>;
  logout: () => void;
  updateUser: (data: UpdateMeRequest) => Promise<AuthResult>;
  isAuthenticated: boolean;
}

/** Pulls the backend's `{ error: string }` body out of a rejected request. */
const errorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error || fallback;
  }
  return fallback;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<AuthResult> => {
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, user: loggedInUser } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      setToken(newToken);
      // Login returns a reduced user object; treat it as a User until /me refreshes it.
      setUser(loggedInUser as User);

      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error, 'Login failed') };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: UpdateMeRequest): Promise<AuthResult> => {
    try {
      const response = await authAPI.updateMe(data);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error, 'Update failed') };
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Narrowing hook: throws when used outside `AuthProvider`, so consumers never
 * silently receive `undefined` from the raw context.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};