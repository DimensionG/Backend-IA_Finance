const express = require('express');
const {
  getFinancialAnalysis,
  getSpendingPrediction,
  getFinancialTips
} = require('../controllers/aiController');
const auth = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de IA
router.get('/analysis', getFinancialAnalysis);
router.get('/prediction', getSpendingPrediction);
router.get('/tips', getFinancialTips);

module.exports = router;