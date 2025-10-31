import { Router } from 'express';
import express from 'express';
import { pool } from '../database/config';
import { requireAuth, requireAdmin } from './auth';

const router = Router();

// Aplicar middlewares de autenticación y admin a todas las rutas
router.use(requireAuth);
router.use(requireAdmin);

// ==================== GESTIÓN DE USUARIOS ====================

// Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.company,
        u.is_active, u.email_verified, u.created_at, u.last_login,
        r.name as role_name, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener un usuario específico
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.company,
        u.is_active, u.email_verified, u.created_at, u.last_login,
        u.role_id, r.name as role_name, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Actualizar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, company, role_id, is_active, email_verified } = req.body;

    const result = await pool.query(`
      UPDATE users 
      SET 
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        company = COALESCE($3, company),
        role_id = COALESCE($4, role_id),
        is_active = COALESCE($5, is_active),
        email_verified = COALESCE($6, email_verified)
      WHERE id = $7
      RETURNING id, email, full_name, phone, company, role_id, is_active, email_verified
    `, [full_name, phone, company, role_id, is_active, email_verified, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Eliminar usuario (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    // No permitir que el admin se elimine a sí mismo
    if (parseInt(id) === currentUser.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== GESTIÓN DE TIPOS DE PRODUCTOS ====================

// Obtener todos los tipos de productos
router.get('/product-types', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM product_types ORDER BY name
    `);

    const data = result.rows.map((row: any) => ({
      ...row,
      base_production_time: parseFloat(row.base_production_time),
      complexity_factor: parseFloat(row.complexity_factor)
    }));

    res.json(data);
  } catch (error) {
    console.error('Error obteniendo tipos de productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Crear nuevo tipo de producto
router.post('/product-types', async (req, res) => {
  try {
    const {
      name,
      description,
      material_type,
      base_production_time,
      complexity_factor
    } = req.body;

    // Validar datos requeridos
    if (!name || !material_type || !base_production_time || !complexity_factor) {
      return res.status(400).json({
        error: 'Nombre, tipo de material, tiempo base y factor de complejidad son requeridos'
      });
    }

    // Verificar si ya existe un tipo con ese nombre
    const existing = await pool.query(
      'SELECT id FROM product_types WHERE name = $1',
      [name]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un tipo de producto con ese nombre' });
    }

    const result = await pool.query(`
      INSERT INTO product_types (name, description, material_type, base_production_time, complexity_factor)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, material_type, base_production_time, complexity_factor]);

    res.status(201).json({
      message: 'Tipo de producto creado exitosamente',
      product_type: result.rows[0]
    });
  } catch (error) {
    console.error('Error creando tipo de producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Actualizar tipo de producto
router.put('/product-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      material_type,
      base_production_time,
      complexity_factor
    } = req.body;

    const result = await pool.query(`
      UPDATE product_types
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        material_type = COALESCE($3, material_type),
        base_production_time = COALESCE($4, base_production_time),
        complexity_factor = COALESCE($5, complexity_factor)
      WHERE id = $6
      RETURNING *
    `, [name, description, material_type, base_production_time, complexity_factor, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de producto no encontrado' });
    }

    res.json({
      message: 'Tipo de producto actualizado exitosamente',
      product_type: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando tipo de producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Eliminar tipo de producto
router.delete('/product-types/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay pedidos con este tipo de producto
    const ordersCheck = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE product_type_id = $1',
      [id]
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar este tipo de producto porque tiene pedidos asociados'
      });
    }

    const result = await pool.query(
      'DELETE FROM product_types WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de producto no encontrado' });
    }

    res.json({ message: 'Tipo de producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando tipo de producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== ESTADÍSTICAS Y REPORTES ====================

// Dashboard de estadísticas generales
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Total de usuarios por rol
    const usersStats = await pool.query(`
      SELECT r.name as role, COUNT(u.id) as count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id AND u.is_active = true
      GROUP BY r.name
    `);

    // Total de pedidos por estado
    const ordersStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    // Total de tipos de productos
    const productTypesCount = await pool.query(`
      SELECT COUNT(*) as count FROM product_types
    `);

    // Pedidos del último mes
    const recentOrders = await pool.query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Usuarios registrados en el último mes
    const recentUsers = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    res.json({
      users: usersStats.rows,
      orders: ordersStats.rows,
      product_types_count: parseInt(productTypesCount.rows[0].count),
      recent_orders: parseInt(recentOrders.rows[0].count),
      recent_users: parseInt(recentUsers.rows[0].count)
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Auditoría de cambios en tipos de productos
router.get('/audit/product-types', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        u.full_name as changed_by_name,
        u.email as changed_by_email
      FROM product_type_audit a
      LEFT JOIN users u ON a.changed_by = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo auditoría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== GESTIÓN DE ROLES ====================

// Obtener todos los roles
router.get('/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
