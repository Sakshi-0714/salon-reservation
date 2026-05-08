const db = require('./config/db');

const findAdmin = async () => {
    const [rows] = await db.execute("SELECT email, role FROM users WHERE role = 'admin'");
    console.log(rows);
    process.exit(0);
}

findAdmin();
