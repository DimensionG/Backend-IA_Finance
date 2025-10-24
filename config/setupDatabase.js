const pool = require('./database');

const setupDatabase = async () => {
  try {
    // Tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de transacciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(500) NOT NULL,
        category VARCHAR(100) NOT NULL,
        type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de categorías predefinidas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
        color VARCHAR(7) NOT NULL
      );
    `);

    // Insertar categorías predefinidas
    await pool.query(`
      INSERT INTO categories (name, type, color) VALUES
      ('Salario', 'income', '#10B981'),
      ('Freelance', 'income', '#059669'),
      ('Inversiones', 'income', '#047857'),
      ('Alimentación', 'expense', '#EF4444'),
      ('Transporte', 'expense', '#F59E0B'),
      ('Entretenimiento', 'expense', '#8B5CF6'),
      ('Salud', 'expense', '#EC4899'),
      ('Educación', 'expense', '#06B6D4'),
      ('Vivienda', 'expense', '#F97316')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Base de datos configurada correctamente');
  } catch (error) {
    console.error('Error configurando la base de datos:', error);
  }
};

// Ejecutar solo si es el archivo principal
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;