import { Router } from 'express';
import { pool } from '../database/config';

const router = Router();

// Obtener todos los parámetros
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM production_parameters ORDER BY id'
    );
    // Convertir valores numéricos
    const data = result.rows.map((row: any) => ({
      ...row,
      value: parseFloat(row.value)
    }));
    res.json(data);
  } catch (error) {
    console.error('Error al obtener parámetros:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Actualizar parámetro
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { value, updated_by } = req.body;
    
    const result = await pool.query(
      'UPDATE production_parameters SET value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [value, updated_by, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parámetro no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar parámetro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
