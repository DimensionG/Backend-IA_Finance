require('dotenv').config();
const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Probar conexión básica
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('📅 Hora actual en BD:', result.rows[0].current_time);
    
    // Verificar tablas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Tablas en la base de datos:');
    tables.rows.forEach(table => {
      console.log('   -', table.table_name);
    });
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    pool.end();
  }
}

testConnection();