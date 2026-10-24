import { createPhoneQuote } from '../server/services/quoteService.js';

async function test() {
  const models = [
    'Sell Samsung Galaxy Z Flip 4',
    'Samsung Galaxy Z Flip 4',
    'Galaxy Z Flip 4'
  ];
  for (const model of models) {
    const q = await createPhoneQuote({
      brand: 'Samsung',
      model,
      storage: '128 GB',
      powers_on: true,
      cosmetic_condition: 'good',
      screen_condition: 'flawless',
      body_condition: 'flawless',
      battery_health: 'healthy',
      accessories: [],
      defects: []
    });
    console.log(model, '-> offerAmount:', q.offerAmount, 'status:', q.status, 'deviceSummary:', q.deviceSummary);
  }
}
test();
