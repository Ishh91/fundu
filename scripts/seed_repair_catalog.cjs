const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SEED_REPAIR_MODELS = [
  // --- APPLE iPHONES ---
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 15 Pro Max', device_series: 'iPhone 15 Series', screenPrice: 19999, batteryPrice: 3899, chargingPrice: 1499, cameraPrice: 5999, backglassPrice: 5499, motherboardPrice: 999 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 15 Pro', device_series: 'iPhone 15 Series', screenPrice: 17999, batteryPrice: 3699, chargingPrice: 1499, cameraPrice: 5499, backglassPrice: 4999, motherboardPrice: 999 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 15', device_series: 'iPhone 15 Series', screenPrice: 8999, batteryPrice: 2999, chargingPrice: 1199, cameraPrice: 3499, backglassPrice: 2999, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 14 Pro Max', device_series: 'iPhone 14 Series', screenPrice: 16999, batteryPrice: 3499, chargingPrice: 1299, cameraPrice: 4999, backglassPrice: 4499, motherboardPrice: 899 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 14', device_series: 'iPhone 14 Series', screenPrice: 6999, batteryPrice: 2699, chargingPrice: 999, cameraPrice: 2999, backglassPrice: 2499, motherboardPrice: 599 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 13', device_series: 'iPhone 13 Series', screenPrice: 5499, batteryPrice: 2299, chargingPrice: 899, cameraPrice: 2499, backglassPrice: 1999, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 12', device_series: 'iPhone 12 Series', screenPrice: 4499, batteryPrice: 1999, chargingPrice: 799, cameraPrice: 1999, backglassPrice: 1699, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 11', device_series: 'iPhone 11 Series', screenPrice: 3299, batteryPrice: 1699, chargingPrice: 699, cameraPrice: 1699, backglassPrice: 1399, motherboardPrice: 399 },

  // --- SAMSUNG GALAXY ---
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy S24 Ultra', device_series: 'Galaxy S Series', screenPrice: 18999, batteryPrice: 3299, chargingPrice: 1299, cameraPrice: 4999, backglassPrice: 3999, motherboardPrice: 999 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy S24', device_series: 'Galaxy S Series', screenPrice: 11999, batteryPrice: 2799, chargingPrice: 999, cameraPrice: 3499, backglassPrice: 2699, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy S23 Ultra', device_series: 'Galaxy S Series', screenPrice: 15999, batteryPrice: 2999, chargingPrice: 1099, cameraPrice: 4299, backglassPrice: 3299, motherboardPrice: 899 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy S23', device_series: 'Galaxy S Series', screenPrice: 9499, batteryPrice: 2499, chargingPrice: 899, cameraPrice: 2999, backglassPrice: 2199, motherboardPrice: 599 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy A55', device_series: 'Galaxy A Series', screenPrice: 4499, batteryPrice: 1599, chargingPrice: 699, cameraPrice: 1799, backglassPrice: 1299, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy A35', device_series: 'Galaxy A Series', screenPrice: 3499, batteryPrice: 1499, chargingPrice: 699, cameraPrice: 1499, backglassPrice: 1199, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy M34', device_series: 'Galaxy M Series', screenPrice: 2499, batteryPrice: 1299, chargingPrice: 599, cameraPrice: 1199, backglassPrice: 899, motherboardPrice: 399 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy Z Fold 5', device_series: 'Galaxy Z Series', screenPrice: 24999, batteryPrice: 3999, chargingPrice: 1499, cameraPrice: 5499, backglassPrice: 4999, motherboardPrice: 1299 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy Z Flip 5', device_series: 'Galaxy Z Series', screenPrice: 16999, batteryPrice: 3299, chargingPrice: 1199, cameraPrice: 3999, backglassPrice: 3499, motherboardPrice: 999 },

  // --- ONEPLUS ---
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus 12', device_series: 'Number Series', screenPrice: 12999, batteryPrice: 2699, chargingPrice: 999, cameraPrice: 3499, backglassPrice: 2799, motherboardPrice: 799 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus 12R', device_series: 'R Series', screenPrice: 7999, batteryPrice: 2299, chargingPrice: 899, cameraPrice: 2699, backglassPrice: 1999, motherboardPrice: 599 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus 11', device_series: 'Number Series', screenPrice: 9999, batteryPrice: 2499, chargingPrice: 899, cameraPrice: 2999, backglassPrice: 2299, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus 11R', device_series: 'R Series', screenPrice: 6499, batteryPrice: 1999, chargingPrice: 799, cameraPrice: 2199, backglassPrice: 1699, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus Nord CE 4', device_series: 'Nord Series', screenPrice: 3499, batteryPrice: 1499, chargingPrice: 649, cameraPrice: 1499, backglassPrice: 1099, motherboardPrice: 449 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus Nord 3', device_series: 'Nord Series', screenPrice: 4199, batteryPrice: 1699, chargingPrice: 699, cameraPrice: 1699, backglassPrice: 1299, motherboardPrice: 499 },

  // --- XIAOMI / REDMI / POCO ---
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Xiaomi 14', device_series: 'Flagship Series', screenPrice: 11999, batteryPrice: 2499, chargingPrice: 999, cameraPrice: 3499, backglassPrice: 2499, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Redmi Note 13 Pro+', device_series: 'Redmi Note Series', screenPrice: 4999, batteryPrice: 1599, chargingPrice: 699, cameraPrice: 1899, backglassPrice: 1299, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Redmi Note 13 Pro', device_series: 'Redmi Note Series', screenPrice: 3899, batteryPrice: 1499, chargingPrice: 649, cameraPrice: 1699, backglassPrice: 1199, motherboardPrice: 449 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Redmi Note 13', device_series: 'Redmi Note Series', screenPrice: 2799, batteryPrice: 1299, chargingPrice: 599, cameraPrice: 1299, backglassPrice: 899, motherboardPrice: 399 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Poco X6 Pro', device_series: 'Poco Series', screenPrice: 3699, batteryPrice: 1499, chargingPrice: 649, cameraPrice: 1599, backglassPrice: 1099, motherboardPrice: 449 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Redmi 12', device_series: 'Redmi Number Series', screenPrice: 1799, batteryPrice: 999, chargingPrice: 499, cameraPrice: 899, backglassPrice: 699, motherboardPrice: 349 },

  // --- GOOGLE PIXEL ---
  { product_type: 'smartphone', brand: 'Google', model: 'Pixel 8 Pro', device_series: 'Pixel 8 Series', screenPrice: 15999, batteryPrice: 2999, chargingPrice: 1199, cameraPrice: 4499, backglassPrice: 3499, motherboardPrice: 899 },
  { product_type: 'smartphone', brand: 'Google', model: 'Pixel 8', device_series: 'Pixel 8 Series', screenPrice: 9999, batteryPrice: 2499, chargingPrice: 999, cameraPrice: 3299, backglassPrice: 2499, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Google', model: 'Pixel 7a', device_series: 'Pixel A Series', screenPrice: 5499, batteryPrice: 1999, chargingPrice: 799, cameraPrice: 2199, backglassPrice: 1499, motherboardPrice: 499 },

  // --- VIVO & REALME ---
  { product_type: 'smartphone', brand: 'Vivo', model: 'Vivo X100', device_series: 'X Series', screenPrice: 12999, batteryPrice: 2699, chargingPrice: 999, cameraPrice: 3899, backglassPrice: 2699, motherboardPrice: 799 },
  { product_type: 'smartphone', brand: 'Vivo', model: 'Vivo V30 Pro', device_series: 'V Series', screenPrice: 5499, batteryPrice: 1899, chargingPrice: 799, cameraPrice: 2499, backglassPrice: 1599, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Realme', model: 'Realme 12 Pro+', device_series: 'Number Pro Series', screenPrice: 4499, batteryPrice: 1699, chargingPrice: 699, cameraPrice: 1999, backglassPrice: 1399, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Realme', model: 'Realme GT 6', device_series: 'GT Series', screenPrice: 6999, batteryPrice: 2199, chargingPrice: 899, cameraPrice: 2799, backglassPrice: 1899, motherboardPrice: 599 },

  // --- NOTHING ---
  { product_type: 'smartphone', brand: 'Nothing', model: 'Nothing Phone (2)', device_series: 'Phone Series', screenPrice: 7999, batteryPrice: 2499, chargingPrice: 899, cameraPrice: 2999, backglassPrice: 2999, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Nothing', model: 'Nothing Phone (2a)', device_series: 'Phone Series', screenPrice: 4499, batteryPrice: 1699, chargingPrice: 699, cameraPrice: 1899, backglassPrice: 1699, motherboardPrice: 499 },

  // --- LAPTOPS ---
  { product_type: 'laptop', brand: 'Apple', model: 'MacBook Air M1', device_series: 'MacBook Air', screenPrice: 14999, batteryPrice: 5499, chargingPrice: 2299, cameraPrice: 2499, backglassPrice: 3499, motherboardPrice: 3999 },
  { product_type: 'laptop', brand: 'Apple', model: 'MacBook Air M2', device_series: 'MacBook Air', screenPrice: 18999, batteryPrice: 6499, chargingPrice: 2499, cameraPrice: 2999, backglassPrice: 3999, motherboardPrice: 4999 },
  { product_type: 'laptop', brand: 'Dell', model: 'Dell Inspiron 15', device_series: 'Inspiron Series', screenPrice: 4499, batteryPrice: 2499, chargingPrice: 1199, cameraPrice: 1299, backglassPrice: 1699, motherboardPrice: 1999 },
  { product_type: 'laptop', brand: 'Dell', model: 'Dell XPS 13', device_series: 'XPS Premium Series', screenPrice: 11999, batteryPrice: 3899, chargingPrice: 1899, cameraPrice: 1999, backglassPrice: 2499, motherboardPrice: 2999 },
  { product_type: 'laptop', brand: 'HP', model: 'HP Pavilion 15', device_series: 'Pavilion Series', screenPrice: 4699, batteryPrice: 2499, chargingPrice: 1199, cameraPrice: 1299, backglassPrice: 1699, motherboardPrice: 1999 },
  { product_type: 'laptop', brand: 'Lenovo', model: 'Lenovo ThinkPad E14', device_series: 'ThinkPad Series', screenPrice: 5499, batteryPrice: 2899, chargingPrice: 1299, cameraPrice: 1499, backglassPrice: 1899, motherboardPrice: 2299 },

  // --- TABLETS ---
  { product_type: 'tablet', brand: 'Apple', model: 'iPad 10th Gen', device_series: 'iPad Base Series', screenPrice: 6999, batteryPrice: 2999, chargingPrice: 1199, cameraPrice: 1899, backglassPrice: 2299, motherboardPrice: 1899 },
  { product_type: 'tablet', brand: 'Apple', model: 'iPad Air 5', device_series: 'iPad Air', screenPrice: 9999, batteryPrice: 3499, chargingPrice: 1299, cameraPrice: 2199, backglassPrice: 2699, motherboardPrice: 2299 },
  { product_type: 'tablet', brand: 'Samsung', model: 'Galaxy Tab S9 FE', device_series: 'Galaxy Tab', screenPrice: 6499, batteryPrice: 2699, chargingPrice: 999, cameraPrice: 1699, backglassPrice: 1999, motherboardPrice: 1699 },

  // --- SMARTWATCHES ---
  { product_type: 'smartwatch', brand: 'Apple', model: 'Apple Watch Series 9', device_series: 'Series 9', screenPrice: 7999, batteryPrice: 2499, chargingPrice: 999, cameraPrice: 999, backglassPrice: 1499, motherboardPrice: 1499 },
  { product_type: 'smartwatch', brand: 'Samsung', model: 'Galaxy Watch 6', device_series: 'Galaxy Watch', screenPrice: 4999, batteryPrice: 1899, chargingPrice: 799, cameraPrice: 799, backglassPrice: 1199, motherboardPrice: 1199 },
];

function buildServices(seed) {
  const isLaptop = seed.product_type === 'laptop';
  const isTablet = seed.product_type === 'tablet';
  const isWatch = seed.product_type === 'smartwatch';

  if (isLaptop) {
    return [
      { service_id: 'screen', name: 'Display / Screen Panel Replacement', price: seed.screenPrice, original_price: Math.round(seed.screenPrice * 1.25), warranty: '6 Months Warranty', turnaround_time: 'Same Day Repair', is_available: true },
      { service_id: 'battery', name: 'Laptop Battery Replacement', price: seed.batteryPrice, original_price: Math.round(seed.batteryPrice * 1.25), warranty: '6 Months Warranty', turnaround_time: '45 Mins Doorstep', is_available: true },
      { service_id: 'keyboard', name: 'Keyboard Replacement', price: Math.round(seed.batteryPrice * 0.9), original_price: Math.round(seed.batteryPrice * 1.1), warranty: '6 Months Warranty', turnaround_time: '1 Hour Doorstep', is_available: true },
      { service_id: 'trackpad', name: 'Trackpad / Touchpad Repair', price: Math.round(seed.batteryPrice * 0.8), original_price: seed.batteryPrice, warranty: '3 Months Warranty', turnaround_time: '45 Mins Doorstep', is_available: true },
      { service_id: 'charging', name: 'Charging Port / DC Power Jack', price: seed.chargingPrice, original_price: Math.round(seed.chargingPrice * 1.3), warranty: '3 Months Warranty', turnaround_time: '45 Mins Doorstep', is_available: true },
      { service_id: 'motherboard', name: 'Motherboard Chip-Level IC Repair', price: seed.motherboardPrice, original_price: Math.round(seed.motherboardPrice * 1.3), warranty: 'Lab Tested', turnaround_time: '24 Hr Lab Diagnostics', is_available: true },
      { service_id: 'fan_thermal', name: 'Cooling Fan & Thermal Paste Service', price: 899, original_price: 1199, warranty: '3 Months Warranty', turnaround_time: '30 Mins Doorstep', is_available: true },
      { service_id: 'ssd_ram', name: 'SSD Storage & RAM Upgrade', price: 1199, original_price: 1599, warranty: '1 Year Warranty', turnaround_time: '30 Mins Doorstep', is_available: true },
      { service_id: 'software', name: 'OS Installation & Data Recovery', price: 499, original_price: 799, warranty: 'Data Safe Protocol', turnaround_time: '45 Mins Doorstep', is_available: true },
    ];
  }

  if (isTablet) {
    return [
      { service_id: 'screen', name: 'Touch Glass / LCD Screen Replacement', price: seed.screenPrice, original_price: Math.round(seed.screenPrice * 1.25), warranty: '6 Months Warranty', turnaround_time: 'Same Day Lab', is_available: true },
      { service_id: 'battery', name: 'Tablet Battery Replacement', price: seed.batteryPrice, original_price: Math.round(seed.batteryPrice * 1.25), warranty: '6 Months Warranty', turnaround_time: '45 Mins Doorstep', is_available: true },
      { service_id: 'charging', name: 'Charging Port Repair', price: seed.chargingPrice, original_price: Math.round(seed.chargingPrice * 1.3), warranty: '3 Months Warranty', turnaround_time: '30 Mins Doorstep', is_available: true },
      { service_id: 'camera', name: 'Front & Rear Camera Repair', price: seed.cameraPrice, original_price: Math.round(seed.cameraPrice * 1.3), warranty: '6 Months Warranty', turnaround_time: '30 Mins Doorstep', is_available: true },
      { service_id: 'speaker', name: 'Loudspeaker / Audio Repair', price: Math.round(seed.chargingPrice * 0.85), original_price: seed.chargingPrice, warranty: '3 Months Warranty', turnaround_time: '25 Mins Doorstep', is_available: true },
      { service_id: 'motherboard', name: 'Water Damage & Logic Board IC', price: seed.motherboardPrice, original_price: Math.round(seed.motherboardPrice * 1.3), warranty: 'Lab Diagnostics', turnaround_time: '24 Hr Lab Repair', is_available: true },
    ];
  }

  if (isWatch) {
    return [
      { service_id: 'screen', name: 'AMOLED Touch Screen Replacement', price: seed.screenPrice, original_price: Math.round(seed.screenPrice * 1.3), warranty: '6 Months Warranty', turnaround_time: '24 Hr Lab Repair', is_available: true },
      { service_id: 'battery', name: 'Watch Battery Replacement', price: seed.batteryPrice, original_price: Math.round(seed.batteryPrice * 1.3), warranty: '6 Months Warranty', turnaround_time: '24 Hr Lab Repair', is_available: true },
      { service_id: 'sensor', name: 'Health Sensor & Heart Rate Sensor', price: 1299, original_price: 1699, warranty: '3 Months Warranty', turnaround_time: '24 Hr Lab Diagnostics', is_available: true },
      { service_id: 'strap_body', name: 'Digital Crown & Housing Casing', price: 1499, original_price: 1999, warranty: '3 Months Warranty', turnaround_time: '24 Hr Lab Repair', is_available: true },
    ];
  }

  // Smartphone
  return [
    { service_id: 'screen', name: 'Screen & Display Replacement', price: seed.screenPrice, original_price: Math.round(seed.screenPrice * 1.25), warranty: '6 Months Warranty', turnaround_time: '30 Mins Doorstep', is_available: true },
    { service_id: 'battery', name: 'Battery Replacement & Health Check', price: seed.batteryPrice, original_price: Math.round(seed.batteryPrice * 1.25), warranty: '6 Months Warranty', turnaround_time: '20 Mins Doorstep', is_available: true },
    { service_id: 'charging', name: 'Charging Port & Sub-board IC', price: seed.chargingPrice, original_price: Math.round(seed.chargingPrice * 1.3), warranty: '3 Months Warranty', turnaround_time: '25 Mins Doorstep', is_available: true },
    { service_id: 'speaker', name: 'Mic, Receiver & Speaker Repair', price: Math.round(seed.chargingPrice * 0.85), original_price: seed.chargingPrice, warranty: '3 Months Warranty', turnaround_time: '20 Mins Doorstep', is_available: true },
    { service_id: 'camera', name: 'Front & Rear Camera Repair', price: seed.cameraPrice, original_price: Math.round(seed.cameraPrice * 1.25), warranty: '6 Months Warranty', turnaround_time: '30 Mins Doorstep', is_available: true },
    { service_id: 'backglass', name: 'Back Glass & Body Chassis Replacement', price: seed.backglassPrice, original_price: Math.round(seed.backglassPrice * 1.25), warranty: '3 Months Warranty', turnaround_time: '40 Mins Doorstep', is_available: true },
    { service_id: 'motherboard', name: 'Water Damage & Motherboard IC Repair', price: seed.motherboardPrice, original_price: Math.round(seed.motherboardPrice * 1.4), warranty: 'Lab Diagnostics', turnaround_time: '24 Hr Lab Repair', is_available: true },
    { service_id: 'software', name: 'Software Recovery & OS Flashing', price: 399, original_price: 599, warranty: 'Data Safe Protocol', turnaround_time: '20 Mins Doorstep', is_available: true },
  ];
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'fundu';

  console.log('Connecting to MongoDB for full catalog seed...');
  await mongoose.connect(uri, { dbName });

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
    release_year: { type: Number, default: 2024 },
    image_url: { type: String, default: null },
    base_repair_price: { type: Number, default: 499 },
    services: { type: [repairServiceItemSchema], default: [] },
    is_active: { type: Boolean, default: true },
  }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  const RepairPriceCatalog = mongoose.models.RepairPriceCatalog || mongoose.model('RepairPriceCatalog', repairPriceCatalogSchema);

  let count = 0;
  for (const s of SEED_REPAIR_MODELS) {
    const services = buildServices(s);
    const minPrice = Math.min(...services.map((item) => item.price));

    await RepairPriceCatalog.findOneAndUpdate(
      { brand: s.brand, model: s.model },
      {
        product_type: s.product_type,
        brand: s.brand,
        model: s.model,
        device_series: s.device_series,
        release_year: 2024,
        base_repair_price: minPrice,
        services,
        is_active: true,
      },
      { upsert: true, new: true }
    );
    count++;
  }

  console.log(`🎉 Successfully seeded ${count} devices into MongoDB Repair Price Catalog!`);
  const total = await RepairPriceCatalog.countDocuments();
  console.log(`Current Total Repair Price Catalog models in DB: ${total}`);

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
