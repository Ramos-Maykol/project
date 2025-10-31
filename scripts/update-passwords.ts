import { pool } from '../server/database/config';
import crypto from 'crypto';

const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex');

async function main() {
  console.log('🔐 Actualizando contraseñas...');
  
  try {
    const adminHash = hashPassword('admin123');
    const operadorHash = hashPassword('operador123');
    
    await pool.query(
      `UPDATE users 
       SET password_hash = CASE email 
         WHEN 'admin@manufactura.com' THEN $1
         WHEN 'operador@manufactura.com' THEN $2
         ELSE password_hash END
       WHERE email IN ('admin@manufactura.com','operador@manufactura.com')`,
      [adminHash, operadorHash]
    );
    
    console.log('✅ Contraseñas actualizadas');
    
    const users = await pool.query('SELECT email, LEFT(password_hash, 8) || \'...\' AS hash_preview FROM users WHERE email IN (\'admin@manufactura.com\',\'operador@manufactura.com\')');
    console.table(users.rows);
    
    await pool.end();
    console.log('🎉 Listo para probar login');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

main();
