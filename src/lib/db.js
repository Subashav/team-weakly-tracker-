import { sql } from '@vercel/postgres';

/**
 * DATABASE INITIALIZATION
 * This function ensures the required tables exist in the Vercel Postgres instance.
 * Note: Postgres uses slightly different syntax than SQLite (SERIAL vs AUTOINCREMENT).
 */
export async function initDatabase() {
  try {
    // Initialize Tasks Table
    await sql`
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
    `;

    // Initialize Members Table
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Postgres tables verified/created successfully.');
  } catch (error) {
    console.error('Database Initialization Error:', error);
  }
}

export default sql;
