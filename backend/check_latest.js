const db = require('./config/db');

const checkLatestAppointment = async () => {
    const [rows] = await db.execute('SELECT services FROM appointments ORDER BY id DESC LIMIT 1');
    if (rows.length > 0) {
        console.log(JSON.stringify(rows[0].services, null, 2));
    } else {
        console.log('No appointments found.');
    }
    process.exit(0);
}

checkLatestAppointment();
