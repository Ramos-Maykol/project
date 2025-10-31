import api from './auth';

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  company?: string;
  role_name: string;
  role_description: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface ProductType {
  id: number;
  name: string;
  description?: string;
  material_type: string;
  base_production_time: number;
  complexity_factor: number;
  created_at?: string;
}

export interface DashboardStats {
  users: Array<{ role: string; count: number }>;
  orders: Array<{ status: string; count: number }>;
  product_types_count: number;
  recent_orders: number;
  recent_users: number;
}

export interface AuditLog {
  id: number;
  product_type_id: number;
  action: string;
  changed_by?: number;
  changed_by_name?: string;
  changed_by_email?: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

export const adminAPI = {
  // ==================== USUARIOS ====================
  
  // Obtener todos los usuarios
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Obtener un usuario específico
  getUser: async (id: number): Promise<AdminUser> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id: number, data: Partial<AdminUser>): Promise<{ message: string; user: AdminUser }> => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Desactivar usuario
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // ==================== TIPOS DE PRODUCTOS ====================
  
  // Obtener todos los tipos de productos
  getProductTypes: async (): Promise<ProductType[]> => {
    const response = await api.get('/admin/product-types');
    return response.data;
  },

  // Crear tipo de producto
  createProductType: async (data: Omit<ProductType, 'id' | 'created_at'>): Promise<{ message: string; product_type: ProductType }> => {
    const response = await api.post('/admin/product-types', data);
    return response.data;
  },

  // Actualizar tipo de producto
  updateProductType: async (id: number, data: Partial<ProductType>): Promise<{ message: string; product_type: ProductType }> => {
    const response = await api.put(`/admin/product-types/${id}`, data);
    return response.data;
  },

  // Eliminar tipo de producto
  deleteProductType: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/product-types/${id}`);
    return response.data;
  },

  // ==================== ESTADÍSTICAS ====================
  
  // Obtener estadísticas del dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Obtener auditoría de tipos de productos
  getProductTypeAudit: async (): Promise<AuditLog[]> => {
    const response = await api.get('/admin/audit/product-types');
    return response.data;
  },

  // Obtener roles disponibles
  getRoles: async (): Promise<Array<{ id: number; name: string; description: string }>> => {
    const response = await api.get('/admin/roles');
    return response.data;
  },
};
