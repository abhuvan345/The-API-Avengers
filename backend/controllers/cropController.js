const dbService = require('../services/dbService');

exports.getCrops = async (req, res) => {
  try {
    const crops = await dbService.getAllCrops();
    res.json(crops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
};
    