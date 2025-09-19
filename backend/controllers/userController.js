const userService = require('../services/userService');

exports.register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await userService.loginUser(req.body);
    res.json({ message: 'Login successful', user }); // user now contains token
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

