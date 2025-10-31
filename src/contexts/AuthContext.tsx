import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, LoginData, RegisterData } from '../api/auth';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  company?: string;
  role: string;
  role_description?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ((data: LoginData) => Promise<boolean>) & ((email: string, password: string) => Promise<boolean>);
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAdmin: () => boolean;
  isOperator: () => boolean;
  isCustomer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = authAPI.getCurrentUser();
    if (savedUser && authAPI.isAuthenticated()) {
      setUser(savedUser);
      // Verificar que el token siga siendo válido
      authAPI.getProfile()
        .then(response => setUser(response.user))
        .catch(() => {
          // Token inválido, limpiar sesión
          authAPI.logout();
          setUser(null);
        });
    }
    setIsLoading(false);
  }, []);

  const login = async (arg1: LoginData | string, arg2?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const payload = typeof arg1 === 'string' ? { email: arg1, password: arg2 || '' } : arg1;
      const response = await authAPI.login(payload);
      setUser(response.user);
      return true;
    } catch (error: any) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      await authAPI.register(data);
      // Después de registrar, hacer login automático
      await login({ email: data.email, password: data.password });
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw new Error(error.response?.data?.error || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.user);
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      throw new Error(error.response?.data?.error || 'Error al actualizar perfil');
    }
  };

  const isAdmin = (): boolean => {
    return user?.email === 'admin@manufactura.com';
  };

  const isOperator = (): boolean => {
    return user?.email === 'operador@manufactura.com';
  };

  const isCustomer = (): boolean => {
    return true; // Simplificado - todos pueden ver
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isOperator,
    isCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};