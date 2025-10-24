const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Error de validación de base de datos
  if (err.code === '23505') { // unique_violation
    return res.status(400).json({ 
      error: 'El recurso ya existe' 
    });
  }

  // Error de foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ 
      error: 'Operación no permitida' 
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Token inválido' 
    });
  }

  // Error de OpenAI
  if (err.message.includes('OpenAI') || err.message.includes('API key')) {
    return res.status(500).json({ 
      error: 'Error en el servicio de IA. Verifica tu API key.' 
    });
  }

  // Error por defecto
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;