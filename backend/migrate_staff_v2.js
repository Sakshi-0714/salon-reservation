const db = require('./config/db');

const migrateStaff = async () => {
    try {
        console.log('Creating staff table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS staff (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                assigned_service VARCHAR(100),
                phone VARCHAR(20),
                address TEXT,
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Mapping from user prompt
        const staffData = [
            ['Anjali Patil', 'Haircut', '9876543210', 'Tilakwadi, Belagavi'],
            ['Sneha Jadhav', 'Hair Styling', '9876543211', 'Shahapur, Belagavi'],
            ['Pooja Shinde', 'Hair Wash & Conditioning', '9876543212', 'Raviwar Peth, Belagavi'],
            ['Neha Pawar', 'Hair Spa', '9876543213', 'Angol, Belagavi'],
            ['Priya Chavan', 'Hair Coloring', '9876543214', 'Mahantesh Nagar, Belagavi'],
            ['Riya More', 'Keratin / Smoothening / Rebonding', '9876543215', 'Vadgaon, Belagavi'],
            ['Kavya Gowda', 'Facial', '9876543216', 'RPD Cross, Belagavi'],
            ['Aishwarya Naik', 'Cleanup', '9876543217', 'Camp, Belagavi'],
            ['Swati Reddy', 'Bleach', '9876543218', 'Sadashiv Nagar, Belagavi'],
            ['Nisha Madar', 'Detan', '9876543219', 'Udyambag, Belagavi'],
            ['Komal Patil', 'Threading', '9876543220', 'Hindwadi, Belagavi'],
            ['Shreya Kori', 'Face massage', '9876543221', 'Khasbag, Belagavi'],
            ['Meena Khot', 'Waxing ', '9876543222', 'Hanuman Nagar, Belagavi'],
            ['Tanvi Kadam', 'Body polishing', '9876543223', 'Auto Nagar, Belagavi'],
            ['Deepika Dhangar', 'Body spa', '9876543224', 'Nehru Nagar, Belagavi'],
            ['Bhavna Kamble', 'Body massage', '9876543225', 'Peeranwadi, Belagavi'],
            ['Radhika Gowda', 'Party makeup', '9876543226', 'Khade Bazar, Belagavi'],
            ['Simran Patil', 'Engagement makeup', '9876543227', 'Bhagya Nagar, Belagavi'],
            ['Pooja Jadhav', 'Bridal makeup', '9876543228', 'Subhash Nagar, Belagavi'],
            ['Kritika Bable', 'HD / Airbrush makeup', '9876543229', 'Fort Road, Belagavi']
        ];

        console.log('Inserting staff data...');
        for (const data of staffData) {
            await db.execute(
                'INSERT INTO staff (name, assigned_service, phone, address) VALUES (?, ?, ?, ?)',
                data
            );
        }

        // Also update services table assigned_staff as strings for now (source of truth is staff table)
        console.log('Updating existing services with staff references...');
        for (const data of staffData) {
            await db.execute(
                'UPDATE services SET assigned_staff = ? WHERE name = ?',
                [data[0], data[1]]
            );
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateStaff();
