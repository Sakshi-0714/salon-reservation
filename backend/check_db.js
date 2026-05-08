const db = require('./config/db');

const checkDB = async () => {
    const [rows] = await db.execute('SELECT * FROM services');
    console.log(rows);
    process.exit(0);
}

checkDB();
