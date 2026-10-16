import { NextResponse } from 'next/server';
import { getLocalPhoneById } from '../../../../../lib/phonesData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const apiKey = process.env.MOBILEAPI_KEY || process.env.MOBILE_API_KEY;

    if (apiKey && id) {
      try {
        const response = await fetch(`https://mobileapi.dev/devices/${id}/`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const item = data.data || data;
          if (item) {
            const mapped = {
              id: String(item.id || id),
              brand: item.brand || item.manufacturer || 'Smartphone',
              model: item.model || item.name || 'Model',
              originalPrice: item.originalPrice || item.mrp || item.default_mrp || 49999,
              currentMarketPrice: item.currentMarketPrice || item.price || item.base_resale_value || 28000,
              image: item.image || item.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
              specs: item.specs || item.processor || 'Fast Octa-Core Processor',
            };
            return NextResponse.json({ phone: mapped });
          }
        }
      } catch (apiErr) {
        console.warn('MobileAPI phone details error, falling back to local dataset:', apiErr);
      }
    }

    const localPhone = getLocalPhoneById(id);
    if (localPhone) {
      return NextResponse.json({ phone: localPhone });
    }

    return NextResponse.json(
      { error: 'Phone not found', phone: null },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error in /api/mobileapi/phone/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phone details', phone: null },
      { status: 500 }
    );
  }
}
