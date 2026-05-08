const db = require('./config/db');

const mapping = {
  'Haircut': 'Anjali Patil',
  'Hair Styling': 'Sneha Jadhav',
  'Hair Wash & Conditioning': 'Pooja Shinde',
  'Hair Spa': 'Neha Pawar',
  'Hair Coloring': 'Priya Chavan',
  'Keratin / Smoothening / Rebonding': 'Riya More',
  'Facial': 'Kavya Gowda',
  'Cleanup': 'Aishwarya Naik',
  'Bleach': 'Swati Reddy',
  'Detan': 'Nisha Madar',
  'Threading': 'Komal Patil',
  'Face massage': 'Shreya Kori',
  'Waxing ': 'Meena Khot',
  'Body polishing': 'Tanvi Kadam',
  'Body spa': 'Deepika Dhangar',
  'Body massage': 'Bhavna Kamble',
  'Party makeup': 'Radhika Gowda',
  'Engagement makeup': 'Simran Patil',
  'Bridal makeup': 'Pooja Jadhav',
  'HD / Airbrush makeup': 'Kritika Bable'
};

const migrate = async () => {
    try {
        console.log('Adding assigned_staff column...');
        await db.execute("ALTER TABLE services ADD COLUMN assigned_staff VARCHAR(100)").catch(e => {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
            console.log('Column already exists.');
        });
        
        console.log('Updating staff assignments...');
        for (const [name, staff] of Object.entries(mapping)) {
            await db.execute("UPDATE services SET assigned_staff = ? WHERE name = ?", [staff, name]);
        }
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
