const payload = {
  brand: 'Apple',
  model: 'Apple iPhone 16 Pro',
  storage: '128 GB',
  cosmetic_condition: 'flawless',
  powers_on: true,
  activation_lock_cleared: true,
  ownership_verified: true,
  accessories: ['Original Box', 'Original Charger'],
  defects: []
};

async function test() {
  try {
    const res = await fetch('https://fundu-wtm4.onrender.com/api/phones/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
