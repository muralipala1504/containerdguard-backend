const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

let db = null

const dbPath = path.join(__dirname, 'containerguard.db')

// Initialize database
async function initDB() {
  const SQL = await initSqlJs()
  
  // Load existing database or create new
  let filebuffer = null
  if (fs.existsSync(dbPath)) {
    filebuffer = fs.readFileSync(dbPath)
  }
  
  db = new SQL.Database(filebuffer)
  
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      stripe_customer_id TEXT UNIQUE NOT NULL,
      stripe_subscription_id TEXT UNIQUE,
      plan_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      trial_ends_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id INTEGER NOT NULL,
      stripe_payment_id TEXT UNIQUE,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    )
  `)

  saveDB()
  console.log('✅ Database initialized')
}

function saveDB() {
  if (db) {
    const data = db.export()
    fs.writeFileSync(dbPath, Buffer.from(data))
  }
}

module.exports = { db: () => db, initDB, saveDB }
