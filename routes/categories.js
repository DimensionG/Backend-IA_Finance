const express = require('express');
const { getCategories } = require('../controllers/categoryController');
const auth = require('../middleware/auth');

const router = express.Router();

// Las categorías son públicas (no requieren auth)
router.get('/', getCategories);

module.exports = router;