import pg from 'pg';
const { Pool } = pg;

/**
 * DATABASE PROFILING
 * We use the 'pg' library which is the industry standard for Postgres.
 * It works perfectly with Supabase's connection strings.
 */
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase/Vercel SSL connections
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
