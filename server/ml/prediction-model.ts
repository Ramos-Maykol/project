import { RandomForestRegression } from 'ml-random-forest';
import { Matrix } from 'ml-matrix';
import { pool } from '../database/config';

interface TrainingData {
  features: number[][];
  labels: number[];
}

interface TrainingHistory {
  date: Date;
  dataCount: number;
  accuracy: number;
  trainingTime: number;
}

class ProductionPredictionModel {
  private model: RandomForestRegression | null = null;
  private isTraining: boolean = false;
  private lastTrainingDate: Date | null = null;
  private accuracy: number = 0;
  private modelType: string = 'RandomForest Regression';
  private nEstimators: number = 50;
  private maxDepth: number = 10;
  private totalDataCount: number = 0;
  private trainingHistory: TrainingHistory[] = [];

  constructor() {
    // Entrenar el modelo al iniciar
    this.trainModel().catch(err => {
      console.warn('⚠️ No se pudo entrenar el modelo inicial:', err.message);
      console.log('ℹ️ El sistema usará cálculos tradicionales hasta que haya suficientes datos');
    });
  }

  /**
   * Obtener datos de entrenamiento desde la base de datos
   */
  private async getTrainingData(): Promise<TrainingData> {
    try {
      // Obtener TODOS los pedidos completados con tiempo real de producción
      const result = await pool.query(`
        SELECT 
          o.product_type_id,
          o.quantity,
          COALESCE(o.width, 0) as width,
          COALESCE(o.height, 0) as height,
          COALESCE(o.depth, 0) as depth,
          o.priority,
          pt.base_production_time,
          pt.complexity_factor,
          o.estimated_production_time,
          EXTRACT(EPOCH FROM (o.completion_date - o.start_production_date)) / 3600.0 as actual_hours
        FROM orders o
        JOIN product_types pt ON o.product_type_id = pt.id
        WHERE o.status = 'delivered'
          AND o.start_production_date IS NOT NULL
          AND o.completion_date IS NOT NULL
          AND o.completion_date > o.start_production_date
        ORDER BY o.completion_date DESC
      `);

      if (result.rows.length < 10) {
        throw new Error('Datos insuficientes para entrenar el modelo (mínimo 10 pedidos completados)');
      }

      const features: number[][] = [];
      const labels: number[] = [];

      result.rows.forEach((row: any) => {
        // Features: características del pedido
        features.push([
          parseFloat(row.product_type_id),
          parseFloat(row.quantity),
          parseFloat(row.width),
          parseFloat(row.height),
          parseFloat(row.depth),
          parseFloat(row.priority),
          parseFloat(row.base_production_time),
          parseFloat(row.complexity_factor),
          parseFloat(row.width) * parseFloat(row.height) * parseFloat(row.depth) // Volumen
        ]);

        // Label: tiempo real de producción
        labels.push(parseFloat(row.actual_hours));
      });

      console.log(`📊 Datos de entrenamiento: ${features.length} pedidos completados`);
      return { features, labels };
    } catch (error) {
      console.error('Error obteniendo datos de entrenamiento:', error);
      throw error;
    }
  }

  /**
   * Entrenar el modelo con datos históricos
   */
  async trainModel(): Promise<void> {
    if (this.isTraining) {
      console.log('⏳ Entrenamiento ya en progreso...');
      return;
    }

    this.isTraining = true;
    const startTime = Date.now();
    console.log('🎓 Iniciando entrenamiento del modelo RandomForest...');

    try {
      const { features, labels } = await this.getTrainingData();
      this.totalDataCount = features.length;

      // Dividir datos en entrenamiento y prueba (80/20)
      const splitIndex = Math.floor(features.length * 0.8);
      const trainFeatures = features.slice(0, splitIndex);
      const trainLabels = labels.slice(0, splitIndex);
      const testFeatures = features.slice(splitIndex);
      const testLabels = labels.slice(splitIndex);

      // Configurar y entrenar el modelo
      const options = {
        seed: 42,
        maxFeatures: 0.8,
        replacement: true,
        nEstimators: this.nEstimators, // Número de árboles
        treeOptions: {
          minNumSamples: 3,
          maxDepth: this.maxDepth
        }
      };

      this.model = new RandomForestRegression(options);
      this.model.train(trainFeatures, trainLabels);

      // Evaluar precisión
      if (testFeatures.length > 0) {
        const predictions = this.model.predict(testFeatures);
        const errors = predictions.map((pred: number, i: number) => 
          Math.abs(pred - testLabels[i]) / testLabels[i]
        );
        const avgError = errors.reduce((sum: number, err: number) => sum + err, 0) / errors.length;
        this.accuracy = (1 - avgError) * 100;

        console.log(`✅ Modelo entrenado exitosamente`);
        console.log(`🤖 Tipo: ${this.modelType}`);
        console.log(`🌲 Árboles: ${this.nEstimators}`);
        console.log(`📊 Datos totales: ${this.totalDataCount} pedidos entregados`);
        console.log(`📈 Precisión: ${this.accuracy.toFixed(2)}%`);
        console.log(`📊 Datos de entrenamiento: ${trainFeatures.length}`);
        console.log(`🧪 Datos de prueba: ${testFeatures.length}`);
      }

      const trainingTime = Date.now() - startTime;
      this.lastTrainingDate = new Date();

      // Guardar en historial
      this.trainingHistory.push({
        date: this.lastTrainingDate,
        dataCount: this.totalDataCount,
        accuracy: this.accuracy,
        trainingTime
      });

      // Mantener solo los últimos 10 entrenamientos
      if (this.trainingHistory.length > 10) {
        this.trainingHistory = this.trainingHistory.slice(-10);
      }

      console.log(`⏱️ Tiempo de entrenamiento: ${trainingTime}ms`);
    } catch (error) {
      console.error('❌ Error entrenando modelo:', error);
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Predecir tiempo de producción para un nuevo pedido
   */
  async predict(orderData: {
    product_type_id: number;
    quantity: number;
    width?: number;
    height?: number;
    depth?: number;
    priority?: number;
  }): Promise<number> {
    if (!this.model) {
      console.log('⚠️ Modelo no entrenado, usando cálculo tradicional');
      return this.fallbackPrediction(orderData);
    }

    try {
      // Obtener información del producto
      const productResult = await pool.query(
        'SELECT base_production_time, complexity_factor FROM product_types WHERE id = $1',
        [orderData.product_type_id]
      );

      if (productResult.rows.length === 0) {
        console.error(`❌ Tipo de producto no encontrado: ${orderData.product_type_id}`);
        throw new Error(`Tipo de producto no encontrado: ${orderData.product_type_id}`);
      }

      const product = productResult.rows[0];
      const width = orderData.width || 0;
      const height = orderData.height || 0;
      const depth = orderData.depth || 0;
      const volume = width * height * depth;

      // Preparar features para predicción
      const features = [[
        orderData.product_type_id,
        orderData.quantity,
        width,
        height,
        depth,
        orderData.priority || 1,
        parseFloat(product.base_production_time),
        parseFloat(product.complexity_factor),
        volume
      ]];

      // Realizar predicción
      const prediction = this.model.predict(features)[0];

      console.log(`🔮 Predicción ML: ${prediction.toFixed(2)} horas`);
      return Math.max(0.5, prediction); // Mínimo 0.5 horas
    } catch (error) {
      console.error('❌ Error en predicción ML, usando fallback:', error);
      return this.fallbackPrediction(orderData);
    }
  }

  /**
   * Predicción de respaldo (método tradicional)
   */
  private async fallbackPrediction(orderData: {
    product_type_id: number;
    quantity: number;
    width?: number;
    height?: number;
    depth?: number;
  }): Promise<number> {
    try {
      console.log('📐 Usando cálculo tradicional para predicción');
      
      const productResult = await pool.query(
        'SELECT base_production_time, complexity_factor FROM product_types WHERE id = $1',
        [orderData.product_type_id]
      );

      if (productResult.rows.length === 0) {
        console.error(`❌ Tipo de producto no encontrado en fallback: ${orderData.product_type_id}`);
        throw new Error(`Tipo de producto no encontrado: ${orderData.product_type_id}`);
      }

      const product = productResult.rows[0];
      const baseTime = parseFloat(product.base_production_time);
      const complexity = parseFloat(product.complexity_factor);

      let sizeFactor = 1.0;
      if (orderData.width && orderData.height) {
        const area = orderData.width * orderData.height * (orderData.depth || 1);
        sizeFactor = 1.0 + (area / 10000.0);
      }

      const estimatedTime = baseTime * orderData.quantity * complexity * sizeFactor;
      console.log(`📊 Cálculo tradicional: ${estimatedTime.toFixed(2)} horas`);
      
      return Math.max(0.5, estimatedTime); // Mínimo 0.5 horas
    } catch (error) {
      console.error('❌ Error crítico en fallbackPrediction:', error);
      throw error; // Re-lanzar el error para que sea manejado por el endpoint
    }
  }

  /**
   * Obtener estadísticas del modelo
   */
  getModelStats() {
    return {
      isTrained: this.model !== null,
      isTraining: this.isTraining,
      lastTrainingDate: this.lastTrainingDate,
      accuracy: this.accuracy,
      modelType: this.modelType,
      nEstimators: this.nEstimators,
      maxDepth: this.maxDepth,
      totalDataCount: this.totalDataCount,
      trainingHistory: this.trainingHistory.map(h => ({
        date: h.date,
        dataCount: h.dataCount,
        accuracy: parseFloat(h.accuracy.toFixed(2)),
        trainingTime: h.trainingTime
      }))
    };
  }

  /**
   * Re-entrenar el modelo (llamar después de completar pedidos)
   */
  async retrain(): Promise<void> {
    console.log('🔄 Re-entrenando modelo con nuevos datos...');
    await this.trainModel();
  }
}

// Instancia única del modelo
export const predictionModel = new ProductionPredictionModel();
