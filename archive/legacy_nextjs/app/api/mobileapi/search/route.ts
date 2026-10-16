import { NextResponse } from 'next/server';
import { searchLocalPhones } from '../../../../lib/phonesData';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body.query || '';
    const apiKey = process.env.MOBILEAPI_KEY || process.env.MOBILE_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://mobileapi.dev/devices/autocomplete/?q=${encodeURIComponent(query)}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const items = data.data || data.results || data.phones || data;
          if (Array.isArray(items) && items.length > 0) {
            const mapped = items.map((item: any) => ({
              id: String(item.id || item.slug || item.name),
              brand: item.brand || item.manufacturer || 'Smartphone',
              model: item.model || item.name || item.full_name || 'Model',
              originalPrice: item.originalPrice || item.mrp || item.default_mrp || 49999,
              currentMarketPrice: item.currentMarketPrice || item.price || item.base_resale_value || 28000,
              image: item.image || item.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
              specs: item.specs || item.processor || 'Fast Octa-Core Processor • HD Display',
            }));
            return NextResponse.json({ phones: mapped });
          }
        }
      } catch (apiErr) {
        console.warn('MobileAPI external call error, switching to local fallback:', apiErr);
      }
    }

    // Fallback to local phones dataset
    const localResults = searchLocalPhones(query);
    return NextResponse.json({ phones: localResults });
  } catch (error: any) {
    console.error('Error in /api/mobileapi/search:', error);
    // Even on error, attempt local fallback
    try {
      const localResults = searchLocalPhones('');
      return NextResponse.json({ phones: localResults });
    } catch {
      return NextResponse.json(
        { error: 'Failed to search phones', phones: [] },
        { status: 500 }
      );
    }
  }
}
