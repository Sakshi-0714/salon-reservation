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

const ensureDatabase = async () => {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const statements = splitSqlStatements(schemaSql);

  await runStatements(statements, statement => statement.includes('CREATE TABLE IF NOT EXISTS'));

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
