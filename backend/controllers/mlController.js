const mlService = require('../services/mlService');

// Controller for /recommend
const getRecommendations = async (req, res) => {
  try {
    const result = await mlService.getRecommendations(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

// Controller for /forecast
const getForecast = async (req, res) => {
  try {
    const result = await mlService.getForecast(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
};

module.exports = { getRecommendations, getForecast };
