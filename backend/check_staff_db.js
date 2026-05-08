const db = require('./config/db');

const checkStaff = async () => {
    try {
        const [rows] = await db.execute('SELECT * FROM staff');
        console.log('Staff count:', rows.length);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
};

checkStaff();
