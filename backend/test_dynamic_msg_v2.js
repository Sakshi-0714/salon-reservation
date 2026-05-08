const db = require('./config/db');
const { createAppointment } = require('./controllers/appointmentController');

const testDynamicMessage = async () => {
    try {
        console.log('--- Checking Styling Staff ---');
        const [rows] = await db.execute('SELECT * FROM staff WHERE assigned_service LIKE "Styling%"');
        console.log('Found staff:', rows.map(r => ({ name: r.name, service: r.service, status: r.status })));
        
        if (rows.length === 0) {
            console.error('No staff found for Styling!');
            process.exit(1);
        }

        console.log('--- Setting Styling to Inactive ---');
        await db.execute('UPDATE staff SET status = "Inactive" WHERE assigned_service LIKE "Styling%"');

        // Verify status
        const [rows2] = await db.execute('SELECT status FROM staff WHERE assigned_service LIKE "Styling%"');
        console.log('Current status in DB:', rows2[0].status);

        // Mock req/res
        const req = {
            user: { id: 1 },
            body: {
                appointment_date: '2026-07-30',
                appointment_time: '12:00:00',
                services: [{ name: 'Styling', price: 50 }]
            }
        };
        
        let responseStatus = 0;
        let responseData = null;
        
        const res = {
            status: (s) => { responseStatus = s; return res; },
            json: (d) => { responseData = d; return res; }
        };

        console.log('\n--- Testing Dynamic Message ---');
        await createAppointment(req, res);
        console.log('Status:', responseStatus);
        console.log('Data:', responseData);

        // Cleanup
        await db.execute('UPDATE staff SET status = "Active" WHERE assigned_service LIKE "Styling%"');
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testDynamicMessage();
