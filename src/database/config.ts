import { Pool, PoolConfig } from 'pg';

// Configuración de la conexión a PostgreSQL
const poolConfig: PoolConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'manufactura_db',
  user: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  max: 20, // Número máximo de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar un cliente inactivo
  connectionTimeoutMillis: 2000, // Tiempo de espera para establecer conexión
};

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

// Función para cerrar el pool (útil al cerrar la aplicación)
export async function closePool(): Promise<void> {
  await pool.end();
}
