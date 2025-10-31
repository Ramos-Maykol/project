const API_URL = 'http://localhost:3000/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error en el servidor' }));
      throw new Error(error.error || 'Error en la solicitud');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Production Data
  async getProductionData() {
    return this.request<any[]>('/production/data');
  }

  async insertProductionData(data: any) {
    return this.request<any>('/production/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProductionTrends(days: number = 30) {
    return this.request<any[]>(`/production/trends?days=${days}`);
  }

  async getEfficiencyMetrics() {
    return this.request<any>('/production/efficiency-metrics');
  }

  // Predictions
  async getPredictions() {
    return this.request<any[]>('/predictions');
  }

  async insertPrediction(prediction: any) {
    return this.request<any>('/predictions', {
      method: 'POST',
      body: JSON.stringify(prediction),
    });
  }

  // Parameters
  async getProductionParameters() {
    return this.request<any[]>('/parameters');
  }

  async updateProductionParameter(id: number, value: number, updated_by: number) {
    return this.request<any>(`/parameters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ value, updated_by }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/health');
  }

  // Orders - Sistema de pedidos
  async getProductTypes() {
    return this.request<any[]>('/orders/product-types');
  }

  async estimateDelivery(data: {
    product_type_id: number;
    quantity: number;
    width?: number;
    height?: number;
    depth?: number;
  }) {
    return this.request<any>('/orders/estimate-delivery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createOrder(data: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(status?: string) {
    const url = status ? `/orders?status=${status}` : '/orders';
    return this.request<any[]>(url);
  }

  async getOrder(id: number) {
    return this.request<any>(`/orders/${id}`);
  }

  async updateOrderStatus(id: number, status: string) {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getProductionQueue() {
    return this.request<any[]>('/orders/queue/current');
  }

  async getProductionCapacity() {
    return this.request<any[]>('/orders/capacity/overview');
  }
}

export const apiClient = new ApiClient();
