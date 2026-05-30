const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign({ id: '132adad5-1449-45f8-8229-30908432c8b7', username: 'rora', email: 'rora@gmail.com' }, 'classify_secret_key_2026', { expiresIn: '1d' });
  
  try {
    const res = await fetch('http://localhost:3000/api/schedules/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    console.log('API RESPONSE STATUS:', res.status);
    console.log('SCHEDULES LENGTH:', json.data.length);
    json.data.forEach(s => {
      console.log(`- ${s.activity} | canEdit: ${s.canEdit}`);
    });
  } catch (err) {
    console.error('FETCH ERROR:', err.message);
  }
  process.exit(0);
}
test();
