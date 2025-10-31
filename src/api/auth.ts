import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar axios con interceptor para incluir token
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  company?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  company?: string;
  role: string;
  role_description?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authAPI = {
  // Registro de nuevo usuario
  register: async (data: RegisterData): Promise<{ message: string; user: User }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // Guardar token en localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  // Obtener perfil
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put('/auth/profile', data);
    // Actualizar usuario en localStorage
    if (response.data.user) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data.user }));
    }
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (data: { current_password: string; new_password: string }): Promise<{ message: string }> => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Verificar si hay sesión activa
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  // Obtener usuario actual del localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default api;
