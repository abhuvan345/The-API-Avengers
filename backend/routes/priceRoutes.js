const express = require('express');
const router = express.Router();

// Default route for prices
router.get('/', (req, res) => {
    res.json({ message: 'Price API endpoint' });
});

module.exports = router;