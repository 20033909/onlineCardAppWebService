const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, email, password) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const hashedPassword = bcrypt.hashSync(password, 10);

      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id: this.lastID, username, email });
        }
      );
    });
  }

  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.all(
        'SELECT id, username, email, created_at FROM users',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
  }
}

module.exports = User;
