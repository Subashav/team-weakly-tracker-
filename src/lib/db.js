import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Vercel environment check: /tmp is the only writable directory in serverless functions
// Local environment check: process.cwd() is standard
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const dbName = 'database.sqlite';
const dbFolder = isVercel ? '/tmp' : process.cwd();
const dbPath = path.resolve(dbFolder, dbName);

// Prevent multiple database connections in development (Singleton pattern)
let db;

function initDb(instance) {
  instance.exec(`
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

  instance.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      role TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

if (process.env.NODE_ENV === 'production') {
  // Always initialize schema in production (Vercel) since /tmp is wiped often
  db = new Database(dbPath);
  initDb(db);
} else {
  if (!global._sqlite_db) {
    global._sqlite_db = new Database(dbPath, { verbose: console.log });
    initDb(global._sqlite_db);
  }
  db = global._sqlite_db;
}

export default db;
