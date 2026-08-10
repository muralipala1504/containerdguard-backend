const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');

let db = null;

function getDB() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database error:', err.message);
      } else {
        console.log('Connected to SQLite database');
        // Initialize schema
        db.serialize(() => {
          db.run(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              name TEXT NOT NULL,
              verified BOOLEAN DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
        });
      }
    });
  }
  return db;
}

function saveDB() {
  // sqlite3 auto-saves
}

function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDB, saveDB, closeDB };
