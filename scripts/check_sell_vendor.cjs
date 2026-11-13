const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to the .env file in the project root.');
  process.exit(1);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fundu' });
  const Sell = mongoose.model('SellRequest', new mongoose.Schema({}, { strict: false }));
  const docs = await Sell.find({}).sort({ _id: -1 }).limit(10).lean();
  console.log('Recent 10 sell requests:');
  for (const d of docs) {
    console.log({
      _id: d._id,
      brand: d.brand,
      model: d.model,
      status: d.status,
      vendor_quote_price: d.vendor_quote_price,
      vendor_quote_status: d.vendor_quote_status,
      assigned_vendor_id: d.assigned_vendor_id,
      assigned_vendor_name: d.assigned_vendor_name,
      pickup_area: d.pickup_area
    });
  }
  await mongoose.disconnect();
}

run().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
