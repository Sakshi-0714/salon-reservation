const db = require('../config/db');

const getServices = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createService = async (req, res) => {
  const { name, description, price, image_url, lat, lng, address } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO services (name, description, price, image_url, lat, lng, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, image_url, lat, lng, address]
    );
    res.status(201).json({ id: result.insertId, name, description, price });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getServices,
  createService,
};
