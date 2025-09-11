import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../database';
import { ProductionData, ProductionParameter } from '../types';
import { 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Database, 
  Settings,
  Upload,
  Download
} from 'lucide-react';

export const DataManagement: React.FC = () => {
  const { user } = useAuth();
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [parameters, setParameters] = useState<ProductionParameter[]>([]);
  const [showNewDataForm, setShowNewDataForm] = useState(false);
  const [editingParameter, setEditingParameter] = useState<number | null>(null);
  const [newData, setNewData] = useState({
    raw_material_available: '',
    standard_process_time: '',
    projected_demand: '',
    actual_production: '',
    efficiency_rate: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodData, params] = await Promise.all([
        db.getProductionData(),
        db.getProductionParameters()
      ]);
      setProductionData(prodData);
      setParameters(params);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleSubmitNewData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.insertProductionData({
        raw_material_available: parseFloat(newData.raw_material_available),
        standard_process_time: parseFloat(newData.standard_process_time),
        projected_demand: parseFloat(newData.projected_demand),
        actual_production: parseFloat(newData.actual_production),
        efficiency_rate: parseFloat(newData.efficiency_rate),
        date: newData.date,
        created_by: user?.id || 0
      });
      
      setNewData({
        raw_material_available: '',
        standard_process_time: '',
        projected_demand: '',
        actual_production: '',
        efficiency_rate: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowNewDataForm(false);
      loadData();
    } catch (error) {
      console.error('Error insertando datos:', error);
    }
  };

  const handleUpdateParameter = async (id: number, newValue: number) => {
    try {
      await db.updateProductionParameter(id, newValue, user?.id || 0);
      setEditingParameter(null);
      loadData();
    } catch (error) {
      console.error('Error actualizando parámetro:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Materia Prima', 'Tiempo Proceso', 'Demanda', 'Producción Real', 'Eficiencia'];
    const csvContent = [
      headers.join(','),
      ...productionData.map(data => [
        data.date,
        data.raw_material_available,
        data.standard_process_time,
        data.projected_demand,
        data.actual_production,
        data.efficiency_rate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos_produccion_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Datos de Producción
            </h1>
            <p className="text-gray-600">
              Administre parámetros y registros históricos de producción
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => setShowNewDataForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Registro</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parámetros de Producción */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Parámetros de Producción
            </h2>
          </div>
          
          <div className="space-y-4">
            {parameters.map((param) => (
              <div key={param.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{param.name}</h3>
                  <p className="text-sm text-gray-600">Categoría: {param.category}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {editingParameter === param.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        defaultValue={param.value}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            handleUpdateParameter(param.id, parseFloat(target.value));
                          }
                        }}
                      />
                      <button
                        onClick={() => setEditingParameter(null)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {param.value} {param.unit}
                      </span>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => setEditingParameter(param.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datos de Producción Recientes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Registros Recientes
            </h2>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {productionData.slice(0, 10).map((data) => (
              <div key={data.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">
                    {new Date(data.date).toLocaleDateString('es-ES')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    data.efficiency_rate >= 85 
                      ? 'bg-green-100 text-green-800'
                      : data.efficiency_rate >= 75
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {data.efficiency_rate.toFixed(1)}% eficiencia
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Demanda: {data.projected_demand}</div>
                  <div>Producción: {data.actual_production}</div>
                  <div>Materia Prima: {data.raw_material_available}</div>
                  <div>Tiempo: {data.standard_process_time}h</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para nuevo registro */}
      {showNewDataForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Nuevo Registro de Producción
              </h3>
              <button
                onClick={() => setShowNewDataForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitNewData} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materia Prima Disponible
                </label>
                <input
                  type="number"
                  value={newData.raw_material_available}
                  onChange={(e) => setNewData({...newData, raw_material_available: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cantidad en unidades"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo Estándar de Proceso (horas)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newData.standard_process_time}
                  onChange={(e) => setNewData({...newData, standard_process_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Horas por lote"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Demanda Proyectada
                </label>
                <input
                  type="number"
                  value={newData.projected_demand}
                  onChange={(e) => setNewData({...newData, projected_demand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Unidades esperadas"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producción Real
                </label>
                <input
                  type="number"
                  value={newData.actual_production}
                  onChange={(e) => setNewData({...newData, actual_production: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Unidades producidas"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eficiencia (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={newData.efficiency_rate}
                  onChange={(e) => setNewData({...newData, efficiency_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Porcentaje de eficiencia"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newData.date}
                  onChange={(e) => setNewData({...newData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewDataForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};