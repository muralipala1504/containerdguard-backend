const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data.db');

let db = null;

function getDB() {
  if (!db) {
    db = new sqlite3(dbPath);
    db.pragma('journal_mode = WAL');
    
    // Initialize schema if needed
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

function saveDB() {
  if (db) {
    db.exec('VACUUM');
  }
}

function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDB, saveDB, closeDB };
