import { Router } from 'express';
import { pool } from '../database/config';

const router = Router();

// Obtener todos los datos de producción
router.get('/data', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM production_data ORDER BY date DESC'
    );
    // Convertir valores numéricos de string a number
    const data = result.rows.map((row: any) => ({
      ...row,
      raw_material_available: parseFloat(row.raw_material_available),
      standard_process_time: parseFloat(row.standard_process_time),
      projected_demand: parseFloat(row.projected_demand),
      actual_production: parseFloat(row.actual_production),
      efficiency_rate: parseFloat(row.efficiency_rate)
    }));
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos de producción:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Insertar nuevo dato de producción
router.post('/data', async (req, res) => {
  try {
    const {
      raw_material_available,
      standard_process_time,
      projected_demand,
      actual_production,
      efficiency_rate,
      date,
      created_by
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO production_data 
      (raw_material_available, standard_process_time, projected_demand, actual_production, efficiency_rate, date, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [raw_material_available, standard_process_time, projected_demand, actual_production, efficiency_rate, date, created_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al insertar dato de producción:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener tendencias de producción
router.get('/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    const result = await pool.query(
      `SELECT * FROM production_data 
       WHERE date >= CURRENT_DATE - INTERVAL '${days} days' 
       ORDER BY date ASC`
    );
    
    // Convertir valores numéricos
    const data = result.rows.map((row: any) => ({
      ...row,
      raw_material_available: parseFloat(row.raw_material_available),
      standard_process_time: parseFloat(row.standard_process_time),
      projected_demand: parseFloat(row.projected_demand),
      actual_production: parseFloat(row.actual_production),
      efficiency_rate: parseFloat(row.efficiency_rate)
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener métricas de eficiencia
router.get('/efficiency-metrics', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM production_data 
       WHERE date >= CURRENT_DATE - INTERVAL '7 days' 
       ORDER BY date ASC`
    );
    
    const data = result.rows;
    
    if (data.length === 0) {
      return res.json({
        averageEfficiency: 0,
        maxEfficiency: 0,
        minEfficiency: 0,
        trend: 'stable'
      });
    }
    
    const efficiencies = data.map((d: any) => d.efficiency_rate);
    const average = efficiencies.reduce((sum: number, eff: number) => sum + eff, 0) / efficiencies.length;
    const max = Math.max(...efficiencies);
    const min = Math.min(...efficiencies);
    
    const firstHalf = efficiencies.slice(0, Math.floor(efficiencies.length / 2));
    const secondHalf = efficiencies.slice(Math.floor(efficiencies.length / 2));
    
    const firstAvg = firstHalf.reduce((sum: number, eff: number) => sum + eff, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum: number, eff: number) => sum + eff, 0) / secondHalf.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (secondAvg > firstAvg + 2) trend = 'up';
    else if (secondAvg < firstAvg - 2) trend = 'down';
    
    res.json({
      averageEfficiency: average,
      maxEfficiency: max,
      minEfficiency: min,
      trend
    });
  } catch (error) {
    console.error('Error al obtener métricas de eficiencia:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
