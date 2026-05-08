const bcrypt = require('bcrypt'); 
const mysql = require('mysql2/promise'); 

async function seedAdmin() {
  const c = await mysql.createConnection({host:'localhost', user:'root', password:'Salon123', database:'salon_db'});
  const salt = await bcrypt.genSalt(10); 
  const hash = await bcrypt.hash('admin123', salt); 
  
  await c.execute("DELETE FROM users WHERE email = 'admin@gmail.com'"); 
  await c.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['Admin', 'admin@gmail.com', hash, 'admin']); 
  console.log('ADMIN SEEDED'); 
  process.exit(0);
}

seedAdmin().catch(console.error);
