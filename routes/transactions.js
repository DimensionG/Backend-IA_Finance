const express = require('express');
const {
  createTransaction,
  getUserTransactions,
  getFinancialSummary,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de transacciones
router.post('/', createTransaction);
router.get('/', getUserTransactions);
router.get('/summary', getFinancialSummary);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;