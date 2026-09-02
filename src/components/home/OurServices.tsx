import { Link } from 'react-router-dom';
import { Smartphone, ShoppingCart, Wrench, RefreshCw } from 'lucide-react';

const FUNDU_SERVICES = [
  {
    title: 'Sell Phone',
    subtitle: 'Instant Spot Cash',
    href: '/sell',
    icon: Smartphone,
    color: 'bg-teal-50 text-[#00a896] border-teal-200',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&auto=format&fit=crop&q=80',
  },
  {
    title: 'Buy Refurbished',
    subtitle: '6-Month Warranty',
    href: '/buy',
    icon: ShoppingCart,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80',
  },
  {
    title: 'Doorstep Repair',
    subtitle: '30-Min Screen & Battery',
    href: '/repair',
    icon: Wrench,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80',
  },
  {
    title: 'Exchange Phone',
    subtitle: 'Trade-in Upgrade',
    href: '/sell',
    icon: RefreshCw,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=150&auto=format&fit=crop&q=80',
  },
];

export default function OurServices() {
  return (
    <section className="py-4">
      <div className="container-page space-y-4">
        <h2 className="font-display font-extrabold text-xl text-gray-900">Our Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {FUNDU_SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                to={s.href}
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-[#00a896] hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#eef8f7] border border-teal-100 p-2 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-contain drop-shadow-xs rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <span className="mt-3 text-sm font-extrabold text-gray-900 group-hover:text-[#00a896] transition-colors">
                  {s.title}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 mt-0.5">
                  {s.subtitle}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
