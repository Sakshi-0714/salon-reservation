const db = require('./backend/config/db');

const syncStaffServices = async () => {
    try {
        const mapping = {
            'Hair Styling': 'Styling',
            'Keratin / Smoothening / Rebonding': 'Keratin',
            'Face massage': 'Face Massage',
            'Body polishing': 'Body Polishing',
            'Body spa': 'Body Spa',
            'Body massage': 'Body Massage',
            'Party makeup': 'Party Makeup',
            'Engagement makeup': 'Engagement Makeup',
            'Bridal makeup': 'Bridal Makeup',
            'HD / Airbrush makeup': 'Airbrush Makeup'
        };

        console.log('--- Syncing Staff Assigned Services ---');
        for (const [oldName, newName] of Object.entries(mapping)) {
            await db.execute('UPDATE staff SET assigned_service = ? WHERE assigned_service = ?', [newName, oldName]);
            console.log(`Updated "${oldName}" to "${newName}"`);
        }
        
        // Also trim all names
        await db.execute('UPDATE staff SET assigned_service = TRIM(assigned_service)');
        console.log('Trimmed all service names in staff table.');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

syncStaffServices();
