const express = require('express');
const router = express.Router();

// Default route for forecasts
router.get('/', (req, res) => {
    res.json({ message: 'Forecast API endpoint' });
});

module.exports = router;