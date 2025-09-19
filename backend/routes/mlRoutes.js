const express = require('express');
const router = express.Router();

// Default route for ML services
router.get('/', (req, res) => {
    res.json({ message: 'ML Services API' });
});

module.exports = router;