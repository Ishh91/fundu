import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type SEOProps = {
  title?: string;
  description?: string;
};

const ROUTE_SEO_MAP: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Fundu Lucknow — Sell Old Phone for Instant Cash, Buy Refurbished & Doorstep Repair',
    description: 'Sell old smartphones for instant UPI/cash in Lucknow, buy certified refurbished iPhones & Galaxy phones with 6M warranty, and book 30-minute doorstep repair.',
  },
  '/sell': {
    title: 'Sell Old Phone for Instant Cash in Lucknow | Doorstep Pickup — Fundu',
    description: 'Get highest instant valuation for your old smartphone in Lucknow. Free doorstep pickup & spot cash/UPI payment across Gomti Nagar, Hazratganj, Indira Nagar & Aliganj.',
  },
  '/buy': {
    title: 'Buy Certified Refurbished Mobiles in Lucknow with 6M Warranty — Fundu',
    description: 'Buy 32-point quality inspected refurbished iPhones, Samsung Galaxy & OnePlus phones in Lucknow with 6 months warranty and doorstep delivery.',
  },
  '/repair': {
    title: '30-Minute Doorstep Mobile Repair in Lucknow | Screen & Battery Replacement — Fundu',
    description: 'Book certified mobile repair at home/office in Lucknow. 30-minute screen & battery replacement with genuine parts & 6-month repair warranty.',
  },
  '/spare-parts': {
    title: 'Buy Genuine Mobile Spare Parts in Lucknow | Screens, Batteries, Cables — Fundu',
    description: 'OEM specification replacement screens, batteries, camera modules, and charging ports for iPhone, Samsung, OnePlus & Xiaomi in Lucknow.',
  },
  '/about': {
    title: 'About Fundu Lucknow | Hyperlocal Refurbished & Doorstep Mobile Ecosystem',
    description: 'Learn about Fundu Lucknow — Lucknow’s trusted hyperlocal platform for selling old phones, buying audited refurbished mobiles, and doorstep repairs.',
  },
  '/contact': {
    title: 'Contact Fundu Lucknow | Doorstep Support & Pickup Hubs',
    description: 'Contact Fundu Lucknow customer support team, book doorstep pickup, or visit our Ashiyana, Gomti Nagar & Chowk trade hubs.',
  },
  '/partner': {
    title: 'Partner with Fundu Lucknow | B2B Mobile Wholesalers & Retail Network',
    description: 'Join Fundu’s B2B wholesale partner program in Lucknow. Trade phone lots, manage vendor khata, and source certified refurbished inventory.',
  },
};

export default function SEO({ title, description }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const routeSeo = ROUTE_SEO_MAP[location.pathname] || {
      title: 'Fundu Lucknow — Smart Choice Smart Price',
      description: 'Lucknow’s trusted portal for selling old phones, buying certified refurbished smartphones, and 30-minute doorstep mobile repair.',
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
  }, [location.pathname, title, description]);

  return null;
}
