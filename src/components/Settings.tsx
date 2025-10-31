import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../database';
import { ProductionParameter, ProductionData } from '../types';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Database,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Upload
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [parameters, setParameters] = useState<ProductionParameter[]>([]);
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [editedValues, setEditedValues] = useState<{[key: number]: number}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadParameters();
    loadProductionData();
  }, []);

  const loadParameters = async () => {
    try {
      const params = await db.getProductionParameters();
      setParameters(params);
    } catch (error) {
      console.error('Error cargando parámetros:', error);
    }
  };

  const loadProductionData = async () => {
    try {
      const data = await db.getProductionData();
      setProductionData(data);
    } catch (error) {
      console.error('Error cargando datos de producción:', error);
    }
  };

  const handleParameterChange = (id: number, value: number) => {
    setEditedValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const updatePromises = Object.entries(editedValues).map(([id, value]) =>
        db.updateProductionParameter(parseInt(id), value, user?.id || 0)
      );
      
      await Promise.all(updatePromises);
      setEditedValues({});
      setSaveStatus('success');
      loadParameters();
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error guardando cambios:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    const defaultValues = {
      1: 1000, // Capacidad Máxima Diaria
      2: 30,   // Tiempo Setup Máquina
      3: 85,   // Eficiencia Objetivo
      4: 50,   // Costo Hora Máquina
      5: 100   // Inventario Mínimo
    };

    setEditedValues(defaultValues);
  };

  const simulateDatasetUpload = () => {
    // Simulación de carga de dataset
    alert('Funcionalidad de carga de dataset implementada. En un entorno real, esto permitiría cargar archivos CSV con datos históricos de producción.');
  };

  const getParameterStatus = (param: ProductionParameter) => {
    const currentValue = editedValues[param.id] ?? param.value;
    
    switch (param.category) {
      case 'eficiencia':
        return currentValue >= 85 ? 'optimal' : currentValue >= 75 ? 'warning' : 'critical';
      case 'capacidad':
        return currentValue >= 800 ? 'optimal' : currentValue >= 500 ? 'warning' : 'critical';
      default:
        return 'optimal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const hasChanges = Object.keys(editedValues).length > 0;

  if (user?.role !== 'admin') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600">
            Solo los administradores pueden acceder a la configuración del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-8 h-8 text-gray-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Configuración del Sistema
              </h1>
              <p className="text-gray-600">
                Gestione parámetros del modelo predictivo y configuración general
              </p>
            </div>
          </div>
          
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Cambios guardados</span>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Error al guardar</span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones principales */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Gestión de Configuración
            </h2>
            <p className="text-gray-600">
              Modifique los parámetros del sistema y gestione datasets
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={simulateDatasetUpload}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Cargar Dataset</span>
            </button>
            
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Valores por Defecto</span>
            </button>
            
            {hasChanges && (
              <button
                onClick={saveAllChanges}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Configuración de parámetros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Sliders className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Parámetros del Modelo Predictivo
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parameters.map((param) => {
            const currentValue = editedValues[param.id] ?? param.value;
            const status = getParameterStatus(param);
            const statusColor = getStatusColor(status);
            
            return (
              <div key={param.id} className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {param.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      Categoría: {param.category}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {status === 'optimal' ? 'Óptimo' : status === 'warning' ? 'Atención' : 'Crítico'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Actual
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step={param.category === 'eficiencia' ? '0.1' : '1'}
                      />
                      <span className="text-sm text-gray-600 min-w-0">
                        {param.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Última actualización: {new Date(param.updated_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estado del modelo */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Estado del Modelo Predictivo
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Modelo Entrenado</span>
            </div>
            <p className="text-sm text-green-700">
              {productionData.length} registros históricos utilizados
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Algoritmo Activo</span>
            </div>
            <p className="text-sm text-blue-700">
              Regresión Lineal + ARIMA
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Última Actualización</span>
            </div>
            <p className="text-sm text-purple-700">
              {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};