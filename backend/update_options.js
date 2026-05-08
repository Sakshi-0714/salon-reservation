const mysql = require('mysql2/promise');
mysql.createConnection({host:'localhost', user:'root', password:'Salon123', database:'salon_db'})
.then(c => c.execute('UPDATE appointments SET selected_options = ? WHERE id IN (10, 11)', [JSON.stringify(['Trim: ₹250'])])
.then(() => console.log('Enum updated'))
.catch(console.log));
