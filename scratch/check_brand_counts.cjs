const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://trustiqueassist0003_db_user:r1BrCdYiCcPgBxK6@cluster0.w56fxzj.mongodb.net/fundu?appName=Cluster0';

async function checkBrands() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const brands = await db.collection('sellpriceconfigs').aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 }, avgPrice: { $avg: '$base_price' } } },
    { $sort: { count: -1 } }
  ]).toArray();

  console.log('Brands in sellpriceconfigs:', brands);

  await mongoose.disconnect();
}

checkBrands();
