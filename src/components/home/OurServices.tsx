import { Link } from 'react-router-dom';
import { Smartphone, ShoppingCart, Wrench, RefreshCw } from 'lucide-react';

const FUNDU_SERVICES = [
  {
    title: 'Sell Phone',
    subtitle: 'Instant Spot Cash',
    href: '/sell',
    icon: Smartphone,
    color: 'bg-[#6A859F]/15 text-[#344257] border-[#6A859F]/30',
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
        <h2 className="font-display font-black text-xl text-[#344257]">Our Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {FUNDU_SERVICES.map((s) => {
            return (
              <Link
                key={s.title}
                to={s.href}
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-[#D9DFE9] border border-[#C0C8D8] shadow-[0_6px_20px_rgba(52,66,87,0.12)] hover:shadow-[0_12px_28px_rgba(52,66,87,0.18)] hover:-translate-y-1 hover:border-[#6A859F] transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#C0C8D8] p-2 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
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
                <span className="mt-3 text-sm font-black text-[#344257] group-hover:text-[#1E2734] transition-colors">
                  {s.title}
                </span>
                <span className="text-[11px] font-bold text-[#47576E] mt-0.5">
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
