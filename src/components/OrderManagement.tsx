import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Order } from '../types';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck,
  PlayCircle,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [mlStats, setMlStats] = useState<any>(null);

  useEffect(() => {
    loadOrders();
    loadMLStats();
  }, [filter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = filter === 'all' 
        ? await apiClient.getOrders()
        : await apiClient.getOrders(filter);
      setOrders(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMLStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/orders/ml/stats');
      const stats = await response.json();
      setMlStats(stats);
    } catch (error) {
      console.error('Error cargando estadísticas ML:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      loadOrders();
      if (newStatus === 'delivered') {
        setTimeout(loadMLStats, 2000); // Recargar stats después de re-entrenar
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const retrainModel = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/orders/ml/retrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.stats && result.stats.accuracy !== undefined) {
        alert(`Modelo re-entrenado exitosamente!\nPrecisión: ${result.stats.accuracy.toFixed(2)}%`);
      } else {
        alert('Modelo re-entrenado exitosamente!');
      }
      
      loadMLStats();
    } catch (error) {
      console.error('Error re-entrenando modelo:', error);
      alert(`Error al re-entrenar el modelo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Producción';
      case 'completed': return 'Completado';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  const filteredOrders = orders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Pedidos
              </h1>
              <p className="text-gray-600">
                Control y despacho de pedidos
              </p>
            </div>
          </div>

          <button
            onClick={retrainModel}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-entrenar Modelo</span>
          </button>
        </div>
      </div>

      {/* ML Stats */}
      {mlStats && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">🤖 Modelo de Machine Learning</h3>
              <p className="text-sm opacity-90">{mlStats.modelType}</p>
            </div>
            <TrendingUp className="w-16 h-16 opacity-50" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs opacity-90">Precisión</p>
              <p className="text-2xl font-bold">{mlStats.accuracy.toFixed(2)}%</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs opacity-90">Datos de Entrenamiento</p>
              <p className="text-2xl font-bold">{mlStats.totalDataCount}</p>
              <p className="text-xs opacity-75">pedidos entregados</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs opacity-90">Árboles (Estimators)</p>
              <p className="text-2xl font-bold">{mlStats.nEstimators}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs opacity-90">Profundidad Máxima</p>
              <p className="text-2xl font-bold">{mlStats.maxDepth}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Estado</p>
              <p className="text-lg font-semibold">
                {mlStats.isTrained ? '✅ Entrenado y Activo' : '⏳ Entrenando...'}
              </p>
            </div>
            {mlStats.lastTrainingDate && (
              <div className="text-right">
                <p className="text-sm opacity-90">Último Entrenamiento</p>
                <p className="text-sm font-medium">
                  {new Date(mlStats.lastTrainingDate).toLocaleString('es-ES')}
                </p>
              </div>
            )}
          </div>

          {mlStats.trainingHistory && mlStats.trainingHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white border-opacity-30">
              <p className="text-sm font-semibold mb-2">📊 Historial de Re-entrenamientos</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {mlStats.trainingHistory.slice().reverse().map((history: any, index: number) => (
                  <div key={index} className="bg-white bg-opacity-10 rounded p-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {new Date(history.date).toLocaleString('es-ES')}
                      </span>
                      <span className="bg-white bg-opacity-30 px-2 py-1 rounded">
                        {history.accuracy}% precisión
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 opacity-75">
                      <span>📦 {history.dataCount} datos</span>
                      <span>⏱️ {history.trainingTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'in_progress' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En Producción
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completados
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'delivered' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Entregados
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-gray-600">Cargando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No hay pedidos en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Est.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.order_number}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.product_name}</div>
                      {order.width && (
                        <div className="text-xs text-gray-500">
                          {order.width}×{order.height}×{order.depth} {order.dimension_unit}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-1" />
                        {order.estimated_production_time.toFixed(1)}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'in_progress')}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Iniciar Producción"
                          >
                            <PlayCircle className="w-5 h-5" />
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Marcar Completado"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="text-purple-600 hover:text-purple-900 flex items-center"
                            title="Marcar Entregado"
                          >
                            <Truck className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
