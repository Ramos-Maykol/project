import { pool } from '../server/database/config';
import crypto from 'crypto';

function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

async function main() {
  const users = [
    { email: 'admin@manufactura.com', password: 'admin123' },
    { email: 'operador@manufactura.com', password: 'operador123' },
    { email: 'cliente@manufactura.com', password: 'cliente123' },
  ];

  for (const u of users) {
    const hash = sha256(u.password);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, u.email]);
    console.log(`✔ Updated ${u.email} -> ${hash.substring(0,8)}...`);
  }

  const res = await pool.query("SELECT email, substring(password_hash,1,8)||'...' AS hash_prefix FROM users WHERE email = ANY($1)", [users.map(u=>u.email)]);
  console.table(res.rows);
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
