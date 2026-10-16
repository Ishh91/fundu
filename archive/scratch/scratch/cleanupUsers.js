import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'fundu';
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@fundu.in').toLowerCase();
const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';

const userSchema = new mongoose.Schema({
  email: String,
  phone: String,
  passwordHash: String,
  full_name: String,
  role: String,
  is_verified: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function cleanUsers() {
  if (!mongoUri) {
    console.error('❌ Missing MONGODB_URI in .env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoUri, {
    dbName,
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 5000,
  });
  console.log('✅ Connected to MongoDB.');

  // Delete all non-admin users
  const deleteResult = await User.deleteMany({
    email: { $ne: adminEmail },
    role: { $ne: 'admin' },
  });

  console.log(`🧹 Cleared ${deleteResult.deletedCount} non-admin test users from MongoDB database.`);

  // Ensure Admin account exists
  let adminUser = await User.findOne({ email: adminEmail });
  const hash = await bcrypt.hash(adminPass, 10);

  if (!adminUser) {
    adminUser = await User.create({
      email: adminEmail,
      passwordHash: hash,
      full_name: 'System Admin',
      role: 'admin',
      is_verified: true,
    });
    console.log(`👑 Created default Admin account: ${adminEmail} (Password: ${adminPass})`);
  } else {
    adminUser.passwordHash = hash;
    adminUser.role = 'admin';
    adminUser.is_verified = true;
    await adminUser.save();
    console.log(`👑 Verified Admin account: ${adminEmail} (Password updated to ${adminPass})`);
  }

  const remaining = await User.countDocuments();
  console.log(`✨ Cleanup complete! Total remaining users in database: ${remaining}`);

  await mongoose.disconnect();
  process.exit(0);
}

cleanUsers().catch((err) => {
  console.error('❌ Error cleaning users:', err);
  process.exit(1);
});
