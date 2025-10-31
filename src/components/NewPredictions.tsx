import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import { ProductType, Order, DeliveryEstimate } from '../types';
import { 
  Package, 
  Clock, 
  Calendar, 
  Ruler,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

export const NewPredictions: React.FC = () => {
  const { user } = useAuth();
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    customer_name: '',
    product_type_id: '',
    quantity: 1,
    width: '',
    height: '',
    depth: '',
    dimension_unit: 'cm',
    priority: 1
  });

  useEffect(() => {
    loadProductTypes();
    loadRecentOrders();
  }, []);

  const loadProductTypes = async () => {
    try {
      const types = await apiClient.getProductTypes();
      setProductTypes(types);
    } catch (error) {
      console.error('Error cargando tipos de productos:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const orders = await apiClient.getOrders();
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateEstimate = async () => {
    if (!formData.product_type_id || !formData.quantity) {
      return;
    }

    setIsCalculating(true);
    try {
      const estimateData = await apiClient.estimateDelivery({
        product_type_id: parseInt(formData.product_type_id),
        quantity: parseInt(formData.quantity as any),
        width: formData.width ? parseFloat(formData.width) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        depth: formData.depth ? parseFloat(formData.depth) : undefined
      });
      setEstimate(estimateData);
    } catch (error) {
      console.error('Error calculando estimación:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.product_type_id) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    try {
      await apiClient.createOrder({
        ...formData,
        product_type_id: parseInt(formData.product_type_id),
        quantity: parseInt(formData.quantity as any),
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        depth: formData.depth ? parseFloat(formData.depth) : null,
        priority: parseInt(formData.priority as any),
        created_by: user?.id
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Limpiar formulario
      setFormData({
        customer_name: '',
        product_type_id: '',
        quantity: 1,
        width: '',
        height: '',
        depth: '',
        dimension_unit: 'cm',
        priority: 1
      });
      setEstimate(null);
      loadRecentOrders();
    } catch (error) {
      console.error('Error creando pedido:', error);
      alert('Error al crear el pedido');
    }
  };

  const selectedProduct = productTypes.find(p => p.id === parseInt(formData.product_type_id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Solicitar Producto
            </h1>
            <p className="text-gray-600">
              Calcule el tiempo de entrega estimado para su pedido
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de solicitud */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Datos del Pedido</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Tipo de producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Producto *
                </label>
                <select
                  name="product_type_id"
                  value={formData.product_type_id}
                  onChange={(e) => {
                    handleInputChange(e);
                    calculateEstimate();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {productTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.material_type}
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedProduct.description}
                  </p>
                )}
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={(e) => {
                    handleInputChange(e);
                    calculateEstimate();
                  }}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Dimensiones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="w-4 h-4 inline mr-2" />
                  Dimensiones (Opcional)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      name="width"
                      value={formData.width}
                      onChange={(e) => {
                        handleInputChange(e);
                        calculateEstimate();
                      }}
                      placeholder="Ancho"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={(e) => {
                        handleInputChange(e);
                        calculateEstimate();
                      }}
                      placeholder="Alto"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="depth"
                      value={formData.depth}
                      onChange={(e) => {
                        handleInputChange(e);
                        calculateEstimate();
                      }}
                      placeholder="Profundidad"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  name="dimension_unit"
                  value={formData.dimension_unit}
                  onChange={handleInputChange}
                  className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cm">Centímetros</option>
                  <option value="m">Metros</option>
                  <option value="in">Pulgadas</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">Normal</option>
                  <option value="2">Alta</option>
                  <option value="3">Urgente</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Crear Pedido</span>
              </button>
            </form>
          </div>
        </div>

        {/* Panel de estimación */}
        <div className="space-y-6">
          {/* Estimación de tiempo */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Cálculo de Fecha de Entrega</h3>
            
            {isCalculating ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin" />
              </div>
            ) : estimate ? (
              <div className="space-y-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">Fecha de Pedido</span>
                  </div>
                  <p className="text-xl font-semibold">
                    {new Date().toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Hoy
                  </p>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Tiempo de Producción</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {estimate.estimated_hours.toFixed(1)} hrs
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Tiempo estimado de elaboración
                  </p>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">Fecha Estimada de Entrega</span>
                  </div>
                  <p className="text-xl font-semibold">
                    {new Date(estimate.estimated_delivery_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Cálculo: {new Date().toLocaleDateString('es-ES')} (hoy) + {estimate.estimated_hours.toFixed(1)} horas
                  </p>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5" />
                    <span className="text-sm">Posición en Cola</span>
                  </div>
                  <p className="text-2xl font-bold">
                    #{estimate.queue_position}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm opacity-75">
                  Complete los datos del producto para ver la estimación
                </p>
              </div>
            )}
          </div>

          {/* Mensaje de éxito */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">¡Pedido creado exitosamente!</span>
              </div>
            </div>
          )}

          {/* Pedidos recientes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recientes</h3>
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{order.order_number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'pending' ? 'Pendiente' :
                       order.status === 'in_progress' ? 'En Producción' :
                       order.status === 'completed' ? 'Completado' : 'Entregado'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.quantity} unidad(es) - {order.estimated_production_time.toFixed(1)} hrs
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
