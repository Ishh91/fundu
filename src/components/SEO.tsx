import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type SEOProps = {
  title?: string;
  description?: string;
};

const ROUTE_SEO_MAP: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Fundu — Sell Old Phone for Instant Cash, Buy Refurbished & Doorstep Repair',
    description: 'Sell old smartphones for instant UPI/cash at your doorstep, buy certified refurbished iPhones & Galaxy phones with 6M warranty, and book 30-minute doorstep repair.',
  },
  '/sell': {
    title: 'Sell Old Phone for Instant Cash at your doorstep | Doorstep Pickup — Fundu',
    description: 'Get highest instant valuation for your old smartphone at your doorstep. Free doorstep pickup & spot cash/UPI payment across Gomti Nagar, Hazratganj, Indira Nagar & Aliganj.',
  },
  '/buy': {
    title: 'Buy Certified Refurbished Mobiles at your doorstep with 6M Warranty — Fundu',
    description: 'Buy 32-point quality inspected refurbished iPhones, Samsung Galaxy & OnePlus phones at your doorstep with 6 months warranty and doorstep delivery.',
  },
  '/repair': {
    title: '30-Minute Doorstep Doorstep Mobile Repair | Screen & Battery Replacement — Fundu',
    description: 'Book certified mobile repair at home/office at your doorstep. 30-minute screen & battery replacement with genuine parts & 6-month repair warranty.',
  },
  '/spare-parts': {
    title: 'Buy Genuine Mobile Spare Parts at your doorstep | Screens, Batteries, Cables — Fundu',
    description: 'OEM specification replacement screens, batteries, camera modules, and charging ports for iPhone, Samsung, OnePlus & Xiaomi at your doorstep.',
  },
  '/about': {
    title: 'About Fundu | Hyperlocal Refurbished & Doorstep Mobile Ecosystem',
    description: 'Learn about Fundu — Our trusted hyperlocal platform for selling old phones, buying audited refurbished mobiles, and doorstep repairs.',
  },
  '/contact': {
    title: 'Contact Fundu | Doorstep Support & Pickup Hubs',
    description: 'Contact Fundu customer support team, book doorstep pickup, or visit our Ashiyana, Gomti Nagar & Chowk trade hubs.',
  },
  '/partner': {
    title: 'Partner with Fundu | B2B Mobile Wholesalers & Retail Network',
    description: 'Join Fundu’s B2B wholesale partner program at your doorstep. Trade phone lots, manage vendor khata, and source certified refurbished inventory.',
  },
};

export default function SEO({ title, description }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const routeSeo = ROUTE_SEO_MAP[location.pathname] || {
      title: 'Fundu — Smart Choice Smart Price',
      description: 'Our trusted portal for selling old phones, buying certified refurbished smartphones, and 30-minute doorstep mobile repair.',
    };

    const finalTitle = title || routeSeo.title;
    const finalDescription = description || routeSeo.description;

    document.title = finalTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', finalDescription);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', finalDescription);

    // Geo Meta Tags for Doorstep Hyper-localization (26.8467, 80.9462)
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('geo.region', 'IN-UP');
    setMeta('geo.placename', 'Doorstep Service');
    setMeta('geo.position', '26.8467;80.9462');
    setMeta('ICBM', '26.8467, 80.9462');
  }, [location.pathname, title, description]);

  return null;
}
