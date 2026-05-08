const http = require('http');

const data = JSON.stringify({
  email: 'user@example.com',
  password: 'password'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(loginOptions, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    // If login succeeds or fails, let's just make an appointment request manually without login if we can, 
    // wait, the API uses JWT. I should fetch users from DB, make a JWT manually and call it.
  });
});
req.write(data);
req.end();
