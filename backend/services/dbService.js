const db = require('../config/db');

const dbService = {
  // Fetch all crops
  getAllCrops: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM crops', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Fetch latest prices for all crops
  getLatestPrices: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.id, c.name, c.icon, p.price, p.date
        FROM crops c
        LEFT JOIN prices p ON c.id = p.crop_id
        WHERE p.date = (SELECT MAX(date) FROM prices WHERE crop_id = c.id)
      `;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = dbService;
