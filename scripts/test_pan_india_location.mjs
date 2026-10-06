import { searchPanIndiaLocations, PAN_INDIA_POPULAR_CITIES } from '../src/lib/locationService.ts';

async function run() {
  console.log('Testing Pan-India Location Service:');
  console.log('1. Default Popular Cities count:', PAN_INDIA_POPULAR_CITIES.length);

  const testQueries = ['226001', '110001', 'lucknow', 'mumbai', 'pune', 'jaipur', 'gorakhpur', 'patna'];

  for (const q of testQueries) {
    const results = await searchPanIndiaLocations(q);
    console.log(`Query "${q}": found ${results.length} matches. Top match:`, results[0]?.displayLabel || 'None');
  }
}

run();
