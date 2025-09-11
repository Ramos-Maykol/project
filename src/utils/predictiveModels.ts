import { ProductionData } from '../types';

/**
 * Modelo de Regresión Lineal Simple para predicción de tiempos de producción
 * Basado en datos históricos de eficiencia y demanda
 */
export class LinearRegressionModel {
  private slope: number = 0;
  private intercept: number = 0;
  private trained: boolean = false;

  /**
   * Entrena el modelo con datos históricos
   */
  train(data: ProductionData[]): void {
    if (data.length < 2) {
      throw new Error('Se necesitan al menos 2 puntos de datos para entrenar el modelo');
    }

    // Variables independientes: demanda proyectada y materia prima disponible
    // Variable dependiente: tiempo estándar de proceso
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach(point => {
      const x = point.projected_demand / point.raw_material_available; // Ratio demanda/materia prima
      const y = point.standard_process_time;
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    // Cálculo de pendiente e intercepto
    this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;
    this.trained = true;
  }

  /**
   * Predice el tiempo de producción basado en nuevos datos
   */
  predict(rawMaterial: number, projectedDemand: number): {
    predictedTime: number;
    confidence: number;
  } {
    if (!this.trained) {
      throw new Error('El modelo debe ser entrenado antes de hacer predicciones');
    }

    const x = projectedDemand / rawMaterial;
    const predictedTime = this.slope * x + this.intercept;
    
    // Calcular confianza basada en la consistencia del modelo
    const confidence = Math.max(0.6, Math.min(0.95, 0.85 - Math.abs(this.slope) * 0.1));

    return {
      predictedTime: Math.max(0.1, predictedTime), // Tiempo mínimo de 0.1 horas
      confidence
    };
  }
}

/**
 * Modelo ARIMA simplificado para análisis de tendencias
 */
export class ARIMAModel {
  private data: number[] = [];
  private trend: number = 0;
  private seasonality: number[] = [];

  /**
   * Entrena el modelo con serie temporal de eficiencia
   */
  train(efficiencyData: number[]): void {
    this.data = [...efficiencyData];
    
    // Calcular tendencia (diferencia promedio entre períodos consecutivos)
    const differences = [];
    for (let i = 1; i < this.data.length; i++) {
      differences.push(this.data[i] - this.data[i - 1]);
    }
    this.trend = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;

    // Calcular componente estacional simple (promedio por posición en ciclo de 7 días)
    this.seasonality = [];
    for (let i = 0; i < 7; i++) {
      const seasonalValues = this.data.filter((_, index) => index % 7 === i);
      const seasonalAvg = seasonalValues.reduce((sum, val) => sum + val, 0) / seasonalValues.length;
      this.seasonality.push(seasonalAvg);
    }
  }

  /**
   * Predice eficiencia futura
   */
  forecast(periods: number): number[] {
    const forecasts = [];
    const lastValue = this.data[this.data.length - 1];
    
    for (let i = 0; i < periods; i++) {
      const trendComponent = this.trend * (i + 1);
      const seasonalComponent = this.seasonality[i % 7] - (this.data.reduce((sum, val) => sum + val, 0) / this.data.length);
      const forecast = lastValue + trendComponent + seasonalComponent * 0.3;
      
      // Limitar entre 70% y 95% de eficiencia
      forecasts.push(Math.max(70, Math.min(95, forecast)));
    }
    
    return forecasts;
  }
}

/**
 * Generador de recomendaciones basado en análisis predictivo
 */
export class RecommendationEngine {
  static generateRecommendations(
    currentData: ProductionData,
    prediction: { predictedTime: number; confidence: number },
    historicalData: ProductionData[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Análisis de eficiencia
    if (currentData.efficiency_rate < 80) {
      recommendations.push('🔧 Revisar configuración de máquinas - eficiencia por debajo del objetivo');
      recommendations.push('📊 Implementar programa de mantenimiento preventivo');
    }

    // Análisis de capacidad vs demanda
    const capacityRatio = currentData.projected_demand / currentData.raw_material_available;
    if (capacityRatio > 0.9) {
      recommendations.push('⚠️ Demanda alta - considerar aumentar inventario de materia prima');
      recommendations.push('📈 Evaluar ampliación de capacidad de producción');
    }

    // Análisis de tiempo de proceso
    const avgProcessTime = historicalData.reduce((sum, d) => sum + d.standard_process_time, 0) / historicalData.length;
    if (prediction.predictedTime > avgProcessTime * 1.2) {
      recommendations.push('⏱️ Tiempo de proceso elevado - optimizar flujo de trabajo');
      recommendations.push('🔄 Revisar secuencia de operaciones para reducir tiempos muertos');
    }

    // Análisis de confianza del modelo
    if (prediction.confidence < 0.7) {
      recommendations.push('📊 Baja confianza en predicción - recopilar más datos históricos');
      recommendations.push('🎯 Calibrar parámetros del modelo predictivo');
    }

    // Recomendaciones generales de optimización
    if (currentData.efficiency_rate > 85 && capacityRatio < 0.8) {
      recommendations.push('✅ Condiciones óptimas - mantener estándares actuales');
      recommendations.push('🚀 Oportunidad para aumentar producción sin comprometer calidad');
    }

    return recommendations.length > 0 ? recommendations : ['✅ Sistema operando dentro de parámetros normales'];
  }
}