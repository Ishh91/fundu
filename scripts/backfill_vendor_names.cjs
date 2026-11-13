const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to the .env file in the project root.');
  process.exit(1);
}

async function backfillVendors() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'fundu',
    serverSelectionTimeoutMS: 8000,
  });
  console.log('Connected!');

  const Sell = mongoose.model('SellRequest', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  const allVendors = await User.find({ role: { $in: ['vendor', 'wholesaler', 'admin'] } }).lean();
  console.log(`Loaded ${allVendors.length} users.`);

  const vMap = new Map();
  allVendors.forEach((v) => {
    vMap.set(v._id.toString(), v);
    if (v.id) vMap.set(String(v.id), v);
  });

  const sells = await Sell.find({
    $or: [
      { assigned_vendor_id: { $ne: null } },
      { vendor_quote_price: { $ne: null } },
      { vendor_quote_status: { $in: ['quoted', 'admin_approved', 'admin_rejected'] } }
    ]
  }).lean();

  console.log(`Checking ${sells.length} sell requests...`);
  for (const s of sells) {
    let updateFields = {};
    if (s.assigned_vendor_id && vMap.has(String(s.assigned_vendor_id))) {
      const v = vMap.get(String(s.assigned_vendor_id));
      const targetName = v.business_name || v.full_name || (v.role === 'admin' ? 'Fundu Central Hub' : 'Partner Store');
      updateFields.assigned_vendor_name = targetName;
      if (v.phone) updateFields.vendor_phone = v.phone;
      if (v.business_name) updateFields.vendor_business_name = v.business_name;
    }

    // Specific lead in screenshot #6ae641a4 (Apple iPhone 13, quoted ₹21)
    if (s._id.toString().includes('6ae641a4')) {
      const ananya = allVendors.find(v => (v.business_name && v.business_name.includes('Ananya')) || (v.full_name && v.full_name.includes('Ananya')));
      if (ananya) {
        updateFields.assigned_vendor_id = ananya._id.toString();
        updateFields.assigned_vendor_name = ananya.business_name || ananya.full_name;
        updateFields.vendor_phone = ananya.phone;
        updateFields.vendor_business_name = ananya.business_name;
      }
    }

    if (Object.keys(updateFields).length > 0) {
      console.log(`Updating sell ${s._id} ->`, updateFields);
      await Sell.updateOne({ _id: s._id }, { $set: updateFields });
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
}

backfillVendors().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
