const express = require('express');
const router = express.Router();

// Default route for user management
router.get('/', (req, res) => {
    res.json({ message: 'User API endpoint' });
});

module.exports = router;