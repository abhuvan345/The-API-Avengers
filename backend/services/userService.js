const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const userService = {
  registerUser: async ({ username, phone, email, password }) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return reject(err);

        const query = `INSERT INTO users (username, phone, email, password) VALUES (?, ?, ?, ?)`;
        db.run(query, [username, phone, email, hash], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, username, phone, email });
        });
      });
    });
  },

  loginUser: async ({ phone, password }) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE phone = ?`;
      db.get(query, [phone], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('User not found'));

        bcrypt.compare(password, row.password, (err, result) => {
          if (err) return reject(err);
          if (!result) return reject(new Error('Incorrect password'));

          // ✅ Generate JWT token
          const token = jwt.sign(
            { id: row.id, username: row.username, phone: row.phone },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );

          // Return user info + token
          resolve({ id: row.id, username: row.username, phone: row.phone, email: row.email, token });
        });
      });
    });
  }
};

module.exports = userService;
