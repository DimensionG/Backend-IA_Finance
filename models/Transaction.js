const pool = require('../config/database');

class Transaction {
  // Crear nueva transacción
  static async create(transactionData) {
    const { user_id, amount, description, category, type, date } = transactionData;
    
    const query = `
      INSERT INTO transactions (user_id, amount, description, category, type, date) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id, 
      amount, 
      description, 
      category, 
      type, 
      date || new Date()
    ]);
    
    return result.rows[0];
  }

  // Obtener transacciones por usuario
  static async findByUserId(userId, filters = {}) {
    let query = `
      SELECT * FROM transactions 
      WHERE user_id = $1
    `;
    let params = [userId];
    let paramCount = 1;

    // Filtros opcionales
    if (filters.type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(filters.type);
    }

    if (filters.category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(filters.category);
    }

    if (filters.startDate && filters.endDate) {
      paramCount++;
      query += ` AND date >= $${paramCount}`;
      params.push(filters.startDate);
      
      paramCount++;
      query += ` AND date <= $${paramCount}`;
      params.push(filters.endDate);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Obtener transacción por ID
  static async findById(id, userId) {
    const query = 'SELECT * FROM transactions WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  // Actualizar transacción
  static async update(id, userId, updateData) {
    const { amount, description, category, type, date } = updateData;
    
    const query = `
      UPDATE transactions 
      SET amount = $1, description = $2, category = $3, type = $4, date = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      amount, description, category, type, date, id, userId
    ]);
    
    return result.rows[0];
  }

  // Eliminar transacción
  static async delete(id, userId) {
    const query = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  // Obtener resumen financiero
  static async getFinancialSummary(userId, startDate, endDate) {
    const query = `
      SELECT 
        type,
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 
        AND date >= $2 
        AND date <= $3
      GROUP BY type, category
      ORDER BY type, total DESC
    `;
    
    const result = await pool.query(query, [userId, startDate, endDate]);
    return result.rows;
  }
}

module.exports = Transaction;