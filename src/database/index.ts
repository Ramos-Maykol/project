import { User, ProductionParameter, ProductionData, Prediction } from '../types';
import { apiClient } from '../api/client';

// Gestor de base de datos usando API REST
class DatabaseManager {
  // Autenticación de usuarios
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.login(email, password);
      return response.user;
    } catch (error) {
      console.error('Error en authenticateUser:', error);
      return null;
    }
  }

  // Gestión de parámetros de producción
  async getProductionParameters(): Promise<ProductionParameter[]> {
    try {
      return await apiClient.getProductionParameters();
    } catch (error) {
      console.error('Error en getProductionParameters:', error);
      return [];
    }
  }

  async updateProductionParameter(id: number, value: number, updatedBy: number): Promise<boolean> {
    try {
      await apiClient.updateProductionParameter(id, value, updatedBy);
      return true;
    } catch (error) {
      console.error('Error en updateProductionParameter:', error);
      return false;
    }
  }

  // Gestión de datos de producción
  async getProductionData(): Promise<ProductionData[]> {
    try {
      return await apiClient.getProductionData();
    } catch (error) {
      console.error('Error en getProductionData:', error);
      return [];
    }
  }

  async insertProductionData(data: Omit<ProductionData, 'id' | 'created_at'>): Promise<number> {
    try {
      const result = await apiClient.insertProductionData(data);
      return result.id;
    } catch (error) {
      console.error('Error en insertProductionData:', error);
      throw error;
    }
  }

  // Gestión de predicciones
  async getPredictions(): Promise<Prediction[]> {
    try {
      return await apiClient.getPredictions();
    } catch (error) {
      console.error('Error en getPredictions:', error);
      return [];
    }
  }

  async insertPrediction(prediction: Omit<Prediction, 'id' | 'created_at'>): Promise<number> {
    try {
      const result = await apiClient.insertPrediction(prediction);
      return result.id;
    } catch (error) {
      console.error('Error en insertPrediction:', error);
      throw error;
    }
  }

  // Consultas analíticas
  async getProductionTrends(days: number = 30): Promise<ProductionData[]> {
    try {
      return await apiClient.getProductionTrends(days);
    } catch (error) {
      console.error('Error en getProductionTrends:', error);
      return [];
    }
  }

  async getEfficiencyMetrics(): Promise<{
    averageEfficiency: number;
    maxEfficiency: number;
    minEfficiency: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    try {
      return await apiClient.getEfficiencyMetrics();
    } catch (error) {
      console.error('Error en getEfficiencyMetrics:', error);
      return {
        averageEfficiency: 0,
        maxEfficiency: 0,
        minEfficiency: 0,
        trend: 'stable'
      };
    }
  }
}

export const db = new DatabaseManager();