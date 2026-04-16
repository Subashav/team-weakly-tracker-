import pg from 'pg';
const { Pool } = pg;

/**
 * DATABASE PROFILING
 * We use the 'pg' library with hardened SSL settings to bypass self-signed certificate errors.
 */
const rawConnectionString = process.env.POSTGRES_URL || '';
// Clean the connection string of any existing sslmode to avoid conflicts with our config object
const connectionString = rawConnectionString.split('?')[0];

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Initialize Tasks Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        roll_no TEXT,
        task_description TEXT,
        skill_applied TEXT,
        project_name TEXT,
        progress TEXT,
        proof TEXT,
        week_date TEXT,
        is_hidden INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize Members Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Postgres (pg) tables verified/created successfully.');
  } catch (error) {
    console.error('Database Initialization Error:', error);
  } finally {
    client.release();
  }
}

export default pool;
