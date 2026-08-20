const http = require('http');

async function loginUser(username, password) {
  const start = Date.now();
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const json = await res.json();
  const latency = Date.now() - start;
  return { username, ok: res.ok, status: res.status, json, latency };
}

async function runConcurrencyTest() {
  console.log('🚀 Launching 40 Concurrent User Login & API Requests simultaneously...');
  
  // Pick 40 distinct users from the 100 seeded accounts
  const users = [
    'bhumika_rbu',
    'aarav_rcoem',
    'admin',
    'org_rbu',
    'org_rcoem',
    'org_nvu',
    'org_git',
    ...Array.from({ length: 33 }, (_, i) => `student${i + 1}`)
  ];

  const startTime = Date.now();
  const promises = users.map(u => {
    const pwd = u === 'admin' ? 'admin123' : 'password123';
    return loginUser(u, pwd);
  });

  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  let successes = 0;
  let failures = 0;
  let totalLatency = 0;

  for (const r of results) {
    if (r.ok && r.json.success) {
      successes++;
      totalLatency += r.latency;
    } else {
      failures++;
      console.error(`❌ User ${r.username} failed:`, r.json);
    }
  }

  console.log('==================================================');
  console.log(`📊 CONCURRENCY TEST RESULTS: 40 SIMULTANEOUS USERS`);
  console.log('==================================================');
  console.log(`✅ Successful Logins: ${successes} / 40`);
  console.log(`❌ Failed Logins:     ${failures} / 40`);
  console.log(`⚡ Total Batch Time:   ${totalTime} ms`);
  console.log(`⏱️ Avg User Latency:   ${Math.round(totalLatency / (successes || 1))} ms`);
  console.log('==================================================');

  if (failures === 0) {
    console.log('🎉 40 SIMULTANEOUS CONCURRENT SESSIONS HANDLED FLAWLESSLY!');
  } else {
    process.exit(1);
  }
}

runConcurrencyTest();
