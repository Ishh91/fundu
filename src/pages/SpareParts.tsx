import { useEffect, useMemo, useState } from 'react';
import { Search, Package, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { SparePart } from '../types';
import { db, formatINR } from '../lib/db';

const categories = ['All', 'Screens', 'Battery', 'Charging Ports', 'Back Glass', 'Camera', 'Speaker', 'Other'];

export default function SpareParts() {
  const { user } = useAuth();
  const { setCartItem } = useCart();
  const navigate = useNavigate();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    db
      .from('spare_parts')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setParts((data as SparePart[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.brand?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchCat = category === 'All' || p.category === category;
      return matchSearch && matchCat;
    });
  }, [parts, search, category]);

  return (
    <div className="container-page py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink-900">Spare Parts</h1>
          <p className="mt-2 text-ink-500">Genuine OEM-grade parts for DIYers and repair shops across Lucknow.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search parts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${category === c ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
          >{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card h-72 animate-pulse bg-ink-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-ink-300" />
          <p className="mt-4 font-semibold text-ink-700">No parts found</p>
          <p className="text-sm text-ink-500">Try a different search or category.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <div key={p.id} className="group card overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all duration-300">
              <div className="relative aspect-square overflow-hidden bg-ink-100">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="grid h-full place-items-center"><Package className="h-12 w-12 text-ink-300" /></div>
                )}
                <span className="absolute left-3 top-3 badge border border-ink-200 bg-ink-100/90 text-ink-700">{p.category}</span>
              </div>
              <div className="p-4">
                {p.brand && <p className="text-xs font-semibold text-brand-600">{p.brand}</p>}
                <h3 className="mt-0.5 font-display font-bold text-ink-900 line-clamp-2">{p.title}</h3>
                <p className="mt-1 text-xs text-ink-500 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <span className="font-display text-lg font-extrabold text-ink-900">{formatINR(p.price)}</span>
                    {p.original_price && <span className="ml-1.5 text-xs text-ink-400 line-through">{formatINR(p.original_price)}</span>}
                  </div>
                  <span className="text-xs text-ink-500">{p.stock} in stock</span>
                </div>
                <button
                  onClick={() => {
                    if (user) {
                      setCartItem({
                        type: 'spare_part',
                        item: p,
                        quantity: 1
                      });
                      navigate('/checkout');
                    } else {
                      navigate('/login?redirect=/spare-parts');
                    }
                  }}
                  className="mt-3 btn-outline w-full text-sm"
                >
                  <ShoppingCart className="h-4 w-4" /> Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="surface-panel mt-12 p-8">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Are you a repair shop or wholesaler?</h2>
            <p className="mt-2 text-ink-600">Get bulk pricing on genuine spare parts. Register as a wholesaler to unlock trade rates.</p>
          </div>
          <div className="flex gap-3 md:justify-end">
            <Link to="/register" className="btn border border-ink-200 bg-ink-100 px-5 py-3 text-ink-900 hover:bg-ink-200">Become a Wholesaler</Link>
            <Link to="/contact" className="btn border border-ink-200 bg-ink-200/40 px-5 py-3 text-ink-900 hover:bg-ink-200">Contact Sales</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
