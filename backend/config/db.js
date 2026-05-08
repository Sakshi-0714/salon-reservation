const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Salon123',
  database: process.env.DB_NAME || 'salon_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  dateStrings: true,
  timezone: 'Z',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

const promisePool = pool.promise();

promisePool.getConnection()
  .then(conn => {
    console.log('Connected to MySQL Database');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err);
  });

module.exports = promisePool;
