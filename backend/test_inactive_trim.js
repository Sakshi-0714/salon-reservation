const db = require('./config/db');
const { createAppointment } = require('./controllers/appointmentController');

const testInactiveStaffTrim = async () => {
    try {
        console.log('--- Setting staff to Inactive with Trailing Space ---');
        // Ensure "Waxing " is inactive
        await db.execute('UPDATE staff SET status = "Inactive" WHERE name = "Meena Khot"');

        // Mock req/res with "Waxing" (no space)
        const req = {
            user: { id: 1 },
            body: {
                appointment_date: '2026-06-30',
                appointment_time: '12:00:00',
                services: [{ name: 'Waxing', price: 20 }]
            }
        };
        
        let responseStatus = 0;
        let responseData = null;
        
        const res = {
            status: (s) => { responseStatus = s; return res; },
            json: (d) => { responseData = d; return res; }
        };

        console.log('\n--- Testing Booking with Inactive Staff (Mismatched Spaces) ---');
        await createAppointment(req, res);
        console.log('Status:', responseStatus);
        console.log('Data:', responseData);

        // Cleanup
        await db.execute('UPDATE staff SET status = "Active" WHERE name = "Meena Khot"');
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testInactiveStaffTrim();
