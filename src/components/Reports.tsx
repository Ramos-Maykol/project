import React, { useState, useEffect } from 'react';
import { db } from '../database';
import { ProductionData, Prediction } from '../types';
import { ARIMAModel } from '../utils/predictiveModels';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const Reports: React.FC = () => {
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [reportPeriod, setReportPeriod] = useState(30);
  const [forecastData, setForecastData] = useState<number[]>([]);

  useEffect(() => {
    loadReportData();
  }, [reportPeriod]);

  const loadReportData = async () => {
    try {
      const [prodData, predData] = await Promise.all([
        db.getProductionTrends(reportPeriod),
        db.getPredictions()
      ]);
      setProductionData(prodData);
      setPredictions(predData);
      
      // Generar pronóstico con modelo ARIMA
      if (prodData.length > 0) {
        const arimaModel = new ARIMAModel();
        const efficiencyData = prodData.map(d => d.efficiency_rate);
        arimaModel.train(efficiencyData);
        const forecast = arimaModel.forecast(7);
        setForecastData(forecast);
      }
    } catch (error) {
      console.error('Error cargando datos del reporte:', error);
    }
  };

  const generatePDFReport = () => {
    // Simulación de generación de PDF
    const reportContent = `
REPORTE DE ANÁLISIS PREDICTIVO - MANUFACTURA
============================================

Período: Últimos ${reportPeriod} días
Fecha de generación: ${new Date().toLocaleDateString('es-ES')}

RESUMEN EJECUTIVO:
- Total de registros analizados: ${productionData.length}
- Eficiencia promedio: ${(productionData.reduce((sum, d) => sum + d.efficiency_rate, 0) / productionData.length).toFixed(1)}%
- Producción total: ${productionData.reduce((sum, d) => sum + d.actual_production, 0)} unidades
- Predicciones generadas: ${predictions.length}

MÉTRICAS CLAVE:
- Eficiencia máxima: ${Math.max(...productionData.map(d => d.efficiency_rate)).toFixed(1)}%
- Eficiencia mínima: ${Math.min(...productionData.map(d => d.efficiency_rate)).toFixed(1)}%
- Tiempo promedio de proceso: ${(productionData.reduce((sum, d) => sum + d.standard_process_time, 0) / productionData.length).toFixed(2)}h

RECOMENDACIONES:
- Mantener eficiencia por encima del 85%
- Optimizar tiempos de setup de máquinas
- Implementar mantenimiento predictivo
- Monitorear tendencias de demanda

PRONÓSTICO (7 días):
${forecastData.map((eff, i) => `Día ${i + 1}: ${eff.toFixed(1)}% eficiencia`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_manufactura_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportDetailedCSV = () => {
    const headers = [
      'Fecha', 'Materia Prima', 'Tiempo Proceso', 'Demanda Proyectada', 
      'Producción Real', 'Eficiencia', 'Variación Demanda', 'Cumplimiento'
    ];
    
    const csvContent = [
      headers.join(','),
      ...productionData.map(data => {
        const variacionDemanda = ((data.actual_production - data.projected_demand) / data.projected_demand * 100).toFixed(1);
        const cumplimiento = (data.actual_production / data.projected_demand * 100).toFixed(1);
        
        return [
          data.date,
          data.raw_material_available,
          data.standard_process_time,
          data.projected_demand,
          data.actual_production,
          data.efficiency_rate,
          `${variacionDemanda}%`,
          `${cumplimiento}%`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_detallado_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Preparar datos para gráficas
  const trendData = productionData.map((data, index) => ({
    date: new Date(data.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    eficiencia: data.efficiency_rate,
    cumplimiento: (data.actual_production / data.projected_demand * 100),
    utilizacion: (data.projected_demand / data.raw_material_available * 100)
  }));

  const forecastChartData = forecastData.map((eff, index) => ({
    dia: `Día ${index + 1}`,
    eficienciaPronosticada: eff,
    eficienciaObjetivo: 85
  }));

  const calculateKPIs = () => {
    if (productionData.length === 0) return null;
    
    const avgEfficiency = productionData.reduce((sum, d) => sum + d.efficiency_rate, 0) / productionData.length;
    const avgFulfillment = productionData.reduce((sum, d) => sum + (d.actual_production / d.projected_demand * 100), 0) / productionData.length;
    const avgUtilization = productionData.reduce((sum, d) => sum + (d.projected_demand / d.raw_material_available * 100), 0) / productionData.length;
    
    return {
      efficiency: avgEfficiency,
      fulfillment: avgFulfillment,
      utilization: avgUtilization
    };
  };

  const kpis = calculateKPIs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reportes y Análisis
              </h1>
              <p className="text-gray-600">
                Análisis detallado y exportación de datos de producción
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 90 días</option>
              </select>
            </div>
            
            <button
              onClick={exportDetailedCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>CSV Detallado</span>
            </button>
            
            <button
              onClick={generatePDFReport}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Reporte PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPIs principales */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Eficiencia Promedio</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {kpis.efficiency.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              Objetivo: 85% | {kpis.efficiency >= 85 ? 'Meta alcanzada' : 'Por debajo de meta'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cumplimiento Demanda</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {kpis.fulfillment.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              Producción real vs demanda proyectada
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <PieChart className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Utilización Recursos</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-2">
              {kpis.utilization.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              Aprovechamiento de materia prima
            </p>
          </div>
        </div>
      )}

      {/* Gráficas de análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias de eficiencia */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencias de Eficiencia
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[70, 95]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value.toFixed(1)}%`,
                    name === 'eficiencia' ? 'Eficiencia' : 
                    name === 'cumplimiento' ? 'Cumplimiento' : 'Utilización'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="eficiencia" 
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pronóstico de eficiencia */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pronóstico de Eficiencia (7 días)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis domain={[75, 95]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value.toFixed(1)}%`,
                    name === 'eficienciaPronosticada' ? 'Eficiencia Pronosticada' : 'Objetivo'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="eficienciaPronosticada" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="eficienciaObjetivo" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="10 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resumen estadístico */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Resumen Estadístico del Período
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-700 mb-1">Producción Total</p>
            <p className="text-2xl font-bold text-blue-900">
              {productionData.reduce((sum, d) => sum + d.actual_production, 0).toLocaleString()}
            </p>
            <p className="text-xs text-blue-600">unidades</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-700 mb-1">Tiempo Total</p>
            <p className="text-2xl font-bold text-green-900">
              {productionData.reduce((sum, d) => sum + d.standard_process_time, 0).toFixed(1)}
            </p>
            <p className="text-xs text-green-600">horas</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-700 mb-1">Predicciones</p>
            <p className="text-2xl font-bold text-purple-900">
              {predictions.length}
            </p>
            <p className="text-xs text-purple-600">generadas</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-700 mb-1">Confianza Promedio</p>
            <p className="text-2xl font-bold text-orange-900">
              {predictions.length > 0 
                ? (predictions.reduce((sum, p) => sum + p.confidence_level, 0) / predictions.length * 100).toFixed(1)
                : '0'
              }%
            </p>
            <p className="text-xs text-orange-600">del modelo</p>
          </div>
        </div>
      </div>

      {/* Recomendaciones del sistema */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recomendaciones del Sistema
        </h3>
        
        <div className="space-y-3">
          {kpis && kpis.efficiency < 85 && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-red-900">Eficiencia por debajo del objetivo</p>
                <p className="text-sm text-red-700">
                  Implementar programa de mejora continua y revisar procesos críticos
                </p>
              </div>
            </div>
          )}
          
          {kpis && kpis.fulfillment < 95 && (
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-yellow-900">Cumplimiento de demanda mejorable</p>
                <p className="text-sm text-yellow-700">
                  Ajustar planificación de producción y optimizar recursos disponibles
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-blue-900">Modelo predictivo activo</p>
              <p className="text-sm text-blue-700">
                Continuar recopilando datos para mejorar precisión de predicciones
              </p>
            </div>
          </div>
          
          {forecastData.some(eff => eff > 90) && (
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-green-900">Oportunidad de optimización</p>
                <p className="text-sm text-green-700">
                  El pronóstico indica condiciones favorables para aumentar producción
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};