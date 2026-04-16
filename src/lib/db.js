import Database from 'better-sqlite3';
import path from 'path';

// Determine database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

// Prevent multiple database connections in development (Singleton pattern)
let db;

if (process.env.NODE_ENV === 'production') {
  db = new Database(dbPath);
} else {
  if (!global._sqlite_db) {
    global._sqlite_db = new Database(dbPath, { verbose: console.log });
    
    // Initialize database schema
    global._sqlite_db.exec(`
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

    global._sqlite_db.exec(`
      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        role TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  db = global._sqlite_db;
}

export default db;
