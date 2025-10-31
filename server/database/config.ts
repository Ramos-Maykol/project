import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión a PostgreSQL
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || process.env.VITE_DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.VITE_DB_PORT || '5432'),
  database: process.env.DB_NAME || process.env.VITE_DB_NAME || 'manufactura_db',
  user: process.env.DB_USER || process.env.VITE_DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.VITE_DB_PASSWORD || '1317',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

console.log('🔍 Configuración de DB:', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  password: poolConfig.password ? '***' + String(poolConfig.password).slice(-3) : 'EMPTY'
});

// Crear pool de conexiones
export const pool = new Pool(poolConfig);

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL', err);
});

// Función para verificar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a PostgreSQL exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
    return false;
  }
}

// Función para cerrar el pool
export async function closePool(): Promise<void> {
  await pool.end();
}
