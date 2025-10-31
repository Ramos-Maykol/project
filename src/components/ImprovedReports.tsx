import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { 
  FileText, 
  Download, 
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Package,
  Clock,
  Brain
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { jsPDF } from 'jspdf';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ImprovedReports: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [mlStats, setMlStats] = useState<any>(null);
  const [reportPeriod, setReportPeriod] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [reportPeriod]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, mlData] = await Promise.all([
        apiClient.getOrders(),
        fetch('http://localhost:3000/api/orders/ml/stats').then(r => r.json())
      ]);
      setOrders(ordersData);
      setMlStats(mlData);
    } catch (error) {
      console.error('Error cargando datos del reporte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Estadísticas de pedidos
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalHours: orders.reduce((sum, o) => sum + (o.estimated_production_time || 0), 0),
    avgHours: orders.length > 0 
      ? orders.reduce((sum, o) => sum + (o.estimated_production_time || 0), 0) / orders.length 
      : 0
  };

  // Datos para gráfica de estados
  const statusData = [
    { name: 'Pendientes', value: orderStats.pending, color: COLORS[2] },
    { name: 'En Producción', value: orderStats.inProgress, color: COLORS[0] },
    { name: 'Completados', value: orderStats.completed, color: COLORS[1] },
    { name: 'Entregados', value: orderStats.delivered, color: COLORS[4] }
  ];

  // Datos para gráfica de tiempos por tipo de producto
  const productTimeData = orders.reduce((acc: any[], order) => {
    const existing = acc.find(item => item.product === order.product_name);
    if (existing) {
      existing.totalTime += order.estimated_production_time || 0;
      existing.count += 1;
    } else {
      acc.push({
        product: order.product_name || 'Desconocido',
        totalTime: order.estimated_production_time || 0,
        count: 1
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    avgTime: (item.totalTime / item.count).toFixed(1)
  }));

  // Datos de tendencia temporal (últimos 30 días)
  const trendData = orders
    .filter(o => o.order_date)
    .sort((a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime())
    .slice(-30)
    .map(o => ({
      date: new Date(o.order_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      hours: o.estimated_production_time || 0,
      status: o.status
    }));

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE INTEGRAL DE MANUFACTURA', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(14);
    doc.text('Sistema Predictivo con Machine Learning', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Información del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, yPos);
    yPos += 12;

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    // SECCIÓN 1: MODELO DE MACHINE LEARNING
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('1. MODELO DE MACHINE LEARNING', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (mlStats) {
      doc.text(`• Tipo de Modelo: ${mlStats.modelType}`, 25, yPos);
      yPos += 6;
      doc.text(`• Número de Árboles: ${mlStats.nEstimators}`, 25, yPos);
      yPos += 6;
      doc.text(`• Profundidad Máxima: ${mlStats.maxDepth}`, 25, yPos);
      yPos += 6;
      doc.text(`• Precisión Actual: ${mlStats.accuracy.toFixed(2)}%`, 25, yPos);
      yPos += 6;
      doc.text(`• Datos de Entrenamiento: ${mlStats.totalDataCount} pedidos entregados`, 25, yPos);
      yPos += 6;
      doc.text(`• Estado: ${mlStats.isTrained ? 'Entrenado y Activo' : 'En Entrenamiento'}`, 25, yPos);
      yPos += 6;
      if (mlStats.lastTrainingDate) {
        doc.text(`• Último Entrenamiento: ${new Date(mlStats.lastTrainingDate).toLocaleString('es-ES')}`, 25, yPos);
        yPos += 6;
      }
    }
    yPos += 8;

    // SECCIÓN 2: GESTIÓN DE PEDIDOS
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('2. GESTIÓN DE PEDIDOS', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Total de Pedidos: ${orderStats.total}`, 25, yPos);
    yPos += 6;
    doc.text(`• Pendientes: ${orderStats.pending}`, 25, yPos);
    yPos += 6;
    doc.text(`• En Producción: ${orderStats.inProgress}`, 25, yPos);
    yPos += 6;
    doc.text(`• Completados: ${orderStats.completed}`, 25, yPos);
    yPos += 6;
    doc.text(`• Entregados: ${orderStats.delivered}`, 25, yPos);
    yPos += 6;
    doc.text(`• Horas Totales Estimadas: ${orderStats.totalHours.toFixed(1)}h`, 25, yPos);
    yPos += 6;
    doc.text(`• Promedio por Pedido: ${orderStats.avgHours.toFixed(1)}h`, 25, yPos);
    yPos += 10;

    // SECCIÓN 3: ANÁLISIS POR PRODUCTO
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('3. ANÁLISIS POR TIPO DE PRODUCTO', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    productTimeData.slice(0, 5).forEach(item => {
      doc.text(`• ${item.product}: ${item.count} pedidos, Promedio: ${item.avgTime}h`, 25, yPos);
      yPos += 6;
    });
    yPos += 8;

    // SECCIÓN 4: HISTORIAL DE RE-ENTRENAMIENTOS
    if (mlStats && mlStats.trainingHistory && mlStats.trainingHistory.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 92, 246);
      doc.text('4. HISTORIAL DE RE-ENTRENAMIENTOS', 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      mlStats.trainingHistory.slice(-5).reverse().forEach((h: any, index: number) => {
        doc.text(`${index + 1}. ${new Date(h.date).toLocaleString('es-ES')}`, 25, yPos);
        yPos += 5;
        doc.text(`   Datos: ${h.dataCount} | Precisión: ${h.accuracy}% | Tiempo: ${h.trainingTime}ms`, 25, yPos);
        yPos += 6;
      });
      yPos += 8;
    }

    // SECCIÓN 5: RECOMENDACIONES
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('5. RECOMENDACIONES DEL SISTEMA', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (orderStats.pending > 10) {
      doc.text(`• Alta carga de pedidos pendientes (${orderStats.pending}). Considerar aumentar capacidad.`, 25, yPos);
      yPos += 6;
    }
    
    if (mlStats && mlStats.accuracy < 85) {
      doc.text(`• Precisión del modelo por debajo del 85%. Recomendado agregar más datos históricos.`, 25, yPos);
      yPos += 6;
    }
    
    if (mlStats && mlStats.totalDataCount < 50) {
      doc.text(`• Datos de entrenamiento insuficientes (${mlStats.totalDataCount}). Recomendado mínimo 100.`, 25, yPos);
      yPos += 6;
    }

    doc.text(`• Continuar entregando pedidos para mejorar la precisión del modelo ML.`, 25, yPos);
    yPos += 6;
    doc.text(`• Revisar pedidos en cola para optimizar tiempos de entrega.`, 25, yPos);

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount} - Sistema de Manufactura Inteligente`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Guardar PDF
    doc.save(`reporte_manufactura_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['Número Orden', 'Cliente', 'Producto', 'Cantidad', 'Estado', 'Tiempo Estimado (h)', 'Fecha Orden'];
    const rows = orders.map(o => [
      o.order_number,
      o.customer_name,
      o.product_name,
      o.quantity,
      o.status,
      o.estimated_production_time?.toFixed(1) || '0',
      new Date(o.order_date).toLocaleDateString('es-ES')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del reporte...</p>
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
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reportes Integrales
              </h1>
              <p className="text-gray-600">
                Análisis completo de producción, pedidos y predicciones ML
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={exportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={generatePDFReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Generar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Pedidos</p>
              <p className="text-3xl font-bold">{orderStats.total}</p>
            </div>
            <Package className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Entregados</p>
              <p className="text-3xl font-bold">{orderStats.delivered}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Horas Totales</p>
              <p className="text-3xl font-bold">{orderStats.totalHours.toFixed(0)}</p>
            </div>
            <Clock className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Precisión ML</p>
              <p className="text-3xl font-bold">{mlStats?.accuracy.toFixed(1)}%</p>
            </div>
            <Brain className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Distribución por Estado
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
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
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Tiempo Promedio por Producto */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Tiempo Promedio por Producto
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productTimeData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="avgTime" fill="#10b981" name="Promedio (h)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendencia Temporal */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
          Tendencia de Tiempos de Producción
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} name="Horas" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Información del Modelo ML */}
      {mlStats && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">🤖 Información del Modelo ML</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-90">Tipo</p>
              <p className="text-lg font-semibold">{mlStats.modelType}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Árboles</p>
              <p className="text-lg font-semibold">{mlStats.nEstimators}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Datos</p>
              <p className="text-lg font-semibold">{mlStats.totalDataCount}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Precisión</p>
              <p className="text-lg font-semibold">{mlStats.accuracy.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
