const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const schemaPath = path.join(__dirname, '..', 'database.sql');

const splitSqlStatements = (sql) => sql
  .split(';')
  .map(statement => statement.trim())
  .filter(Boolean);

const runStatements = async (statements, predicate) => {
  for (const statement of statements) {
    if (predicate(statement)) {
      await db.execute(statement);
    }
  }
};

const columnExists = async (tableName, columnName) => {
  const [rows] = await db.execute(
    `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );

  return Number(rows[0]?.count || 0) > 0;
};

const indexExists = async (tableName, indexName) => {
  const [rows] = await db.execute(
    `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
    `,
    [tableName, indexName]
  );

  return Number(rows[0]?.count || 0) > 0;
};

const addColumnIfMissing = async (tableName, columnName, definition) => {
  if (await columnExists(tableName, columnName)) return;

  await db.execute(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  console.log(`Added missing ${tableName}.${columnName} column`);
};

const ensureBillSchema = async () => {
  await addColumnIfMissing('bills', 'customer_name', 'customer_name VARCHAR(100) NULL AFTER bill_number');
  await addColumnIfMissing('bills', 'customer_phone', 'customer_phone VARCHAR(20) NULL AFTER customer_name');
  await addColumnIfMissing('bills', 'customer_email', 'customer_email VARCHAR(100) NULL AFTER customer_phone');
  await addColumnIfMissing('bills', 'services', 'services JSON NULL AFTER customer_email');
  await addColumnIfMissing('bills', 'razorpay_order_id', 'razorpay_order_id VARCHAR(255) NULL AFTER payment_status');
  await addColumnIfMissing('bills', 'razorpay_payment_id', 'razorpay_payment_id VARCHAR(255) NULL AFTER razorpay_order_id');
  await addColumnIfMissing(
    'bills',
    'sms_status',
    "sms_status ENUM('pending', 'sent', 'failed', 'skipped') DEFAULT 'pending' AFTER razorpay_payment_id"
  );
  await addColumnIfMissing('bills', 'sms_error', 'sms_error TEXT NULL AFTER sms_status');
  await addColumnIfMissing('bills', 'sms_sent_at', 'sms_sent_at TIMESTAMP NULL AFTER sms_error');
  await addColumnIfMissing(
    'bills',
    'updated_at',
    'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at'
  );

  if (!(await indexExists('bills', 'uniq_bills_appointment_id'))) {
    await db.execute('ALTER TABLE bills ADD UNIQUE KEY uniq_bills_appointment_id (appointment_id)');
    console.log('Added unique bill index for appointment_id');
  }
};

const ensureDatabase = async () => {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const statements = splitSqlStatements(schemaSql);

  await runStatements(statements, statement => statement.includes('CREATE TABLE IF NOT EXISTS'));
  await ensureBillSchema();

  const [serviceCountRows] = await db.execute('SELECT COUNT(*) AS count FROM services');
  const serviceCount = Number(serviceCountRows[0]?.count || 0);

  if (serviceCount === 0) {
    await runStatements(
      statements,
      statement => statement.includes('INSERT IGNORE INTO services') || statement.includes('INSERT IGNORE INTO staff')
    );
    console.log('Database schema created and initial salon data seeded');
    return;
  }

  console.log('Database schema verified');
};

module.exports = { ensureDatabase };
