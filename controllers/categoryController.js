const pool = require('../config/database');

const getCategories = async (req, res) => {
  try {
    const query = 'SELECT * FROM categories ORDER BY type, name';
    const result = await pool.query(query);
    
    res.json({
      categories: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
};

module.exports = {
  getCategories
};