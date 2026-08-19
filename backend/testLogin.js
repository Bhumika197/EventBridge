fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'bhumika_rbu', password: 'password123' })
})
  .then(res => res.json())
  .then(data => {
    console.log('LOGIN RESULT:', JSON.stringify(data, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('LOGIN ERROR:', err);
    process.exit(1);
  });
