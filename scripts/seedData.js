require('dotenv').config();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    console.log('🌱 Insertando datos de prueba...');

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      ['demo@finanzas.com', hashedPassword, 'Usuario Demo']
    );
    
    const userId = userResult.rows[0].id;
    console.log('✅ Usuario demo creado');

    // Insertar transacciones de prueba
    const transactions = [
      { amount: 2500, description: 'Salario mensual', category: 'Salario', type: 'income', date: '2024-01-15' },
      { amount: 800, description: 'Trabajo freelance', category: 'Freelance', type: 'income', date: '2024-01-10' },
      { amount: 350, description: 'Supermercado', category: 'Alimentación', type: 'expense', date: '2024-01-14' },
      { amount: 150, description: 'Gasolina', category: 'Transporte', type: 'expense', date: '2024-01-13' },
      { amount: 200, description: 'Cena restaurante', category: 'Alimentación', type: 'expense', date: '2024-01-12' },
      { amount: 80, description: 'Netflix', category: 'Entretenimiento', type: 'expense', date: '2024-01-11' },
      { amount: 300, description: 'Gimnasio', category: 'Salud', type: 'expense', date: '2024-01-10' },
      { amount: 1200, description: 'Renta departamento', category: 'Vivienda', type: 'expense', date: '2024-01-05' }
    ];

    for (const transaction of transactions) {
      await pool.query(
        'INSERT INTO transactions (user_id, amount, description, category, type, date) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, transaction.amount, transaction.description, transaction.category, transaction.type, transaction.date]
      );
    }

    console.log('✅ Transacciones de prueba creadas');
    console.log('📧 Email: demo@finanzas.com');
    console.log('🔑 Password: password123');
    console.log('🎯 Usa estas credenciales para probar el sistema');

  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
  } finally {
    pool.end();
  }
}

// Ejecutar solo si es el archivo principal
if (require.main === module) {
  seedData();
}

module.exports = seedData;