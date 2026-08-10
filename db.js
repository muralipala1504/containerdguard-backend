const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'users.json');

function ensureDbFile() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
  }
}

function getDB() {
  ensureDbFile();
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  return {
    run: (sql, params) => {
      if (sql.includes('INSERT INTO users')) {
        const user = { id: Date.now(), ...params };
        data.push(user);
        saveDB(data);
      }
    },
    prepare: (sql) => ({
      bind: (params) => {
        if (sql.includes('SELECT')) {
          return {
            step: () => data.some(u => u.email === params[0]),
            getAsObject: () => data.find(u => u.email === params[0]),
            free: () => {}
          };
        }
      }
    })
  };
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data || JSON.parse(fs.readFileSync(dbPath)), null, 2));
}

module.exports = { getDB, saveDB };
