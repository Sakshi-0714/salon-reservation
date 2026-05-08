const mysql = require('mysql2/promise');
mysql.createConnection({host:'localhost', user:'root', password:'Salon123', database:'salon_db'})
.then(c => c.execute('INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, paid_advance, selected_options) VALUES (?, ?, ?, ?, ?, ?)', [2, 1, '2026-04-08', '14:00', false, JSON.stringify(['Trim: ₹250'])])
.then(r => console.log('INSERT SUCCESS', r))
.catch(err => {
    console.error('INSERT FAILED', err);
    require('fs').writeFileSync('db_error.log', err.message);
}))
.catch(console.log);
