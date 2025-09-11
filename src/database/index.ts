import { User, ProductionParameter, ProductionData, Prediction } from '../types';

// Simulación de base de datos SQLite en memoria
class DatabaseManager {
  private users: User[] = [
    {
      id: 1,
      email: 'admin@manufactura.com',
      password: 'admin123',
      role: 'admin',
      name: 'Administrador Sistema',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      email: 'operador@manufactura.com',
      password: 'operador123',
      role: 'operator',
      name: 'Operador Producción',
      created_at: new Date().toISOString()
    }
  ];

  private productionParameters: ProductionParameter[] = [
    { id: 1, name: 'Capacidad Máxima Diaria', value: 1000, unit: 'unidades', category: 'capacidad', updated_by: 1, updated_at: new Date().toISOString() },
    { id: 2, name: 'Tiempo Setup Máquina', value: 30, unit: 'minutos', category: 'tiempo', updated_by: 1, updated_at: new Date().toISOString() },
    { id: 3, name: 'Eficiencia Objetivo', value: 85, unit: 'porcentaje', category: 'eficiencia', updated_by: 1, updated_at: new Date().toISOString() },
    { id: 4, name: 'Costo Hora Máquina', value: 50, unit: 'USD', category: 'costo', updated_by: 1, updated_at: new Date().toISOString() },
    { id: 5, name: 'Inventario Mínimo', value: 100, unit: 'unidades', category: 'inventario', updated_by: 1, updated_at: new Date().toISOString() }
  ];

  private productionData: ProductionData[] = [
    { id: 1, raw_material_available: 800, standard_process_time: 8.5, projected_demand: 750, actual_production: 720, efficiency_rate: 82.5, date: '2024-01-15', created_by: 2, created_at: new Date().toISOString() },
    { id: 2, raw_material_available: 950, standard_process_time: 7.8, projected_demand: 900, actual_production: 885, efficiency_rate: 87.2, date: '2024-01-16', created_by: 2, created_at: new Date().toISOString() },
    { id: 3, raw_material_available: 1200, standard_process_time: 9.2, projected_demand: 1100, actual_production: 1050, efficiency_rate: 79.8, date: '2024-01-17', created_by: 2, created_at: new Date().toISOString() },
    { id: 4, raw_material_available: 750, standard_process_time: 8.0, projected_demand: 700, actual_production: 695, efficiency_rate: 85.1, date: '2024-01-18', created_by: 2, created_at: new Date().toISOString() },
    { id: 5, raw_material_available: 1100, standard_process_time: 7.5, projected_demand: 1000, actual_production: 980, efficiency_rate: 88.9, date: '2024-01-19', created_by: 2, created_at: new Date().toISOString() },
    { id: 6, raw_material_available: 900, standard_process_time: 8.8, projected_demand: 850, actual_production: 825, efficiency_rate: 83.7, date: '2024-01-20', created_by: 2, created_at: new Date().toISOString() },
    { id: 7, raw_material_available: 1050, standard_process_time: 7.2, projected_demand: 950, actual_production: 940, efficiency_rate: 90.1, date: '2024-01-21', created_by: 2, created_at: new Date().toISOString() },
    { id: 8, raw_material_available: 850, standard_process_time: 9.0, projected_demand: 800, actual_production: 775, efficiency_rate: 81.3, date: '2024-01-22', created_by: 2, created_at: new Date().toISOString() },
    { id: 9, raw_material_available: 1150, standard_process_time: 7.9, projected_demand: 1050, actual_production: 1025, efficiency_rate: 86.8, date: '2024-01-23', created_by: 2, created_at: new Date().toISOString() },
    { id: 10, raw_material_available: 950, standard_process_time: 8.3, projected_demand: 900, actual_production: 890, efficiency_rate: 84.6, date: '2024-01-24', created_by: 2, created_at: new Date().toISOString() }
  ];

  private predictions: Prediction[] = [];

  // Procedimientos almacenados simulados

  // Autenticación de usuarios
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  // Gestión de parámetros de producción
  async getProductionParameters(): Promise<ProductionParameter[]> {
    return [...this.productionParameters];
  }

  async updateProductionParameter(id: number, value: number, updatedBy: number): Promise<boolean> {
    const paramIndex = this.productionParameters.findIndex(p => p.id === id);
    if (paramIndex !== -1) {
      this.productionParameters[paramIndex].value = value;
      this.productionParameters[paramIndex].updated_by = updatedBy;
      this.productionParameters[paramIndex].updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Gestión de datos de producción
  async getProductionData(): Promise<ProductionData[]> {
    return [...this.productionData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async insertProductionData(data: Omit<ProductionData, 'id' | 'created_at'>): Promise<number> {
    const newId = Math.max(...this.productionData.map(d => d.id), 0) + 1;
    const newData: ProductionData = {
      ...data,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.productionData.push(newData);
    return newId;
  }

  // Gestión de predicciones
  async getPredictions(): Promise<Prediction[]> {
    return [...this.predictions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async insertPrediction(prediction: Omit<Prediction, 'id' | 'created_at'>): Promise<number> {
    const newId = Math.max(...this.predictions.map(p => p.id), 0) + 1;
    const newPrediction: Prediction = {
      ...prediction,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.predictions.push(newPrediction);
    return newId;
  }

  // Consultas analíticas
  async getProductionTrends(days: number = 30): Promise<ProductionData[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.productionData.filter(data => 
      new Date(data.date) >= cutoffDate
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getEfficiencyMetrics(): Promise<{
    averageEfficiency: number;
    maxEfficiency: number;
    minEfficiency: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    const recentData = await this.getProductionTrends(7);
    const efficiencies = recentData.map(d => d.efficiency_rate);
    
    const average = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
    const max = Math.max(...efficiencies);
    const min = Math.min(...efficiencies);
    
    // Calcular tendencia comparando primera y segunda mitad
    const firstHalf = efficiencies.slice(0, Math.floor(efficiencies.length / 2));
    const secondHalf = efficiencies.slice(Math.floor(efficiencies.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, eff) => sum + eff, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, eff) => sum + eff, 0) / secondHalf.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (secondAvg > firstAvg + 2) trend = 'up';
    else if (secondAvg < firstAvg - 2) trend = 'down';
    
    return {
      averageEfficiency: average,
      maxEfficiency: max,
      minEfficiency: min,
      trend
    };
  }
}

export const db = new DatabaseManager();