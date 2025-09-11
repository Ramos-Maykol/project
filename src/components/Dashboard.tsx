import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../database';
import { ProductionData } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Package, 
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [metrics, setMetrics] = useState({
    averageEfficiency: 0,
    maxEfficiency: 0,
    minEfficiency: 0,
    trend: 'stable' as 'up' | 'down' | 'stable'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await db.getProductionTrends(7);
      const efficiencyMetrics = await db.getEfficiencyMetrics();
      setProductionData(data);
      setMetrics(efficiencyMetrics);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  };

  const chartData = productionData.map(data => ({
    date: new Date(data.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    demanda: data.projected_demand,
    produccion: data.actual_production,
    eficiencia: data.efficiency_rate,
    tiempo: data.standard_process_time
  }));

  const getTrendIcon = () => {
    switch (metrics.trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const getEfficiencyStatus = () => {
    if (metrics.averageEfficiency >= 85) return { color: 'green', icon: CheckCircle, text: 'Óptimo' };
    if (metrics.averageEfficiency >= 75) return { color: 'yellow', icon: AlertTriangle, text: 'Aceptable' };
    return { color: 'red', icon: AlertTriangle, text: 'Crítico' };
  };

  const efficiencyStatus = getEfficiencyStatus();
  const StatusIcon = efficiencyStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Control - Producción
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user?.name}. Monitoreo en tiempo real de procesos manufactureros.
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eficiencia Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.averageEfficiency.toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-full bg-${efficiencyStatus.color}-100`}>
              <StatusIcon className={`w-6 h-6 text-${efficiencyStatus.color}-600`} />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            {getTrendIcon()}
            <span className="text-sm text-gray-600">
              Tendencia: {metrics.trend === 'up' ? 'Mejorando' : metrics.trend === 'down' ? 'Declinando' : 'Estable'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Producción Actual</p>
              <p className="text-2xl font-bold text-gray-900">
                {productionData[productionData.length - 1]?.actual_production || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">unidades/día</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Proceso</p>
              <p className="text-2xl font-bold text-gray-900">
                {productionData[productionData.length - 1]?.standard_process_time.toFixed(1) || 0}h
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">por lote</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumplimiento Meta</p>
              <p className="text-2xl font-bold text-gray-900">
                {((metrics.averageEfficiency / 85) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">objetivo: 85%</span>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Demanda vs Producción */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Demanda vs Producción Real
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} unidades`,
                    name === 'demanda' ? 'Demanda Proyectada' : 'Producción Real'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="demanda" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="produccion" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Eficiencia */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eficiencia de Producción
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[70, 95]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Eficiencia']}
                />
                <Bar 
                  dataKey="eficiencia" 
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resumen de estado */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estado del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Sistema Operativo</p>
              <p className="text-sm text-green-700">Todos los módulos funcionando</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Modelo Predictivo</p>
              <p className="text-sm text-blue-700">Entrenado con {productionData.length} registros</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Última Actualización</p>
              <p className="text-sm text-orange-700">
                {productionData[productionData.length - 1]?.date ? 
                  new Date(productionData[productionData.length - 1].date).toLocaleDateString('es-ES') : 
                  'Sin datos'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};