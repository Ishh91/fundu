export type PanIndiaLocation = {
  city: string;
  state: string;
  pincode: string;
  district?: string;
  displayLabel: string;
};

// Popular Indian Cities with Baseline Pincodes
export const PAN_INDIA_POPULAR_CITIES: PanIndiaLocation[] = [
  { city: 'New Delhi', state: 'Delhi', pincode: '110001', displayLabel: 'New Delhi (110001)' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001', displayLabel: 'Mumbai (400001)' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001', displayLabel: 'Bengaluru (560001)' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001', displayLabel: 'Hyderabad (500001)' },
  { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', displayLabel: 'Lucknow (226001)' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001', displayLabel: 'Pune (411001)' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001', displayLabel: 'Kolkata (700001)' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', displayLabel: 'Chennai (600001)' },
  { city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', displayLabel: 'Noida (201301)' },
  { city: 'Gurugram', state: 'Haryana', pincode: '122001', displayLabel: 'Gurugram (122001)' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', displayLabel: 'Ahmedabad (380001)' },
  { city: 'Jaipur', state: 'Rajasthan', pincode: '302001', displayLabel: 'Jaipur (302001)' },
  { city: 'Chandigarh', state: 'Punjab/Haryana', pincode: '160017', displayLabel: 'Chandigarh (160017)' },
  { city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001', displayLabel: 'Kanpur (208001)' },
  { city: 'Indore', state: 'Madhya Pradesh', pincode: '452001', displayLabel: 'Indore (452001)' },
  { city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001', displayLabel: 'Bhopal (462001)' },
  { city: 'Patna', state: 'Bihar', pincode: '800001', displayLabel: 'Patna (800001)' },
  { city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', displayLabel: 'Varanasi (221001)' },
  { city: 'Surat', state: 'Gujarat', pincode: '395001', displayLabel: 'Surat (395001)' },
  { city: 'Nagpur', state: 'Maharashtra', pincode: '440001', displayLabel: 'Nagpur (440001)' },
  { city: 'Kochi', state: 'Kerala', pincode: '682001', displayLabel: 'Kochi (682001)' },
  { city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', displayLabel: 'Coimbatore (641001)' },
  { city: 'Agra', state: 'Uttar Pradesh', pincode: '282001', displayLabel: 'Agra (282001)' },
  { city: 'Dehradun', state: 'Uttarakhand', pincode: '248001', displayLabel: 'Dehradun (248001)' },
];

// Curated Master Indian Towns & Cities List for 0ms Instant Search
const MASTER_INDIAN_LOCATIONS: PanIndiaLocation[] = [
  ...PAN_INDIA_POPULAR_CITIES,
  { city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201001', displayLabel: 'Ghaziabad (201001)' },
  { city: 'Faridabad', state: 'Haryana', pincode: '121001', displayLabel: 'Faridabad (121001)' },
  { city: 'Meerut', state: 'Uttar Pradesh', pincode: '250001', displayLabel: 'Meerut (250001)' },
  { city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211001', displayLabel: 'Prayagraj (Allahabad) (211001)' },
  { city: 'Bareilly', state: 'Uttar Pradesh', pincode: '243001', displayLabel: 'Bareilly (243001)' },
  { city: 'Aligarh', state: 'Uttar Pradesh', pincode: '202001', displayLabel: 'Aligarh (202001)' },
  { city: 'Moradabad', state: 'Uttar Pradesh', pincode: '244001', displayLabel: 'Moradabad (244001)' },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273001', displayLabel: 'Gorakhpur (273001)' },
  { city: 'Ludhiana', state: 'Punjab', pincode: '141001', displayLabel: 'Ludhiana (141001)' },
  { city: 'Amritsar', state: 'Punjab', pincode: '143001', displayLabel: 'Amritsar (143001)' },
  { city: 'Jalandhar', state: 'Punjab', pincode: '144001', displayLabel: 'Jalandhar (144001)' },
  { city: 'Ranchi', state: 'Jharkhand', pincode: '834001', displayLabel: 'Ranchi (834001)' },
  { city: 'Jamshedpur', state: 'Jharkhand', pincode: '831001', displayLabel: 'Jamshedpur (831001)' },
  { city: 'Dhanbad', state: 'Jharkhand', pincode: '826001', displayLabel: 'Dhanbad (826001)' },
  { city: 'Raipur', state: 'Chhattisgarh', pincode: '492001', displayLabel: 'Raipur (492001)' },
  { city: 'Bhilai', state: 'Chhattisgarh', pincode: '490001', displayLabel: 'Bhilai (490001)' },
  { city: 'Jabalpur', state: 'Madhya Pradesh', pincode: '482001', displayLabel: 'Jabalpur (482001)' },
  { city: 'Gwalior', state: 'Madhya Pradesh', pincode: '474001', displayLabel: 'Gwalior (474001)' },
  { city: 'Ujjain', state: 'Madhya Pradesh', pincode: '456001', displayLabel: 'Ujjain (456001)' },
  { city: 'Kota', state: 'Rajasthan', pincode: '324001', displayLabel: 'Kota (324001)' },
  { city: 'Jodhpur', state: 'Rajasthan', pincode: '342001', displayLabel: 'Jodhpur (342001)' },
  { city: 'Udaipur', state: 'Rajasthan', pincode: '313001', displayLabel: 'Udaipur (313001)' },
  { city: 'Bikaner', state: 'Rajasthan', pincode: '334001', displayLabel: 'Bikaner (334001)' },
  { city: 'Ajmer', state: 'Rajasthan', pincode: '305001', displayLabel: 'Ajmer (305001)' },
  { city: 'Vadodara', state: 'Gujarat', pincode: '390001', displayLabel: 'Vadodara (390001)' },
  { city: 'Rajkot', state: 'Gujarat', pincode: '360001', displayLabel: 'Rajkot (360001)' },
  { city: 'Bhavnagar', state: 'Gujarat', pincode: '364001', displayLabel: 'Bhavnagar (364001)' },
  { city: 'Nashik', state: 'Maharashtra', pincode: '422001', displayLabel: 'Nashik (422001)' },
  { city: 'Aurangabad (Chhatrapati Sambhajinagar)', state: 'Maharashtra', pincode: '431001', displayLabel: 'Aurangabad (431001)' },
  { city: 'Thane', state: 'Maharashtra', pincode: '400601', displayLabel: 'Thane (400601)' },
  { city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703', displayLabel: 'Navi Mumbai (400703)' },
  { city: 'Solapur', state: 'Maharashtra', pincode: '413001', displayLabel: 'Solapur (413001)' },
  { city: 'Kolhapur', state: 'Maharashtra', pincode: '416001', displayLabel: 'Kolhapur (416001)' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001', displayLabel: 'Visakhapatnam (530001)' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001', displayLabel: 'Vijayawada (520001)' },
  { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001', displayLabel: 'Guntur (522001)' },
  { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517501', displayLabel: 'Tirupati (517501)' },
  { city: 'Warangal', state: 'Telangana', pincode: '506001', displayLabel: 'Warangal (506001)' },
  { city: 'Madurai', state: 'Tamil Nadu', pincode: '625001', displayLabel: 'Madurai (625001)' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', pincode: '620001', displayLabel: 'Tiruchirappalli (Trichy) (620001)' },
  { city: 'Salem', state: 'Tamil Nadu', pincode: '636001', displayLabel: 'Salem (636001)' },
  { city: 'Thiruvananthapuram', state: 'Kerala', pincode: '695001', displayLabel: 'Thiruvananthapuram (Trivandrum) (695001)' },
  { city: 'Kozhikode', state: 'Kerala', pincode: '673001', displayLabel: 'Kozhikode (Calicut) (673001)' },
  { city: 'Mysuru', state: 'Karnataka', pincode: '570001', displayLabel: 'Mysuru (Mysore) (570001)' },
  { city: 'Hubballi', state: 'Karnataka', pincode: '580020', displayLabel: 'Hubballi-Dharwad (580020)' },
  { city: 'Mangaluru', state: 'Karnataka', pincode: '575001', displayLabel: 'Mangaluru (Mangalore) (575001)' },
  { city: 'Bhubaneswar', state: 'Odisha', pincode: '751001', displayLabel: 'Bhubaneswar (751001)' },
  { city: 'Cuttack', state: 'Odisha', pincode: '753001', displayLabel: 'Cuttack (753001)' },
  { city: 'Rourkela', state: 'Odisha', pincode: '769001', displayLabel: 'Rourkela (769001)' },
  { city: 'Guwahati', state: 'Assam', pincode: '781001', displayLabel: 'Guwahati (781001)' },
  { city: 'Siliguri', state: 'West Bengal', pincode: '734001', displayLabel: 'Siliguri (734001)' },
  { city: 'Asansol', state: 'West Bengal', pincode: '713301', displayLabel: 'Asansol (713301)' },
  { city: 'Durgapur', state: 'West Bengal', pincode: '713201', displayLabel: 'Durgapur (713201)' },
  { city: 'Srinagar', state: 'Jammu and Kashmir', pincode: '190001', displayLabel: 'Srinagar (190001)' },
  { city: 'Jammu', state: 'Jammu and Kashmir', pincode: '180001', displayLabel: 'Jammu (180001)' },
  { city: 'Shimla', state: 'Himachal Pradesh', pincode: '171001', displayLabel: 'Shimla (171001)' },
  { city: 'Haridwar', state: 'Uttarakhand', pincode: '249401', displayLabel: 'Haridwar (249401)' },
  { city: 'Roorkee', state: 'Uttarakhand', pincode: '247667', displayLabel: 'Roorkee (247667)' },
  { city: 'Haldwani', state: 'Uttarakhand', pincode: '263139', displayLabel: 'Haldwani (263139)' },
  { city: 'Rishikesh', state: 'Uttarakhand', pincode: '249201', displayLabel: 'Rishikesh (249201)' },
  { city: 'Muzaffarpur', state: 'Bihar', pincode: '842001', displayLabel: 'Muzaffarpur (842001)' },
  { city: 'Gaya', state: 'Bihar', pincode: '823001', displayLabel: 'Gaya (823001)' },
  { city: 'Bhagalpur', state: 'Bihar', pincode: '812001', displayLabel: 'Bhagalpur (812001)' },
];

const LOCAL_STORAGE_KEY = 'fundu_user_location';

/**
 * Searches Pan-India locations by 6-digit Pincode, City, Town, or District
 */
export async function searchPanIndiaLocations(query: string): Promise<PanIndiaLocation[]> {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return PAN_INDIA_POPULAR_CITIES;

  // 1. Check local catalog first (instant 0ms)
  const localMatches = MASTER_INDIAN_LOCATIONS.filter((loc) => {
    return (
      loc.pincode.startsWith(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.displayLabel.toLowerCase().includes(q)
    );
  });

  // If query is a 6-digit Pincode and not fully matched locally, query Postal Pincode API
  if (/^\d{6}$/.test(q)) {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${q}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice)) {
          const apiMatches: PanIndiaLocation[] = data[0].PostOffice.map((po: any) => ({
            city: po.Name || po.District,
            state: po.State,
            pincode: q,
            district: po.District,
            displayLabel: `${po.Name}, ${po.District} (${q})`,
          }));
          return [...apiMatches, ...localMatches];
        }
      }
    } catch {
      // Return local matches if offline
    }
  }

  // If query is text >= 3 letters and local matches are few, search Postal API for Towns/Post Offices
  if (localMatches.length < 3 && q.length >= 3 && !/^\d+$/.test(q)) {
    try {
      const response = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(q)}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice)) {
          const apiMatches: PanIndiaLocation[] = data[0].PostOffice.slice(0, 10).map((po: any) => ({
            city: po.Name,
            state: po.State,
            pincode: po.Pincode,
            district: po.District,
            displayLabel: `${po.Name}, ${po.District} (${po.Pincode})`,
          }));
          return [...localMatches, ...apiMatches];
        }
      }
    } catch {
      // Ignore
    }
  }

  return localMatches;
}

/**
 * Saves selected Pan-India location to LocalStorage
 */
export function savePanIndiaLocation(location: PanIndiaLocation) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(location));
    window.dispatchEvent(new CustomEvent('fundu_location_changed', { detail: location }));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Retrieves user's active Pan-India location with sensible default
 */
export function getPanIndiaLocation(): PanIndiaLocation {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.city && parsed.pincode) return parsed;
    }
  } catch {
    // Fall back
  }
  return {
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    displayLabel: 'New Delhi (110001)',
  };
}
