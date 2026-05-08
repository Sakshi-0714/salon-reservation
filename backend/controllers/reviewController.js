const db = require('../config/db');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  const { service_name, rating, comment } = req.body;

  try {
    console.log("req.user is:", req.user);
    console.log("req.body is:", req.body);
    const [users] = await db.execute('SELECT name FROM users WHERE id = ?', [req.user.id || null]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user_name = users[0].name;
    const user_id = req.user.id;

    // Check if duplicate review already exists
    const [existing] = await db.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND service_name = ?',
      [user_id, service_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this service.' });
    }

    const [result] = await db.execute(
      'INSERT INTO reviews (user_id, user_name, service_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [user_id, user_name, service_name, rating, comment]
    );

    res.status(201).json({ id: result.insertId, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT * 
      FROM reviews 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReview,
  getReviews
};
