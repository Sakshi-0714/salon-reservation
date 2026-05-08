const db = require('./config/db');

async function alterAppointments() {
  try {
    console.log('Altering appointments table...');
    
    // Check if columns exist first or just alter with IF NOT EXISTS logic
    // MySQL 8+ supports IF NOT EXISTS for ADD COLUMN but since we don't know the version, we can try to catch the error
    
    const queries = [
      "ALTER TABLE appointments ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending';",
      "ALTER TABLE appointments ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL;",
      "ALTER TABLE appointments ADD COLUMN razorpay_order_id VARCHAR(255) DEFAULT NULL;",
      "ALTER TABLE appointments ADD COLUMN razorpay_payment_id VARCHAR(255) DEFAULT NULL;"
    ];

    for (const query of queries) {
      try {
        await db.execute(query);
        console.log(`Successfully executed: ${query}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping: ${query}`);
        } else {
          console.error(`Error executing ${query}:`, err.message);
        }
      }
    }
    console.log('Database alteration completed.');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

alterAppointments();
