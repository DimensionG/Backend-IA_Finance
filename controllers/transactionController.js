const Transaction = require('../models/Transaction');

// Crear nueva transacción
const createTransaction = async (req, res) => {
  try {
    const { amount, description, category, type, date } = req.body;
    const user_id = req.user.id;

    // Validaciones
    if (!amount || !description || !category || !type) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Tipo debe ser income o expense' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    const transaction = await Transaction.create({
      user_id,
      amount,
      description,
      category,
      type,
      date
    });

    res.status(201).json({
      message: 'Transacción creada exitosamente',
      transaction
    });
  } catch (error) {
    console.error('Error creando transacción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener transacciones del usuario
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, category, startDate, endDate } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const transactions = await Transaction.findByUserId(userId, filters);

    res.json({
      transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener resumen financiero
const getFinancialSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Fechas por defecto (últimos 30 días)
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const summary = await Transaction.getFinancialSummary(
      userId, 
      startDate || defaultStartDate.toISOString().split('T')[0],
      endDate || new Date().toISOString().split('T')[0]
    );

    // Calcular totales
    let totalIncome = 0;
    let totalExpenses = 0;

    summary.forEach(item => {
      if (item.type === 'income') {
        totalIncome += parseFloat(item.total);
      } else {
        totalExpenses += parseFloat(item.total);
      }
    });

    const balance = totalIncome - totalExpenses;

    res.json({
      summary,
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        balance: balance
      }
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar transacción
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const transaction = await Transaction.findById(id, userId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const updatedTransaction = await Transaction.update(id, userId, updateData);

    res.json({
      message: 'Transacción actualizada exitosamente',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Error actualizando transacción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar transacción
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findById(id, userId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    await Transaction.delete(id, userId);

    res.json({
      message: 'Transacción eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando transacción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getFinancialSummary,
  updateTransaction,
  deleteTransaction
};