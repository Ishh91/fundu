import { mobileApiRequest, getCachedValue, setCachedValue } from '../utils/mobileApi.js';
import { MasterPhone } from '../models/MasterPhone.js';

/**
 * Intelligent Smartphone Studio Image Resolver
 * Primary (Option A): MobileAPI.dev
 * Backup  (Option B): RapidAPI - GSM Arena Specs API
 * Fallback: Verified Studio Family Renders
 */
export async function resolveDeviceImage(brand, model) {
  if (!brand || !model) return null;
  const cleanBrand = String(brand).trim();
  const cleanModel = String(model).trim();
  const cacheKey = `device_img:${cleanBrand.toLowerCase()}:${cleanModel.toLowerCase()}`;

  // 1. Check in-memory cache
  const memCached = getCachedValue(cacheKey, 1000 * 60 * 60 * 24 * 7); // 7 days
  if (memCached) {
    return { imageUrl: memCached, source: 'memory_cache' };
  }

  // 2. Check Database cache (MasterPhone) if DB is connected
  try {
    if (MasterPhone.db && MasterPhone.db.readyState === 1) {
      const dbPhone = await MasterPhone.findOne({
        brand: new RegExp(`^${cleanBrand}$`, 'i'),
        model: new RegExp(`^${cleanModel}$`, 'i'),
        image_url: { $exists: true, $ne: null, $ne: '' }
      });
      const bLow = cleanBrand.toLowerCase();
      const u = String(dbPhone?.image_url || '').toLowerCase();
      let isMismatch = false;
      if (bLow.includes('apple')) {
        isMismatch = ['samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'].some((t) => u.includes(t));
      } else if (bLow.includes('samsung')) {
        isMismatch = ['apple-iphone', 'apple-', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'].some((t) => u.includes(t));
      } else if (bLow.includes('oneplus')) {
        isMismatch = ['apple-iphone', 'apple-', 'samsung', 'galaxy', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'].some((t) => u.includes(t));
      } else if (bLow.includes('oppo')) {
        isMismatch = ['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'vivo', 'iqoo', 'motorola', 'moto', 'pixel'].some((t) => u.includes(t));
      } else if (bLow.includes('realme')) {
        isMismatch = ['apple-iphone', 'apple-', 'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'vivo', 'iqoo', 'oppo', 'motorola', 'moto', 'pixel'].some((t) => u.includes(t));
      }
      if (dbPhone && dbPhone.image_url && !dbPhone.image_url.includes('unsplash.com') && !isMismatch) {
        setCachedValue(cacheKey, dbPhone.image_url);
        return { imageUrl: dbPhone.image_url, source: 'db_cache' };
      }
    }
  } catch (err) {
    console.warn('[resolveDeviceImage] DB cache lookup error:', err.message);
  }

  // 3. Option A (Primary): MobileAPI.dev
  try {
    let queryTerm = cleanModel;
    if (!cleanModel.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
      queryTerm = `${cleanBrand} ${cleanModel}`;
    }

    const payload = await mobileApiRequest('/devices/autocomplete/', {
      q: queryTerm,
      limit: 10,
    });

    const results = Array.isArray(payload) ? payload : (payload?.value || []);
    if (results.length > 0) {
      const brandLower = cleanBrand.toLowerCase();
      const brandMatchedResults = results.filter((r) => {
        const cand = `${r.manufacturer || ''} ${r.brand || ''} ${r.full_name || ''} ${r.name || ''}`.toLowerCase();
        if (brandLower === 'apple') return cand.includes('apple') || cand.includes('iphone');
        if (brandLower === 'samsung') return cand.includes('samsung') || cand.includes('galaxy');
        if (brandLower === 'oneplus') return cand.includes('oneplus') && !cand.includes('iqoo') && !cand.includes('vivo');
        if (brandLower === 'oppo') return cand.includes('oppo') && !cand.includes('vivo') && !cand.includes('oneplus');
        if (brandLower === 'realme') return cand.includes('realme');
        if (brandLower === 'vivo') return cand.includes('vivo') && !cand.includes('oneplus') && !cand.includes('oppo');
        if (brandLower === 'iqoo') return cand.includes('iqoo');
        if (brandLower === 'xiaomi' || brandLower === 'redmi' || brandLower === 'poco') {
          return cand.includes('xiaomi') || cand.includes('redmi') || cand.includes('poco');
        }
        return cand.includes(brandLower);
      });

      const candidateList = brandMatchedResults.length > 0 ? brandMatchedResults : [];
      if (candidateList.length > 0) {
        const modelLower = cleanModel.toLowerCase();
        let best = candidateList.find(r => 
          (r.name && r.name.toLowerCase() === modelLower) || 
          (r.full_name && r.full_name.toLowerCase().includes(modelLower))
        );
        if (!best) best = candidateList[0];

      if (best && best.id) {
        const thumbUrl = `https://api.mobileapi.dev/devices/${best.id}/thumb.png`;
        setCachedValue(cacheKey, thumbUrl);

        // Update database in background for permanent persistence (only if admin hasn't set a custom image)
        MasterPhone.updateOne(
          { 
            brand: new RegExp(`^${cleanBrand}$`, 'i'), 
            model: new RegExp(`^${cleanModel}$`, 'i'),
            custom_image: { $ne: true }
          },
          { $set: { image_url: thumbUrl } }
        ).catch(() => {});

        return { 
          imageUrl: thumbUrl, 
          source: 'option_a_mobileapi', 
          deviceId: best.id, 
          title: best.full_name || best.name 
        };
      }
    }
  } catch (err) {
    console.warn('[resolveDeviceImage] Option A (MobileAPI) failed:', err.message);
  }

  // 4. Option B (Backup): RapidAPI GSM Arena Specs API
  try {
    const rapidKey = process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY || process.env.VITE_RAPIDAPI_KEY;
    if (rapidKey) {
      const searchRes = await fetch(`https://gsmarena4.p.rapidapi.com/search/${encodeURIComponent(cleanBrand + ' ' + cleanModel)}`, {
        headers: {
          'x-rapidapi-key': rapidKey,
          'x-rapidapi-host': 'gsmarena4.p.rapidapi.com'
        }
      });
      if (searchRes.ok) {
        const gsmData = await searchRes.json();
        const firstMatch = gsmData?.data?.[0];
        if (firstMatch && firstMatch.image) {
          const gsmImg = firstMatch.image;
          setCachedValue(cacheKey, gsmImg);
          MasterPhone.updateOne(
            { 
              brand: new RegExp(`^${cleanBrand}$`, 'i'), 
              model: new RegExp(`^${cleanModel}$`, 'i'),
              custom_image: { $ne: true }
            },
            { $set: { image_url: gsmImg } }
          ).catch(() => {});
          return { 
            imageUrl: gsmImg, 
            source: 'option_b_rapidapi_gsmarena', 
            title: firstMatch.name 
          };
        }
      }
    }
  } catch (err) {
    console.warn('[resolveDeviceImage] Option B (RapidAPI) failed:', err.message);
  }

  // 5. Fallback: Clean Verified Brand/Family Renders
  return null;
}
