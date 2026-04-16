import Database from 'better-sqlite3';
import path from 'path';

// Determine database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

const db = new Database(dbPath, { verbose: console.log });

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_no TEXT,
    task_description TEXT,
    skill_applied TEXT,
    project_name TEXT,
    progress TEXT,
    proof TEXT,
    week_date TEXT,
    is_hidden INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
