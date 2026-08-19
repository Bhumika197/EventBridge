fetch('http://localhost:5000/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'bhumika@rbunagpur.in' })
})
  .then(res => res.json())
  .then(data => {
    console.log('FORGOT PASSWORD API RESULT:', JSON.stringify(data, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('FORGOT PASSWORD API ERROR:', err);
    process.exit(1);
  });
