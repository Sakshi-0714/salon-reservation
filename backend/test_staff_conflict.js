const db = require('./config/db');
const { createAppointment } = require('./controllers/appointmentController');

const testConflict = async () => {
    // Mock req/res
    const req = {
        user: { id: 1 },
        body: {
            appointment_date: '2026-05-25',
            appointment_time: '10:00:00',
            services: [{ name: 'Haircut', price: 30 }]
        }
    };
    
    let responseStatus = 0;
    let responseData = null;
    
    const res = {
        status: (s) => { responseStatus = s; return res; },
        json: (d) => { responseData = d; return res; }
    };

    console.log('--- Testing First Booking ---');
    await createAppointment(req, res);
    console.log('Status:', responseStatus);
    console.log('Data:', responseData);

    console.log('\n--- Testing Conflict Booking ---');
    await createAppointment(req, res);
    console.log('Status:', responseStatus);
    console.log('Data:', responseData);

    process.exit(0);
};

testConflict();
