const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'containerguard.db');
let db = null;
let SQL = null;

async function initDB() {
  try {
    SQL = await initSqlJs();
    
    // Load existing database or create new
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('✅ SQLite database loaded');
    } else {
      db = new SQL.Database();
      console.log('✅ SQLite database created');
    }

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        verified INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Users table ready');
    saveDB();
    return db;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
}

function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function closeDB() {
  saveDB();
  if (db) db.close();
}

module.exports = { initDB, getDB, saveDB, closeDB };
