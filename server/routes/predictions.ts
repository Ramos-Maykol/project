import { Router } from 'express';
import { pool } from '../database/config';

const router = Router();

// Obtener todas las predicciones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM predictions ORDER BY created_at DESC'
    );
    // Convertir valores numéricos
    const data = result.rows.map((row: any) => ({
      ...row,
      raw_material_available: parseFloat(row.raw_material_available),
      standard_process_time: parseFloat(row.standard_process_time),
      projected_demand: parseFloat(row.projected_demand),
      predicted_production: parseFloat(row.predicted_production),
      confidence_level: parseFloat(row.confidence_level)
    }));
    res.json(data);
  } catch (error) {
    console.error('Error al obtener predicciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Insertar nueva predicción
router.post('/', async (req, res) => {
  try {
    const {
      raw_material_available,
      standard_process_time,
      projected_demand,
      predicted_production,
      confidence_level,
      prediction_date,
      created_by
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO predictions 
      (raw_material_available, standard_process_time, projected_demand, predicted_production, confidence_level, prediction_date, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [raw_material_available, standard_process_time, projected_demand, predicted_production, confidence_level, prediction_date, created_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al insertar predicción:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
