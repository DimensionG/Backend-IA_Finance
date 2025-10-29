const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración CORS MEJORADA
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://frontendiafinanc.vercel.app',
      /\.vercel\.app$/,
      /\.onrender\.com$/
    ];
    
    if (allowedOrigins.some(pattern => {
      if (pattern instanceof RegExp) return pattern.test(origin);
      return pattern === origin;
    })) {
      return callback(null, true);
    } else {
      console.log('Bloqueado por CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares - APPLICAR CORS PRIMERO
app.use(cors(corsOptions));
app.use(express.json());

// Importar rutas
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const aiRoutes = require('./routes/ai');
const categoryRoutes = require('./routes/categories');

// Usar rutas CON /api
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/categories', categoryRoutes);

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

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    availableRoutes: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login', 
      '/api/transactions',
      '/api/ai/analysis'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
});