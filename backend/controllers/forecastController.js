const mlService = require('../services/mlService');

exports.getForecast = async (req, res) => {
  try {
    // Example: pass query params from frontend to ML service
    const params = req.query; 
    const forecastData = await mlService.getForecast(params);
    res.json(forecastData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch forecast from ML service' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const userInput = req.body; // expects JSON from frontend
    const recommendations = await mlService.getRecommendations(userInput);
    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendations from ML service' });
  }
};
