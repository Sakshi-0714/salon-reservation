const mysql = require('mysql2/promise');
mysql.createConnection({host:'localhost', user:'root', password:'Salon123', database:'salon_db'})
.then(c => c.execute("ALTER TABLE appointments MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Not Available') DEFAULT 'Pending'")
.then(() => console.log('Enum updated'))
.catch(console.log));
