const db = require('./config/db');

async function migrateReviews() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        service_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await db.execute(createTableQuery);
    console.log("Reviews table created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating reviews table:", error);
    process.exit(1);
  }
}

migrateReviews();
