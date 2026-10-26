import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://trustiqueassist0003_db_user:r1BrCdYiCcPgBxK6@cluster0.w56fxzj.mongodb.net/fundu?appName=Cluster0';

async function check() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const spCount = await db.collection('sellpriceconfigs').countDocuments();
  const mpCount = await db.collection('masterphones').countDocuments();
  console.log('sellpriceconfigs count:', spCount);
  console.log('masterphones count:', mpCount);

  // Check iPhone 16 Pro in sellpriceconfigs
  const ip16 = await db.collection('sellpriceconfigs').find({
    brand: /apple/i,
    model: /iPhone 16 Pro/i
  }).toArray();
  console.log('iPhone 16 Pro records in sellpriceconfigs:', ip16.map(r => ({
    model: r.model,
    storage: r.storage,
    base_price: r.base_price,
    excellent_multiplier: r.excellent_multiplier,
    good_multiplier: r.good_multiplier,
    fair_multiplier: r.fair_multiplier
  })));

  await mongoose.disconnect();
}

check();
