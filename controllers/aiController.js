const AIService = require('../services/aiService');
const Transaction = require('../models/Transaction');

// Análisis financiero con IA
const getFinancialAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener transacciones del usuario
    const transactions = await Transaction.findByUserId(userId);
    
    // Obtener resumen financiero con manejo de errores
    let financialSummary;
    try {
      financialSummary = await Transaction.getFinancialSummary(
        userId,
        new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
    } catch (error) {
      console.error('Error obteniendo resumen financiero:', error);
      financialSummary = { totals: { income: 0, expenses: 0, balance: 0 } };
    }

    if (transactions.length === 0) {
      return res.status(400).json({
        error: 'Necesitas tener transacciones para generar un análisis'
      });
    }

    // Generar análisis con IA
    const analysis = await AIService.analyzeSpending(transactions, financialSummary);

    res.json({
      analysis,
      summary: financialSummary.totals || { income: 0, expenses: 0, balance: 0 },
      transactionsAnalyzed: transactions.length
    });
  } catch (error) {
    console.error('Error en análisis financiero:', error);
    res.status(500).json({ 
      error: error.message || 'Error generando análisis financiero' 
    });
  }
};

// Predicción de gastos futuros
const getSpendingPrediction = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener transacciones históricas
    const transactions = await Transaction.findByUserId(userId);

    if (transactions.length < 3) {
      return res.status(400).json({
        error: 'Necesitas al menos 3 transacciones históricas para generar una predicción'
      });
    }

    // Generar predicción con IA
    const prediction = await AIService.predictFutureSpending(transactions);

    res.json({
      prediction,
      historicalDataPoints: transactions.length
    });
  } catch (error) {
    console.error('Error en predicción:', error);
    res.status(500).json({ 
      error: error.message || 'Error generando predicción' 
    });
  }
};

// Consejos financieros personalizados - ACTUALIZADO PARA GROQ
const getFinancialTips = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findByUserId(userId);
    
    let financialSummary;
    try {
      financialSummary = await Transaction.getFinancialSummary(
        userId,
        new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
    } catch (error) {
      financialSummary = { totals: { income: 0, expenses: 0, balance: 0 } };
    }

    const totals = financialSummary.totals || { income: 0, expenses: 0, balance: 0 };

    // Usar el nuevo servicio de Groq
    const tips = await AIService.getFinancialTips(totals);

    res.json({
      tips,
      basedOn: {
        balance: totals.balance,
        income: totals.income,
        expenses: totals.expenses
      }
    });
  } catch (error) {
    console.error('Error generando consejos:', error);
    res.status(500).json({ error: 'Error generando consejos financieros' });
  }
};

module.exports = {
  getFinancialAnalysis,
  getSpendingPrediction,
  getFinancialTips
};