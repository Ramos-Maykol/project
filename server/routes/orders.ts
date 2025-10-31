import { Router } from 'express';
import express from 'express';
import { pool } from '../database/config';
import { predictionModel } from '../ml/prediction-model';

const router = Router();

// Obtener todos los tipos de productos
router.get('/product-types', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM product_types ORDER BY name'
    );
    const data = result.rows.map((row: any) => ({
      ...row,
      base_production_time: parseFloat(row.base_production_time),
      complexity_factor: parseFloat(row.complexity_factor)
    }));
    res.json(data);
  } catch (error) {
    console.error('Error al obtener tipos de productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Calcular estimación de tiempo de entrega usando ML
router.post('/estimate-delivery', async (req, res) => {
  try {
    const { product_type_id, quantity, width, height, depth, priority } = req.body;
    
    // Validar datos de entrada
    if (!product_type_id || !quantity) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos: product_type_id y quantity son obligatorios' 
      });
    }

    console.log('📝 Estimando entrega para:', { product_type_id, quantity, width, height, depth, priority });
    
    // Usar modelo ML para predicción
    const predicted_hours = await predictionModel.predict({
      product_type_id,
      quantity,
      width,
      height,
      depth,
      priority: priority || 1
    });
    
    // Calcular tiempo de cola considerando procesamiento paralelo (2 productos simultáneos)
    const parallelCapacity = 2; // Número de productos que se pueden procesar en paralelo
    const queueQuery = await pool.query(
      `SELECT estimated_production_time
       FROM orders
       WHERE status IN ('pending', 'in_progress')
       ORDER BY estimated_production_time DESC`
    );

    let effectiveQueueHours = 0;
    const queueTimes = queueQuery.rows.map((row: any) => parseFloat(row.estimated_production_time));

    // Procesar en lotes paralelos
    for (let i = 0; i < queueTimes.length; i += parallelCapacity) {
      const batch = queueTimes.slice(i, i + parallelCapacity);
      const batchTime = Math.max(...batch); // Tiempo del lote es el producto más largo
      effectiveQueueHours += batchTime;
    }

    console.log(`📊 Cola: ${queueTimes.length} productos, tiempo efectivo: ${effectiveQueueHours.toFixed(2)} hrs`);
    
    const total_hours = effectiveQueueHours + predicted_hours;
    const days_to_delivery = Math.ceil(predicted_hours / 8); // Fecha solo considera el tiempo del pedido actual
    
    console.log(`🔮 Predicción: ${predicted_hours.toFixed(2)} hrs, días entrega: ${days_to_delivery}`);
    
    const delivery_date = new Date();
    delivery_date.setDate(delivery_date.getDate() + days_to_delivery);
    
    // Posición en cola
    const positionResult = await pool.query(
      `SELECT COUNT(*) + 1 as position FROM orders 
       WHERE status IN ('pending', 'in_progress')`
    );
    
    res.json({
      estimated_hours: predicted_hours,
      estimated_delivery_date: delivery_date.toISOString(),
      queue_position: parseInt(positionResult.rows[0].position),
      model_used: 'RandomForest ML'
    });
  } catch (error) {
    console.error('❌ Error al calcular estimación:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Crear nuevo pedido (demo académica sin autenticación)
router.post('/', async (req, res) => {
  try {
    const user = { id: 1, email: 'demo@example.com' }; // Usuario demo para la tesis
    const {
      customer_name,
      product_type_id,
      quantity,
      width,
      height,
      depth,
      dimension_unit,
      priority
    } = req.body;
    
    // Validar datos requeridos
    if (!product_type_id || !quantity) {
      return res.status(400).json({ error: 'Tipo de producto y cantidad son requeridos' });
    }

    // Usar customer_name del request o valor por defecto
    const finalCustomerName = customer_name || 'Cliente Demo';
    
    // Generar número de orden
    const orderNumberResult = await pool.query(
      `SELECT 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
       LPAD((COUNT(*) + 1)::TEXT, 3, '0') as order_number 
       FROM orders WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );
    const order_number = orderNumberResult.rows[0].order_number;
    
    // Usar el modelo ML para calcular estimación
    const predicted_hours = await predictionModel.predict({
      product_type_id,
      quantity,
      width,
      height,
      depth,
      priority: priority || 1
    });

    const delivery_date = new Date();
    const days_to_delivery = Math.ceil(predicted_hours / 8);
    delivery_date.setDate(delivery_date.getDate() + days_to_delivery);
    
    // Insertar pedido (simplificado sin user_id ni created_by)
    const result = await pool.query(
      `INSERT INTO orders 
      (order_number, product_type_id, customer_name, quantity, width, height, depth, 
       dimension_unit, estimated_production_time, estimated_delivery_date, priority) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        order_number,
        product_type_id,
        finalCustomerName,
        quantity,
        width || null,
        height || null,
        depth || null,
        dimension_unit || 'cm',
        predicted_hours,
        delivery_date,
        priority || 1
      ]
    );
    
    console.log(`✅ Pedido ${order_number} creado por ${user.email}`);
    
    res.status(201).json({
      message: 'Pedido creado exitosamente',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener todos los pedidos (demo académica sin autenticación)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    // Consulta simplificada sin dependencias de user_id
    let query = `
      SELECT o.*, pt.name as product_name, pt.material_type
      FROM orders o
      LEFT JOIN product_types pt ON o.product_type_id = pt.id
    `;
    
    const params: any[] = [];
    
    // Filtrar por estado si se proporciona
    if (status) {
      query += ' WHERE o.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const result = await pool.query(query, params);
    const data = result.rows.map((row: any) => ({
      ...row,
      quantity: parseInt(row.quantity),
      width: row.width ? parseFloat(row.width) : null,
      height: row.height ? parseFloat(row.height) : null,
      depth: row.depth ? parseFloat(row.depth) : null,
      estimated_production_time: parseFloat(row.estimated_production_time),
      priority: parseInt(row.priority)
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener un pedido específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT o.*, pt.name as product_name, pt.material_type, pt.description
       FROM orders o
       LEFT JOIN product_types pt ON o.product_type_id = pt.id
       WHERE o.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Actualizar estado de pedido
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updateFields: string[] = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const params: any[] = [status, id];
    
    // Actualizar fechas según el estado
    if (status === 'in_progress') {
      updateFields.push('start_production_date = CURRENT_TIMESTAMP');
    } else if (status === 'completed') {
      updateFields.push('completion_date = CURRENT_TIMESTAMP');
    } else if (status === 'delivered') {
      updateFields.push('delivery_date = CURRENT_TIMESTAMP');
    }
    
    const result = await pool.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Si el pedido se marcó como entregado, re-entrenar el modelo
    if (status === 'delivered') {
      console.log('🎓 Pedido entregado, re-entrenando modelo...');
      predictionModel.retrain().catch(err => 
        console.error('Error re-entrenando modelo:', err)
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener cola de producción
router.get('/queue/current', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, pt.name as product_name
       FROM orders o
       LEFT JOIN product_types pt ON o.product_type_id = pt.id
       WHERE o.status IN ('pending', 'in_progress')
       ORDER BY o.priority DESC, o.order_date ASC`
    );
    
    const data = result.rows.map((row: any) => ({
      ...row,
      quantity: parseInt(row.quantity),
      estimated_production_time: parseFloat(row.estimated_production_time),
      priority: parseInt(row.priority)
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error al obtener cola:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener capacidad de producción
router.get('/capacity/overview', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM production_capacity 
       WHERE date >= CURRENT_DATE 
       ORDER BY date 
       LIMIT 30`
    );
    
    const data = result.rows.map((row: any) => ({
      ...row,
      total_hours_available: parseFloat(row.total_hours_available),
      hours_used: parseFloat(row.hours_used),
      hours_remaining: parseFloat(row.hours_remaining),
      shift_count: parseInt(row.shift_count),
      workers_available: parseInt(row.workers_available)
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error al obtener capacidad:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener estadísticas del modelo ML
router.get('/ml/stats', async (req, res) => {
  try {
    const stats = predictionModel.getModelStats();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas del modelo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Re-entrenar el modelo ML
router.post('/ml/retrain', async (req, res) => {
  try {
    await predictionModel.retrain();
    const stats = predictionModel.getModelStats();
    res.json({ 
      message: 'Modelo re-entrenado exitosamente',
      stats 
    });
  } catch (error) {
    console.error('Error al re-entrenar modelo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
