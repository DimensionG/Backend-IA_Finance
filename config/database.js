const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ //Creacion del pool de conexiones
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect((err, client, release)=> { //Probamos la conexion
    if (err) {
        console.log("Error conectando a la base de datos:", err.stack);
    } else{
        console.log("Conexion Exitosa ");
        release();
    }
});

module.exports = pool; //Exportamos le pool