const mysql = require('mysql2');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;

const getDatabaseConfig = () => {
  if (!databaseUrl) {
    return {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'Salon123',
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'salon_db',
    };
  }

  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
  };
};

const dbConfig = getDatabaseConfig();

const pool = mysql.createPool({
  ...dbConfig,
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
