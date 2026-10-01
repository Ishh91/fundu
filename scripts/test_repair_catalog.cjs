const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function testRepairCatalog() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'fundu';

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { dbName });
  console.log('Connected to MongoDB successfully!');

  const repairServiceItemSchema = new mongoose.Schema({
    service_id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    original_price: { type: Number, default: null },
    warranty: { type: String, default: '6 Months Warranty' },
    turnaround_time: { type: String, default: '30 Mins Doorstep' },
    is_available: { type: Boolean, default: true },
  }, { _id: false });

  const repairPriceCatalogSchema = new mongoose.Schema({
    product_type: { type: String, default: 'smartphone' },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    device_series: { type: String, default: null },
    release_year: { type: Number, default: null },
    image_url: { type: String, default: null },
    base_repair_price: { type: Number, default: 499 },
    services: { type: [repairServiceItemSchema], default: [] },
    is_active: { type: Boolean, default: true },
  }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  const RepairPriceCatalog = mongoose.models.RepairPriceCatalog || mongoose.model('RepairPriceCatalog', repairPriceCatalogSchema);

  // Upsert a sample iPhone 15 Pro Max repair pricing
  const sample = {
    product_type: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    device_series: 'iPhone 15 Series',
    release_year: 2023,
    base_repair_price: 1499,
    services: [
      { service_id: 'screen', name: 'Screen & Display Replacement', price: 19999, original_price: 24999, warranty: '6 Months Warranty', turnaround_time: '30 Mins Doorstep', is_available: true },
      { service_id: 'battery', name: 'Battery Replacement & Health Check', price: 3899, original_price: 4499, warranty: '6 Months Warranty', turnaround_time: '20 Mins Doorstep', is_available: true },
      { service_id: 'camera', name: 'Front & Rear Camera Repair', price: 5999, original_price: 6999, warranty: '6 Months Warranty', turnaround_time: '30 Mins Doorstep', is_available: true },
      { service_id: 'backglass', name: 'Back Glass & Body Chassis Replacement', price: 5499, original_price: 6499, warranty: '3 Months Warranty', turnaround_time: '40 Mins Doorstep', is_available: true },
      { service_id: 'charging', name: 'Charging Port & Sub-board IC', price: 1499, original_price: 1999, warranty: '3 Months Warranty', turnaround_time: '25 Mins Doorstep', is_available: true },
    ],
    is_active: true,
  };

  const doc = await RepairPriceCatalog.findOneAndUpdate(
    { brand: sample.brand, model: sample.model },
    sample,
    { new: true, upsert: true }
  );

  console.log('✅ Successfully upserted sample catalog entry:', doc.brand, doc.model, 'with', doc.services.length, 'services!');
  
  const count = await RepairPriceCatalog.countDocuments();
  console.log(`Total repair price configs in DB: ${count}`);

  await mongoose.disconnect();
  console.log('Disconnected cleanly.');
}

testRepairCatalog().catch((e) => {
  console.error('Error testing catalog:', e);
  process.exit(1);
});
