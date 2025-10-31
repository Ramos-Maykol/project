import { pool } from '../server/database/config';
import crypto from 'crypto';

function sha256(s: string) { return crypto.createHash('sha256').update(s).digest('hex'); }

async function run() {
  console.log('Ensuring users.password_hash column exists...');
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(128)");

  // Ensure admin/operator/customer users exist and set SHA-256 passwords
  const seeds = [
    { email: 'admin@manufactura.com', name: 'Administrador Sistema', role: 'admin', pass: 'admin123' },
    { email: 'operador@manufactura.com', name: 'Operador Producción', role: 'operator', pass: 'operador123' },
    { email: 'cliente@manufactura.com', name: 'Cliente Demo', role: 'customer', pass: 'cliente123' },
  ];

  // Ensure roles exist
  await pool.query(`CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
  )`);
  await pool.query(`INSERT INTO roles(name, description) VALUES
    ('admin','Administrador del sistema'),
    ('operator','Operador de producción'),
    ('customer','Cliente')
  ON CONFLICT (name) DO NOTHING`);

  for (const s of seeds) {
    const roleRes = await pool.query('SELECT id FROM roles WHERE name=$1', [s.role]);
    const roleId = roleRes.rows[0]?.id;
    const hash = sha256(s.pass);
    await pool.query(`INSERT INTO users(email, full_name, role_id, password_hash, is_active, email_verified)
      VALUES($1,$2,$3,$4,true,true)
      ON CONFLICT (email) DO UPDATE SET role_id=EXCLUDED.role_id, password_hash=EXCLUDED.password_hash`,
      [s.email, s.name, roleId, hash]
    );
    console.log(`✔ ${s.email} set to ${hash.substring(0,8)}...`);
  }

  const check = await pool.query("SELECT email, substring(password_hash,1,8)||'...' AS hash FROM users WHERE email = ANY($1)", [seeds.map(s=>s.email)]);
  console.table(check.rows);
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
