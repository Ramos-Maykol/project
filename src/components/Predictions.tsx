import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../database';
import { ProductionData, Prediction } from '../types';
import { LinearRegressionModel, ARIMAModel, RecommendationEngine } from '../utils/predictiveModels';
import { 
  Brain, 
  TrendingUp, 
  Calculator, 
  Lightbulb,
  Play,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export const Predictions: React.FC = () => {
  const { user } = useAuth();
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [currentPrediction, setCurrentPrediction] = useState<{
    predictedTime: number;
    confidence: number;
    recommendations: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPredictionData, setNewPredictionData] = useState({
    raw_material_available: '',
    standard_process_time: '',
    projected_demand: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodData, predData] = await Promise.all([
        db.getProductionData(),
        db.getPredictions()
      ]);
      setProductionData(prodData);
      setPredictions(predData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const generatePrediction = async () => {
    if (!newPredictionData.raw_material_available || 
        !newPredictionData.standard_process_time || 
        !newPredictionData.projected_demand) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Entrenar modelo con datos históricos
      const model = new LinearRegressionModel();
      model.train(productionData);
      
      // Generar predicción
      const prediction = model.predict(
        parseFloat(newPredictionData.raw_material_available),
        parseFloat(newPredictionData.projected_demand)
      );

      // Crear datos simulados para la predicción
      const simulatedData: ProductionData = {
        id: 0,
        raw_material_available: parseFloat(newPredictionData.raw_material_available),
        standard_process_time: parseFloat(newPredictionData.standard_process_time),
        projected_demand: parseFloat(newPredictionData.projected_demand),
        actual_production: 0,
        efficiency_rate: 0,
        date: new Date().toISOString().split('T')[0],
        created_by: user?.id || 0,
        created_at: new Date().toISOString()
      };

      // Generar recomendaciones
      const recommendations = RecommendationEngine.generateRecommendations(
        simulatedData,
        prediction,
        productionData
      );

      setCurrentPrediction({
        predictedTime: prediction.predictedTime,
        confidence: prediction.confidence,
        recommendations
      });

      // Guardar predicción en base de datos
      await db.insertPrediction({
        production_data_id: 0, // Datos simulados
        predicted_production_time: prediction.predictedTime,
        confidence_level: prediction.confidence,
        model_used: 'Regresión Lineal',
        recommendations: recommendations.join('; ')
      });

      loadData();
    } catch (error) {
      console.error('Error generando predicción:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Preparar datos para gráficas
  const chartData = productionData.map(data => ({
    date: new Date(data.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    tiempoReal: data.standard_process_time,
    eficiencia: data.efficiency_rate,
    demanda: data.projected_demand,
    produccion: data.actual_production
  }));

  const scatterData = productionData.map(data => ({
    demanda: data.projected_demand,
    tiempo: data.standard_process_time,
    eficiencia: data.efficiency_rate
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Módulo de Predicciones
          </h1>
        </div>
        <p className="text-gray-600">
          Análisis predictivo para optimización de tiempos de producción
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de predicción */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Generar Nueva Predicción
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materia Prima Disponible
              </label>
              <input
                type="number"
                value={newPredictionData.raw_material_available}
                onChange={(e) => setNewPredictionData({
                  ...newPredictionData, 
                  raw_material_available: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cantidad en unidades"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo Estándar Estimado (horas)
              </label>
              <input
                type="number"
                step="0.1"
                value={newPredictionData.standard_process_time}
                onChange={(e) => setNewPredictionData({
                  ...newPredictionData, 
                  standard_process_time: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Horas por lote"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Demanda Proyectada
              </label>
              <input
                type="number"
                value={newPredictionData.projected_demand}
                onChange={(e) => setNewPredictionData({
                  ...newPredictionData, 
                  projected_demand: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Unidades esperadas"
              />
            </div>
            
            <button
              onClick={generatePrediction}
              disabled={isGenerating || !newPredictionData.raw_material_available || !newPredictionData.projected_demand}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{isGenerating ? 'Generando...' : 'Ejecutar Predicción'}</span>
            </button>
          </div>
        </div>

        {/* Resultados de predicción */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Resultados de Predicción
            </h2>
          </div>
          
          {currentPrediction ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Tiempo Predicho</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {currentPrediction.predictedTime.toFixed(2)}h
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Confianza</p>
                  <p className="text-2xl font-bold text-green-900">
                    {(currentPrediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-900">Recomendaciones</h3>
                </div>
                <ul className="space-y-2">
                  {currentPrediction.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Complete los datos y ejecute una predicción para ver los resultados
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Análisis visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de tiempos estimados vs reales */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tiempos Estimados vs Reales
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}h`,
                    name === 'tiempoReal' ? 'Tiempo Real' : 'Tiempo Estimado'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="tiempoReal" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Análisis de correlación */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Correlación Demanda vs Tiempo
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="demanda" name="Demanda" />
                <YAxis dataKey="tiempo" name="Tiempo" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'demanda' ? `${value} unidades` : `${value}h`,
                    name === 'demanda' ? 'Demanda' : 'Tiempo'
                  ]}
                />
                <Scatter 
                  dataKey="tiempo" 
                  fill="#8B5CF6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historial de predicciones */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Historial de Predicciones
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tiempo Predicho</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Confianza</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Modelo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 10).map((prediction) => (
                <tr key={prediction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {new Date(prediction.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {prediction.predicted_production_time.toFixed(2)}h
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prediction.confidence_level >= 0.8
                        ? 'bg-green-100 text-green-800'
                        : prediction.confidence_level >= 0.6
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(prediction.confidence_level * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {prediction.model_used}
                  </td>
                  <td className="py-3 px-4">
                    {prediction.confidence_level >= 0.7 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};