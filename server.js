const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración CORS para producción
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-app-en-vercel.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const aiRoutes = require('./routes/ai');
const categoryRoutes = require('./routes/categories'); // ← NUEVA

// Importar middleware de errores
const errorHandler = require('./middleware/errorHandler'); // ← NUEVA

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/categories', categoryRoutes); // ← NUEVA

// Ruta de prueba principal
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '🚀 Servidor de Finanzas IA funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta para verificar conexión a BD
app.get('/api/db-check', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      database: '✅ Conectado a PostgreSQL',
      current_time: result.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({ error: '❌ Error conectando a la base de datos' });
  }
});

// Ruta de documentación básica
app.get('/api', (req, res) => {
  res.json({
    name: 'Finanzas IA API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      transactions: {
        create: 'POST /api/transactions',
        list: 'GET /api/transactions',
        summary: 'GET /api/transactions/summary'
      },
      ai: {
        analysis: 'GET /api/ai/analysis',
        prediction: 'GET /api/ai/prediction',
        tips: 'GET /api/ai/tips'
      },
      categories: 'GET /api/categories'
    }
  });
});

// Middleware de errores (debe ir al final)
app.use(errorHandler);

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`🔐 Autenticación: http://localhost:${PORT}/api/auth`);
  console.log(`💳 Transacciones: http://localhost:${PORT}/api/transactions`);
  console.log(`🤖 IA: http://localhost:${PORT}/api/ai`);
  console.log(`📊 Categorías: http://localhost:${PORT}/api/categories`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api`);
});