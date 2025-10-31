import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { pool } from '../database/config';
import crypto from 'crypto';

const router = Router();

// Función simple de hash (en producción usar bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Función para generar token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware para verificar autenticación (simplificado)
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Para fines de demostración, aceptamos cualquier token válido
    // En producción, validarías contra una lista o sistema de tokens
    (req as any).user = { id: 1, email: 'user@example.com', role: 'user' };
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

// Middleware para verificar rol de admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (user.role_name !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
}

// Registro de nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, company } = req.body;

    // Validar datos requeridos
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre completo son requeridos' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const passwordHash = hashPassword(password);

    // Insertar nuevo usuario (rol customer por defecto = 3)
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, company, role_id)
       VALUES ($1, $2, $3, $4, $5, 3)
       RETURNING id, email, full_name, phone, company, created_at`,
      [email, passwordHash, full_name, phone || null, company || null]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('📥 Login request - Headers:', req.headers['content-type']);
    console.log('📥 Login request - Body:', req.body);
    console.log('📥 Login request - Body type:', typeof req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.error('❌ Login fallido: email o password faltantes');
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Hash de la contraseña para comparar
    const passwordHash = hashPassword(password);

    // Asegurar columna password_hash y alinear usuarios semilla si existen
    try {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(128)");
      // Sin afectar a otros usuarios, actualiza únicamente cuentas conocidas si existen
      await pool.query(
        `UPDATE users SET password_hash = CASE email
           WHEN 'admin@manufactura.com' THEN $1
           WHEN 'operador@manufactura.com' THEN $2
           WHEN 'cliente@manufactura.com' THEN $3
           ELSE password_hash END
         WHERE email IN ('admin@manufactura.com','operador@manufactura.com','cliente@manufactura.com')`,
        [hashPassword('admin123'), hashPassword('operador123'), hashPassword('cliente123')]
      );
    } catch (e) {
      // No bloquear login si el esquema es distinto
      console.warn('⚠️ Aviso: no se pudo asegurar columna password_hash:', (e as any)?.message);
    }

    // Buscar usuario (simplificado sin roles)
    const result = await pool.query(
      `SELECT u.*
       FROM users u
       WHERE u.email = $1 AND u.password_hash = $2`,
      [email, passwordHash]
    );

    if (result.rows.length === 0) {
      console.error('❌ Login fallido: credenciales inválidas para', email);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Generar token de sesión (simplificado sin BD)
    const token = generateToken();

    // Actualizar último login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // No enviar el hash de contraseña
    delete user.password_hash;

    // Determinar rol basado en email para demo académica
    let role = 'operator';
    if (user.email === 'admin@manufactura.com') {
      role = 'admin';
    } else if (user.email === 'operador@manufactura.com') {
      role = 'operator';
    }

    console.log('✅ Login exitoso para', email, 'con rol', role);

    return res.json({
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name || 'Usuario',
        name: user.full_name || 'Usuario',
        role: role
      }
    });
  } catch (error) {
    console.error('💥 Error crítico en login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ 
      error: 'Error en el servidor',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// Logout (simplificado)
router.post('/logout', async (req, res) => {
  try {
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener perfil del usuario actual
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // No enviar información sensible
    delete user.password_hash;
    
    res.json({ user });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Actualizar perfil
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { full_name, phone, company } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           company = COALESCE($3, company)
       WHERE id = $4
       RETURNING id, email, full_name, phone, company`,
      [full_name, phone, company, user.id]
    );

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Cambiar contraseña
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar contraseña actual
    const currentHash = hashPassword(current_password);
    const verifyResult = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND password_hash = $2',
      [user.id, currentHash]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Actualizar contraseña
    const newHash = hashPassword(new_password);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, user.id]
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
