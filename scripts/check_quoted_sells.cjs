const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://trustiqueassist0003_db_user:r1BrCdYiCcPgBxK6@cluster0.w56fxzj.mongodb.net/?appName=Cluster0', {
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

