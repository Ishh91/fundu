const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to the .env file in the project root.');
  process.exit(1);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'fundu',
    serverSelectionTimeoutMS: 5000,
  });

  const Sell = mongoose.model('SellRequest', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  const vendors = await User.find({ role: { $in: ['vendor', 'admin', 'wholesaler'] } }).lean();
  console.log('Found users:', vendors.map(v => ({ id: v._id.toString(), name: v.full_name, business: v.business_name, role: v.role })));

  const quotedSells = await Sell.find({
    $or: [
      { vendor_quote_price: { $ne: null } },
      { vendor_quote_status: { $in: ['quoted', 'admin_approved', 'admin_rejected'] } },
      { assigned_vendor_id: { $ne: null } }
    ]
  }).lean();

  console.log(`Found ${quotedSells.length} sell requests with vendor quotes/assignments:`);
  for (const s of quotedSells) {
    console.log({
      _id: s._id.toString(),
      brand: s.brand,
      model: s.model,
      quotePrice: s.vendor_quote_price,
      vendorStatus: s.vendor_quote_status,
      assigned_vendor_id: s.assigned_vendor_id,
      assigned_vendor_name: s.assigned_vendor_name
    });
  }

  await mongoose.disconnect();
}

run().catch(console.error);

