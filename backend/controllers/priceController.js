const dbService = require('../services/dbService');

exports.getPrices = async (req, res) => {
  try {
    const prices = await dbService.getLatestPrices();
    res.json(prices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
};
