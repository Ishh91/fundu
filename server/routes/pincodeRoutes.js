import { Router } from 'express';
import { ServiceablePincode } from '../models/ServiceablePincode.js';

const router = Router();

// Standard Initial Lucknow Pincodes Seed Dataset
export const LUCKNOW_DEFAULT_PINCODES = [
  { pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'GPO, Hazratganj, Lalbagh', services: ['sell', 'repair'] },
  { pincode: '226002', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Charbagh, Rajendra Nagar, Hussainganj', services: ['sell', 'repair'] },
  { pincode: '226003', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Chowk, Aminabad, Wazirganj', services: ['sell', 'repair'] },
  { pincode: '226004', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Saadatganj, Kashmiri Mohalla', services: ['sell', 'repair'] },
  { pincode: '226005', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Alambagh, Geeta Palli, Chander Nagar', services: ['sell', 'repair'] },
  { pincode: '226006', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Rajajipuram, Talkatora', services: ['sell', 'repair'] },
  { pincode: '226007', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Mahanagar, Nishatganj, Badshahnagar', services: ['sell', 'repair'] },
  { pincode: '226008', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Singar Nagar, VIP Road', services: ['sell', 'repair'] },
  { pincode: '226009', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Sarojini Nagar, Amausi Airport Road', services: ['sell', 'repair'] },
  { pincode: '226010', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Gomti Nagar, Vibhuti Khand, Patrakar Puram', services: ['sell', 'repair'] },
  { pincode: '226011', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'RDSO, Manak Nagar', services: ['sell', 'repair'] },
  { pincode: '226012', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Ashiyana, LDA Colony, Transport Nagar', services: ['sell', 'repair'] },
  { pincode: '226013', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Telibagh, Vrindavan Sector 1-5', services: ['sell', 'repair'] },
  { pincode: '226014', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Vrindavan Yojna, Raebareli Road, SGPGIMS', services: ['sell', 'repair'] },
  { pincode: '226015', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Bakshi Ka Talab (BKT)', services: ['sell', 'repair'] },
  { pincode: '226016', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Indira Nagar, Munshi Pulia, Polytechnic', services: ['sell', 'repair'] },
  { pincode: '226017', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Chinhat, Malhour, Deva Road', services: ['sell', 'repair'] },
  { pincode: '226018', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Vikas Nagar, Tedhi Pulia, Ring Road', services: ['sell', 'repair'] },
  { pincode: '226019', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Banthra, Kanpur Road', services: ['sell', 'repair'] },
  { pincode: '226020', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Aishbagh, Naka Hindola', services: ['sell', 'repair'] },
  { pincode: '226021', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Jankipuram, Jankipuram Extension, Kursi Road', services: ['sell', 'repair'] },
  { pincode: '226022', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Aliganj, Kapoorthala, Dandiya', services: ['sell', 'repair'] },
  { pincode: '226023', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Arjunganj, Sultanpur Road, Ahmamau', services: ['sell', 'repair'] },
  { pincode: '226024', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Madiaon, IIM Road, Faizullaganj', services: ['sell', 'repair'] },
  { pincode: '226025', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Kalyanpur, Ring Road', services: ['sell', 'repair'] },
  { pincode: '226026', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Dubagga, Hardoi Road, Para', services: ['sell', 'repair'] },
  { pincode: '226027', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Mohanlalganj, Kalli Pashchim', services: ['sell', 'repair'] },
  { pincode: '226028', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Kakori', services: ['sell', 'repair'] },
  { pincode: '226029', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Malihabad', services: ['sell', 'repair'] },
  { pincode: '226030', city: 'Lucknow', state: 'Uttar Pradesh', locality: 'Sushant Golf City, Shaheed Path, Lulu Mall area', services: ['sell', 'repair'] },
];

/**
 * Public endpoint to check if a specific pincode is serviceable
 * GET /api/pincodes/check?pincode=226001&service=sell
 */
router.get('/check', async (req, res) => {
  try {
    const rawPin = String(req.query.pincode || '').replace(/\D/g, '').slice(0, 6);
    const serviceType = String(req.query.service || 'sell').toLowerCase().trim();

    if (rawPin.length !== 6) {
      return res.json({
        serviceable: false,
        pincode: rawPin,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
    }

    // Auto-seed default Lucknow pincodes on first access if collection is completely empty
    const totalCount = await ServiceablePincode.countDocuments({});
    if (totalCount === 0) {
      await ServiceablePincode.insertMany(
        LUCKNOW_DEFAULT_PINCODES.map((item) => ({ ...item, is_active: true }))
      );
    }

    const doc = await ServiceablePincode.findOne({ pincode: rawPin, is_active: true });

    if (!doc) {
      return res.json({
        serviceable: false,
        pincode: rawPin,
        message: 'Doorstep service is currently not available at this pincode. We are rapidly expanding to new areas!',
      });
    }

    // Check if the requested service is enabled
    const supportedServices = Array.isArray(doc.services) && doc.services.length > 0 ? doc.services : ['sell', 'repair'];
    if (serviceType && !supportedServices.includes(serviceType)) {
      return res.json({
        serviceable: false,
        pincode: rawPin,
        message: 'Doorstep service is currently not available for this request in your area.',
      });
    }

    return res.json({
      serviceable: true,
      pincode: doc.pincode,
      city: doc.city,
      state: doc.state,
      locality: doc.locality,
      services: supportedServices,
      message: '✓ Doorstep service available in your area.',
    });
  } catch (error) {
    console.error('Pincode check error:', error);
    return res.status(500).json({
      serviceable: false,
      message: 'Service check temporarily unavailable. Please try again.',
    });
  }
});

/**
 * Admin: List all serviceable pincodes with search & filter
 * GET /api/pincodes
 */
router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const service = String(req.query.service || '').trim().toLowerCase();
    const status = String(req.query.status || '').trim().toLowerCase();

    // Auto-seed if empty
    const totalCount = await ServiceablePincode.countDocuments({});
    if (totalCount === 0) {
      await ServiceablePincode.insertMany(
        LUCKNOW_DEFAULT_PINCODES.map((item) => ({ ...item, is_active: true }))
      );
    }

    const query = {};
    if (search) {
      query.$or = [
        { pincode: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }
    if (service && service !== 'all') {
      query.services = service;
    }
    if (status === 'active') {
      query.is_active = true;
    } else if (status === 'inactive') {
      query.is_active = false;
    }

    const pincodes = await ServiceablePincode.find(query).sort({ pincode: 1 }).lean();
    const activeCount = await ServiceablePincode.countDocuments({ is_active: true });
    const total = await ServiceablePincode.countDocuments({});

    return res.json({
      data: pincodes,
      stats: {
        total,
        active: activeCount,
        inactive: total - activeCount,
      },
    });
  } catch (error) {
    console.error('Fetch pincodes error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Admin: Add single or bulk pincodes
 * POST /api/pincodes
 */
router.post('/', async (req, res) => {
  try {
    const {
      pincode,
      pincodes, // bulk raw string like "226001, 226002, 226003"
      city = 'Lucknow',
      state = 'Uttar Pradesh',
      locality = '',
      services = ['sell', 'repair'],
      is_active = true,
      notes = '',
    } = req.body;

    const rawList = [];
    if (typeof pincodes === 'string' && pincodes.trim()) {
      const extracted = pincodes.match(/\b\d{6}\b/g) || [];
      rawList.push(...extracted);
    }
    if (typeof pincode === 'string' && pincode.trim()) {
      const singleClean = pincode.replace(/\D/g, '').slice(0, 6);
      if (singleClean.length === 6) rawList.push(singleClean);
    }

    const uniquePins = Array.from(new Set(rawList));
    if (uniquePins.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid 6-digit PIN code.' });
    }

    const upsertPromises = uniquePins.map((pin) => {
      return ServiceablePincode.findOneAndUpdate(
        { pincode: pin },
        {
          $set: {
            city: city.trim() || 'Lucknow',
            state: state.trim() || 'Uttar Pradesh',
            locality: locality.trim(),
            services: Array.isArray(services) && services.length > 0 ? services : ['sell', 'repair'],
            is_active: is_active !== false,
            notes: notes.trim(),
            updated_at: new Date(),
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    });

    const results = await Promise.all(upsertPromises);
    return res.status(201).json({
      success: true,
      count: results.length,
      message: `Successfully configured ${results.length} serviceable pincode(s).`,
      data: results,
    });
  } catch (error) {
    console.error('Save pincodes error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Admin: Update a serviceable pincode by ID
 * PATCH /api/pincodes/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };
    delete updateData._id;

    const updated = await ServiceablePincode.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Pincode not found.' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update pincode error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Admin: Delete a serviceable pincode by ID
 * DELETE /api/pincodes/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ServiceablePincode.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Pincode not found.' });
    }

    return res.json({ success: true, message: `Pincode ${deleted.pincode} removed.` });
  } catch (error) {
    console.error('Delete pincode error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Admin: Reset / Seed Lucknow Default Pincodes
 * POST /api/pincodes/seed-lucknow
 */
router.post('/seed-lucknow', async (_req, res) => {
  try {
    const operations = LUCKNOW_DEFAULT_PINCODES.map((item) => ({
      updateOne: {
        filter: { pincode: item.pincode },
        update: {
          $set: {
            city: item.city,
            state: item.state,
            locality: item.locality,
            services: item.services,
            is_active: true,
            updated_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        upsert: true,
      },
    }));

    await ServiceablePincode.bulkWrite(operations);
    const count = await ServiceablePincode.countDocuments({ is_active: true });

    return res.json({
      success: true,
      message: `Successfully seeded ${LUCKNOW_DEFAULT_PINCODES.length} standard Lucknow hub pincodes.`,
      activeTotal: count,
    });
  } catch (error) {
    console.error('Seed lucknow pincodes error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

