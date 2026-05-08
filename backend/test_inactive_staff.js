const db = require('./config/db');
const { createAppointment } = require('./controllers/appointmentController');

const testInactiveStaff = async () => {
    try {
        console.log('--- Setting staff to Inactive ---');
        await db.execute('UPDATE staff SET status = "Inactive" WHERE name = "Anjali Patil"');

        // Mock req/res
        const req = {
            user: { id: 1 },
            body: {
                appointment_date: '2026-05-30',
                appointment_time: '12:00:00',
                services: [{ name: 'Haircut', price: 30 }]
            }
        };
        
        let responseStatus = 0;
        let responseData = null;
        
        const res = {
            status: (s) => { responseStatus = s; return res; },
            json: (d) => { responseData = d; return res; }
        };

        console.log('\n--- Testing Booking with Inactive Staff ---');
        await createAppointment(req, res);
        console.log('Status:', responseStatus);
        console.log('Data:', responseData);

        // Cleanup
        await db.execute('UPDATE staff SET status = "Active" WHERE name = "Anjali Patil"');
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testInactiveStaff();
