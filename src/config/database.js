const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../cardapp.db');
let db;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        throw err;
      }
      console.log('Connected to the SQLite database.');
    });
  }
  return db;
}

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Create cards table
      db.run(`
        CREATE TABLE IF NOT EXISTS cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          card_number TEXT UNIQUE NOT NULL,
          card_holder_name TEXT NOT NULL,
          expiry_date TEXT NOT NULL,
          cvv TEXT NOT NULL,
          card_type TEXT NOT NULL,
          balance REAL DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        console.log('Database tables initialized successfully.');
        resolve();
      });
    });
  });
}

module.exports = {
  getDatabase,
  initializeDatabase
};
