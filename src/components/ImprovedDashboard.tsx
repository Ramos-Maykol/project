import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Package, 
  CheckCircle,
  AlertCircle,
  Brain,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const ImprovedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [mlStats, setMlStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [ordersData, mlData] = await Promise.all([
        apiClient.getOrders(),
        fetch('http://localhost:3000/api/orders/ml/stats').then(r => r.json())
      ]);
      setOrders(ordersData);
      setMlStats(mlData);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Estadísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalHours: orders.reduce((sum, o) => sum + (o.estimated_production_time || 0), 0),
    queueHours: orders
      .filter(o => o.status === 'pending' || o.status === 'in_progress')
      .reduce((sum, o) => sum + (o.estimated_production_time || 0), 0)
  };

  // Datos para gráfica de tendencia (últimos 7 días)
  const last7Days = orders
    .filter(o => o.order_date)
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 7)
    .reverse()
    .map(o => ({
      date: new Date(o.order_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      pedidos: 1,
      horas: o.estimated_production_time || 0
    }));

  // Agrupar por fecha
  const trendData = last7Days.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      existing.pedidos += 1;
      existing.horas += curr.horas;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);

  // Datos para gráfica de estados
  const statusData = [
    { name: 'Pendientes', value: stats.pending, color: COLORS[2] },
    { name: 'En Producción', value: stats.inProgress, color: COLORS[0] },
    { name: 'Completados', value: stats.completed, color: COLORS[1] },
    { name: 'Entregados', value: stats.delivered, color: COLORS[3] }
  ].filter(item => item.value > 0);

  // Pedidos recientes
  const recentOrders = orders
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Panel de Control Inteligente
        </h1>
        <p className="text-blue-100">
          Bienvenido, {user?.name}. Sistema de manufactura con Machine Learning.
        </p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pedidos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Todos los estados</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* En Cola */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Cola</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending + stats.inProgress}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.queueHours.toFixed(1)}h estimadas</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Entregados */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Entregados</p>
              <p className="text-3xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0}% del total
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Precisión ML */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Precisión ML</p>
              <p className="text-3xl font-bold text-gray-900">
                {mlStats?.accuracy.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{mlStats?.totalDataCount} datos</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Pedidos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Tendencia de Pedidos (Últimos 7 días)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#3b82f6" name="Pedidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Estado */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Distribución por Estado
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Información del Modelo ML */}
      {mlStats && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              Modelo de Machine Learning
            </h3>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
              {mlStats.isTrained ? '✅ Activo' : '⏳ Entrenando'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <p className="text-xs opacity-90">Tipo</p>
              <p className="text-sm font-semibold">{mlStats.modelType}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <p className="text-xs opacity-90">Árboles</p>
              <p className="text-sm font-semibold">{mlStats.nEstimators}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <p className="text-xs opacity-90">Datos</p>
              <p className="text-sm font-semibold">{mlStats.totalDataCount}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <p className="text-xs opacity-90">Precisión</p>
              <p className="text-sm font-semibold">{mlStats.accuracy.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Pedidos Recientes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          Pedidos Recientes
        </h3>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === 'delivered' ? 'bg-green-500' :
                  order.status === 'completed' ? 'bg-blue-500' :
                  order.status === 'in_progress' ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{order.product_name}</p>
                <p className="text-xs text-gray-500">{order.estimated_production_time?.toFixed(1)}h</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas y Recomendaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
            Alertas del Sistema
          </h3>
          <div className="space-y-3">
            {stats.pending > 10 && (
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Alta carga de pedidos</p>
                  <p className="text-xs text-gray-600">{stats.pending} pedidos pendientes</p>
                </div>
              </div>
            )}
            {stats.queueHours > 100 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cola de producción extensa</p>
                  <p className="text-xs text-gray-600">{stats.queueHours.toFixed(0)} horas en cola</p>
                </div>
              </div>
            )}
            {mlStats && mlStats.accuracy < 85 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Precisión ML mejorable</p>
                  <p className="text-xs text-gray-600">Agregar más datos históricos</p>
                </div>
              </div>
            )}
            {stats.pending === 0 && stats.inProgress === 0 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sin pedidos en cola</p>
                  <p className="text-xs text-gray-600">Capacidad disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-purple-600" />
            Recomendaciones
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Optimizar flujo de trabajo</p>
                <p className="text-xs text-gray-600">Revisar pedidos en "Gestión de Pedidos"</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
              <Brain className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Mejorar predicciones</p>
                <p className="text-xs text-gray-600">Entregar pedidos para entrenar el modelo</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Generar reportes</p>
                <p className="text-xs text-gray-600">Analizar tendencias en "Reportes"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
