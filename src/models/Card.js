const { getDatabase } = require('../config/database');

class Card {
  static async create(userId, cardData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const { cardNumber, cardHolderName, expiryDate, cvv, cardType, balance } = cardData;

      db.run(
        `INSERT INTO cards (user_id, card_number, card_holder_name, expiry_date, cvv, card_type, balance)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, cardNumber, cardHolderName, expiryDate, cvv, cardType, balance || 0],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            id: this.lastID,
            userId,
            cardNumber,
            cardHolderName,
            expiryDate,
            cardType,
            balance: balance || 0
          });
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get(
        'SELECT * FROM cards WHERE id = ?',
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

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.all(
        'SELECT * FROM cards WHERE user_id = ?',
        [userId],
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

  static async findByCardNumber(cardNumber) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get(
        'SELECT * FROM cards WHERE card_number = ?',
        [cardNumber],
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

  static async update(id, cardData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const { cardHolderName, expiryDate, isActive } = cardData;

      db.run(
        `UPDATE cards 
         SET card_holder_name = COALESCE(?, card_holder_name),
             expiry_date = COALESCE(?, expiry_date),
             is_active = COALESCE(?, is_active)
         WHERE id = ?`,
        [cardHolderName, expiryDate, isActive, id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ updated: this.changes });
        }
      );
    });
  }

  static async updateBalance(id, newBalance) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run(
        'UPDATE cards SET balance = ? WHERE id = ?',
        [newBalance, id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ updated: this.changes });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run(
        'DELETE FROM cards WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ deleted: this.changes });
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.all(
        'SELECT * FROM cards',
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

module.exports = Card;
