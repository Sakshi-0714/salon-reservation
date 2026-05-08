const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'supersecret123salonkey', { expiresIn: '30d' });

  try {
    const res = await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_name: 'Hair Spa',
        rating: 5,
        comment: 'Test comment'
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.log("Error:", err.message);
  }
}
test();
