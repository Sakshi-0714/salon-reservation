const db = require('./config/db');

const seedDB = async () => {
  try {
    // 1. Drop constraints if needed (simplest way is to just drop and recreate tables)
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    await db.execute('DROP TABLE IF EXISTS appointments');
    await db.execute('DROP TABLE IF EXISTS services');
    await db.execute('DROP TABLE IF EXISTS users');

    // 2. Recreate users
    await db.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Recreate services (with category)
    await db.execute(`
      CREATE TABLE services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        lat DECIMAL(10, 8),   
        lng DECIMAL(11, 8),   
        address VARCHAR(255)
      )
    `);

    // 4. Recreate appointments
    await db.execute(`
      CREATE TABLE appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        service_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        paid_advance BOOLEAN DEFAULT FALSE,
        selected_options TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `);
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');

    // 5. Insert Services data
    const insertSQL = `
      INSERT INTO services (category, name, description, price, image_url, lat, lng, address) VALUES
      ('Hair Services', 'Haircut', 'Trim: ₹250, Straight Cut (One Length): ₹350, U-Cut: ₹500, V-Cut: ₹600, Layer Cut: ₹500, Long Layers: ₹600, Step Cut: ₹600, Feather Cut: ₹600, Butterfly Cut: ₹500, Face-Framing Layers: ₹600, Boy Cut: ₹300, Classic Bob: ₹520, Lob (Long Bob): ₹500, Pixie Cut: ₹450, Wolf Cut: ₹650', 0.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY'),
      ('Hair Services', 'Styling', 'Blow Dry: ₹400, Curls: ₹800, Straightening: ₹1200', 0.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY'),
      ('Hair Services', 'Hair Wash & Conditioning', 'Hair Wash: ₹150, Conditioning: ₹250', 0.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY'),
      ('Hair Services', 'Hair Spa', 'Basic Hair Spa: ₹900, Premium Hair Spa: ₹1500', 0.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY'),
      ('Hair Services', 'Hair Coloring', 'Global Color: ₹1500, Highlights: ₹900, Balayage: ₹3500', 0.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY'),
      ('Hair Services', 'Keratin', 'Keratin Treatment: ₹3500', 3500.00, NULL, 40.7128, -74.0060, '123 Wellness Ave, NY'),

      ('Skin / Face Services', 'Facial', 'Fruit Facial: ₹700, Gold Facial: ₹800, Diamond Facial: ₹900, Anti-aging Facial: ₹1000', 0.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY'),
      ('Skin / Face Services', 'Cleanup', 'Cleanup: ₹600', 600.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY'),
      ('Skin / Face Services', 'Bleach', 'Face Bleach: ₹400, Full Body Bleach: ₹900', 0.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY'),
      ('Skin / Face Services', 'Detan', 'Face Detan: ₹500, Full Body Detan: ₹1300', 0.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY'),
      ('Skin / Face Services', 'Threading', 'Eyebrows: ₹40, Upper Lips: ₹30, Forehead: ₹30', 0.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY'),
      ('Skin / Face Services', 'Face Massage', 'Face Massage: ₹400', 400.00, NULL, 40.7589, -73.9851, '456 Calm Street, NY'),

      ('Body Services', 'Waxing', 'Honey Wax Full Body: ₹1500, Honey Wax Arms: ₹250, Honey Wax Legs: ₹350, Honey Wax Underarms: ₹80, Rica Wax Full Body: ₹2500', 0.00, NULL, 40.7306, -73.9352, '123 Wellness Ave, NY'),
      ('Body Services', 'Body Polishing', 'Body Polishing: ₹2500', 2500.00, NULL, 40.7306, -73.9352, '123 Wellness Ave, NY'),
      ('Body Services', 'Body Spa', 'Body Spa: ₹2500', 2500.00, NULL, 40.7306, -73.9352, '123 Wellness Ave, NY'),
      ('Body Services', 'Body Massage', 'Basic Massage: ₹1200, Aromatherapy / Swedish: ₹2000', 0.00, NULL, 40.7306, -73.9352, '123 Wellness Ave, NY'),

      ('Makeup Services', 'Party Makeup', 'Party Makeup: ₹3000', 3000.00, NULL, 40.7549, -73.9840, '456 Calm Street, NY'),
      ('Makeup Services', 'Engagement Makeup', 'Engagement Makeup: ₹6000', 6000.00, NULL, 40.7549, -73.9840, '456 Calm Street, NY'),
      ('Makeup Services', 'Bridal Makeup', 'Bridal Makeup: ₹12000', 12000.00, NULL, 40.7549, -73.9840, '456 Calm Street, NY'),
      ('Makeup Services', 'Airbrush Makeup', 'Airbrush Makeup: ₹15000', 15000.00, NULL, 40.7549, -73.9840, '456 Calm Street, NY')
    `;

    await db.execute(insertSQL);
    console.log('Database reconstructed and seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in seeding process:', error);
    process.exit(1);
  }
};

seedDB();
