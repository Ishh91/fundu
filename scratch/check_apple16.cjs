const mongoose = require('mongoose');
const uri = 'mongodb+srv://trustiqueassist0003_db_user:r1BrCdYiCcPgBxK6@cluster0.w56fxzj.mongodb.net/fundu?appName=Cluster0';

async function run() {
  await mongoose.connect(uri);
  const configs = await mongoose.connection.db.collection('sellpriceconfigs').find({
    brand: { $regex: '^apple', $options: 'i' },
    model: { $regex: '16', $options: 'i' }
  }).toArray();
  console.log('Configs for Apple 16:');
  configs.forEach(c => console.log(c._id, c.brand, `"${c.model}"`, `"${c.storage}"`, 'base_price:', c.base_price, 'multipliers:', c.excellent_multiplier, c.good_multiplier, c.fair_multiplier));

  const mps = await mongoose.connection.db.collection('masterphones').find({
    brand: { $regex: '^apple', $options: 'i' },
    model: { $regex: '16', $options: 'i' }
  }).toArray();
  console.log('Masterphones for Apple 16:');
  mps.forEach(p => console.log(p._id, p.brand, `"${p.model}"`, 'base_resale_value:', p.base_resale_value, 'storages:', p.storage_options));

  const totalConfigs = await mongoose.connection.db.collection('sellpriceconfigs').countDocuments();
  const totalMasterPhones = await mongoose.connection.db.collection('masterphones').countDocuments();
  console.log('Total sellpriceconfigs in DB:', totalConfigs, 'Total masterphones:', totalMasterPhones);

  await mongoose.disconnect();
}
run();
