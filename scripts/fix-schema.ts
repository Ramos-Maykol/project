import { pool } from '../server/database/config';

async function fixSchema() {
  console.log('🔧 Arreglando esquema de base de datos...');
  
  try {
    // Asegurar que existan las columnas necesarias
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(200) DEFAULT 'Usuario',
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(128),
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
    `);
    
    console.log('✅ Columnas verificadas/creadas');
    
    // Actualizar usuarios demo si no existen
    const { rows } = await pool.query('SELECT email FROM users WHERE email IN ($1,$2,$3)', 
      ['admin@manufactura.com', 'operador@manufactura.com', 'cliente@manufactura.com']);
    
    if (rows.length === 0) {
      console.log('👤 Creando usuarios demo...');
      await pool.query(`
        INSERT INTO users (email, full_name, password_hash, email_verified) VALUES
        ('admin@manufactura.com', 'Administrador', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', true),
        ('operador@manufactura.com', 'Operador', '1725165c9a0b3698a3d01016e0d8205155820b8d7f21835ca64c0f81c728d880', true),
        ('cliente@manufactura.com', 'Cliente', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', true)
      `);
      console.log('✅ Usuarios demo creados');
    } else {
      console.log(`ℹ️ Ya existen ${rows.length} usuarios demo`);
    }
    
    const users = await pool.query('SELECT email, full_name, email_verified FROM users');
    console.table(users.rows);
    
    await pool.end();
    console.log('🎉 Esquema arreglado exitosamente');
    
  } catch (error) {
    console.error('❌ Error arreglando esquema:', error);
    await pool.end();
    process.exit(1);
  }
}

fixSchema();
