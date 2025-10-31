const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'manufactura_db',
  user: 'postgres',
  password: 'postgres123',
});

async function test() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión exitosa:', result.rows[0]);
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
