import { NextResponse } from 'next/server';
import { getLocalPhonesByBrand } from '../../../../../lib/phonesData';

export async function GET(
  request: Request,
  { params }: { params: { brand: string } }
) {
  try {
    const brand = params.brand;
    const apiKey = process.env.MOBILEAPI_KEY || process.env.MOBILE_API_KEY;

    if (apiKey && brand) {
      try {
        const response = await fetch(
          `https://mobileapi.dev/devices/?brand=${encodeURIComponent(brand)}`,
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
              brand: item.brand || brand,
              model: item.model || item.name || 'Model',
              originalPrice: item.originalPrice || item.mrp || item.default_mrp || 49999,
              currentMarketPrice: item.currentMarketPrice || item.price || item.base_resale_value || 28000,
              image: item.image || item.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
              specs: item.specs || item.processor || 'High-performance Mobile Chipset',
            }));
            return NextResponse.json({ phones: mapped });
          }
        }
      } catch (apiErr) {
        console.warn('MobileAPI brand devices error, falling back to local dataset:', apiErr);
      }
    }

    const localPhones = getLocalPhonesByBrand(brand);
    return NextResponse.json({ phones: localPhones });
  } catch (error: any) {
    console.error('Error in /api/mobileapi/brand/[brand]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand phones', phones: [] },
      { status: 500 }
    );
  }
}
