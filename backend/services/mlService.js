const axios = require('axios');

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Axios instance with timeout
const axiosInstance = axios.create({
  baseURL: ML_BASE_URL,
  timeout: 5000,
});

const mlService = {
  // Call /forecast endpoint (POST)
  getRecommendations: async (userInput) => {
    try {
      const response = await axios.post(`${ML_BASE_URL}/forecast`, userInput);
      return response.data;
    } catch (err) {
      console.error('❌ Error calling ML /forecast:', err.response?.data || err.message);
      throw err;
    }
  },

  // Call /forecast endpoint (GET with query params)
  getForecast: async (params) => {
    try {
      const response = await axiosInstance.get('/forecast', { params });
      return response.data;
    } catch (err) {
      console.error('❌ Error calling ML /forecast:', err.response?.data || err.message);
      throw err;
    }
  },
};

module.exports = mlService;
