const payloadGood = {
  brand: 'Apple',
  model: 'Apple iPhone 16 Pro',
  storage: '128 GB',
  cosmetic_condition: 'good',
  powers_on: true,
  activation_lock_cleared: true,
  ownership_verified: true,
  accessories: ['Original Box', 'Original Charger'],
  defects: []
};

async function testGood() {
  const res = await fetch('https://fundu-wtm4.onrender.com/api/phones/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadGood)
  });
  const data = await res.json();
  console.log('Good Offer Amount:', data?.data?.offerAmount);
}

testGood();
