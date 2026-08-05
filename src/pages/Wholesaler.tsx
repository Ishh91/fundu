import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone, Package, Plus, Edit2, Trash2, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Product, SparePart } from '../types';
import { PHONE_BRANDS } from '../types';
import { db, formatINR } from '../lib/db';

export default function Wholesaler() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'products' | 'spare-parts'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Product modal
  const [productModal, setProductModal] = useState<{ product: Product | null } | null>(null);
  const [productForm, setProductForm] = useState<{
    title: string;
    brand: string;
    model: string;
    ram: string;
    storage: string;
    color: string;
    condition: 'Excellent' | 'Good' | 'Fair';
    price: string;
    original_price: string;
    discount_percent: string;
    warranty_months: string;
    description: string;
    images: string;
    is_featured: boolean;
    stock: string;
  }>({
    title: '',
    brand: '',
    model: '',
    ram: '',
    storage: '',
    color: '',
    condition: 'Excellent',
    price: '',
    original_price: '',
    discount_percent: '0',
    warranty_months: '6',
    description: '',
    images: '',
    is_featured: false,
    stock: '0',
  });
  const [productSaving, setProductSaving] = useState(false);

  // Spare part modal
  const [partModal, setPartModal] = useState<{ part: SparePart | null } | null>(null);
  const [partForm, setPartForm] = useState({
    title: '',
    brand: '',
    category: '',
    compatible_models: '',
    price: '',
    original_price: '',
    stock: '0',
    description: '',
    images: '',
  });
  const [partSaving, setPartSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login?redirect=/wholesaler');
    if (!loading && user && profile && profile.role !== 'wholesaler' && profile.role !== 'admin') navigate('/dashboard');
  }, [loading, user, profile, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      db.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
      db.from('spare_parts').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
    ]).then(([p, sp]) => {
      setProducts((p.data as Product[]) ?? []);
      setSpareParts((sp.data as SparePart[]) ?? []);
      setDataLoading(false);
    });
  }, [user]);

  // Product functions
  const openProductModal = (product: Product | null) => {
    if (product) {
      setProductForm({
        title: product.title,
        brand: product.brand,
        model: product.model,
        ram: product.ram ?? '',
        storage: product.storage ?? '',
        color: product.color ?? '',
        condition: product.condition,
        price: String(product.price),
        original_price: product.original_price ? String(product.original_price) : '',
        discount_percent: String(product.discount_percent),
        warranty_months: String(product.warranty_months),
        description: product.description ?? '',
        images: product.images.join('\n'),
        is_featured: product.is_featured,
        stock: String(product.stock),
      });
    } else {
      setProductForm({
        title: '',
        brand: '',
        model: '',
        ram: '',
        storage: '',
        color: '',
        condition: 'Excellent',
        price: '',
        original_price: '',
        discount_percent: '0',
        warranty_months: '6',
        description: '',
        images: '',
        is_featured: false,
        stock: '0',
      });
    }
    setProductModal({ product });
  };

  const saveProduct = async () => {
    if (!user) return;
    setProductSaving(true);
    try {
      const productData = {
        title: productForm.title,
        brand: productForm.brand,
        model: productForm.model,
        ram: productForm.ram || null,
        storage: productForm.storage || null,
        color: productForm.color || null,
        condition: productForm.condition,
        price: Number(productForm.price),
        original_price: productForm.original_price ? Number(productForm.original_price) : null,
        discount_percent: Number(productForm.discount_percent),
        warranty_months: Number(productForm.warranty_months),
        description: productForm.description || null,
        images: productForm.images.split('\n').filter(Boolean),
        is_approved: false,
        is_featured: productForm.is_featured,
        stock: Number(productForm.stock),
        seller_id: user.id,
      };

      const product = productModal?.product;
      if (product) {
        const { data, error } = await db
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select('*')
          .single();
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === product.id ? data as Product : p));
      } else {
        const { data, error } = await db
          .from('products')
          .insert(productData)
          .select('*')
          .single();
        if (error) throw error;
        setProducts(prev => [data as Product, ...prev]);
      }
      setProductModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setProductSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await db.from('products').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Spare part functions
  const openPartModal = (part: SparePart | null) => {
    if (part) {
      setPartForm({
        title: part.title,
        brand: part.brand ?? '',
        category: part.category,
        compatible_models: part.compatible_models.join('\n'),
        price: String(part.price),
        original_price: part.original_price ? String(part.original_price) : '',
        stock: String(part.stock),
        description: part.description ?? '',
        images: part.images.join('\n'),
      });
    } else {
      setPartForm({
        title: '',
        brand: '',
        category: '',
        compatible_models: '',
        price: '',
        original_price: '',
        stock: '0',
        description: '',
        images: '',
      });
    }
    setPartModal({ part });
  };

  const savePart = async () => {
    if (!user) return;
    setPartSaving(true);
    try {
      const partData = {
        title: partForm.title,
        brand: partForm.brand || null,
        category: partForm.category,
        compatible_models: partForm.compatible_models.split('\n').filter(Boolean),
        price: Number(partForm.price),
        original_price: partForm.original_price ? Number(partForm.original_price) : null,
        stock: Number(partForm.stock),
        description: partForm.description || null,
        images: partForm.images.split('\n').filter(Boolean),
        is_approved: false,
        seller_id: user.id,
      };

      const part = partModal?.part;
      if (part) {
        const { data, error } = await db
          .from('spare_parts')
          .update(partData)
          .eq('id', part.id)
          .select('*')
          .single();
        if (error) throw error;
        setSpareParts(prev => prev.map(p => p.id === part.id ? data as SparePart : p));
      } else {
        const { data, error } = await db
          .from('spare_parts')
          .insert(partData)
          .select('*')
          .single();
        if (error) throw error;
        setSpareParts(prev => [data as SparePart, ...prev]);
      }
      setPartModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save spare part');
    } finally {
      setPartSaving(false);
    }
  };

  const deletePart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spare part?')) return;
    const { error } = await db.from('spare_parts').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setSpareParts(prev => prev.filter(p => p.id !== id));
  };

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-ink-500">Loading...</div>;
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-100 text-accent-700">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Wholesaler Dashboard</h1>
          <p className="text-sm text-ink-500">Manage your products and spare parts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-ink-100 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setTab('products')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'products' ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <Smartphone className="h-4 w-4" /> Products
        </button>
        <button
          onClick={() => setTab('spare-parts')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'spare-parts' ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <Package className="h-4 w-4" /> Spare Parts
        </button>
      </div>

      <div className="mt-6">
        {dataLoading ? (
          <div className="card p-12 text-center text-ink-500">Loading...</div>
        ) : tab === 'products' ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => openProductModal(null)} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
            {products.map((p) => (
              <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink-100 overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <Smartphone className="h-5 w-5 text-ink-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{p.title}</p>
                    <p className="text-xs text-ink-500">{formatINR(p.price)} · Stock: {p.stock}</p>
                    <span className={`badge mt-1 ${p.is_approved ? 'bg-nature-50 text-nature-700' : 'bg-trail-50 text-trail-500'}`}>
                      {p.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openProductModal(p)} className="btn-outline text-xs px-3 py-1.5">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm text-ink-500">No products yet. Add your first product!</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => openPartModal(null)} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Spare Part
              </button>
            </div>
            {spareParts.map((p) => (
              <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink-100 overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-ink-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{p.title}</p>
                    <p className="text-xs text-ink-500">{p.category} · {formatINR(p.price)} · Stock: {p.stock}</p>
                    <span className={`badge mt-1 ${p.is_approved ? 'bg-nature-50 text-nature-700' : 'bg-trail-50 text-trail-500'}`}>
                      {p.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openPartModal(p)} className="btn-outline text-xs px-3 py-1.5">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => deletePart(p.id)} className="btn-outline border-accent-300 text-xs px-3 py-1.5 text-accent-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            {spareParts.length === 0 && <p className="text-sm text-ink-500">No spare parts yet. Add your first spare part!</p>}
          </div>
        )}
      </div>

      {/* Product modal */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-brand-600" /> {productModal.product ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setProductModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Title</label>
                <input
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Apple iPhone 14 Pro Max"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Brand</label>
                <select
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="input mt-1"
                >
                  <option value="">Select Brand</option>
                  {PHONE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Model</label>
                <input
                  value={productForm.model}
                  onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                  placeholder="e.g. 14 Pro Max"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">RAM</label>
                <input
                  value={productForm.ram}
                  onChange={(e) => setProductForm({ ...productForm, ram: e.target.value })}
                  placeholder="e.g. 6GB"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Storage</label>
                <input
                  value={productForm.storage}
                  onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                  placeholder="e.g. 128GB"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Color</label>
                <input
                  value={productForm.color}
                  onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                  placeholder="e.g. Space Black"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Condition</label>
                <select
                  value={productForm.condition}
                  onChange={(e) => setProductForm({ ...productForm, condition: e.target.value as 'Excellent' | 'Good' | 'Fair' })}
                  className="input mt-1"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Price</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="e.g. 79999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Original Price</label>
                <input
                  type="number"
                  value={productForm.original_price}
                  onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                  placeholder="e.g. 99999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Discount (%)</label>
                <input
                  type="number"
                  value={productForm.discount_percent}
                  onChange={(e) => setProductForm({ ...productForm, discount_percent: e.target.value })}
                  placeholder="0"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Warranty (Months)</label>
                <input
                  type="number"
                  value={productForm.warranty_months}
                  onChange={(e) => setProductForm({ ...productForm, warranty_months: e.target.value })}
                  placeholder="6"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Stock</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  placeholder="0"
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-ink-700">Featured</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Images (one per line)</label>
                <textarea
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                  rows={3}
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setProductModal(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={saveProduct} disabled={productSaving} className="btn-primary text-sm">
                {productSaving ? 'Saving...' : (productModal.product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spare part modal */}
      {partModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-600" /> {partModal.part ? 'Edit Spare Part' : 'Add Spare Part'}
              </h3>
              <button onClick={() => setPartModal(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Title</label>
                <input
                  value={partForm.title}
                  onChange={(e) => setPartForm({ ...partForm, title: e.target.value })}
                  placeholder="e.g. iPhone 14 Battery"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Brand</label>
                <select
                  value={partForm.brand}
                  onChange={(e) => setPartForm({ ...partForm, brand: e.target.value })}
                  className="input mt-1"
                >
                  <option value="">Select Brand</option>
                  {PHONE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Category</label>
                <input
                  value={partForm.category}
                  onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                  placeholder="e.g. Battery, Screen, Camera"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Price</label>
                <input
                  type="number"
                  value={partForm.price}
                  onChange={(e) => setPartForm({ ...partForm, price: e.target.value })}
                  placeholder="e.g. 2999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Original Price</label>
                <input
                  type="number"
                  value={partForm.original_price}
                  onChange={(e) => setPartForm({ ...partForm, original_price: e.target.value })}
                  placeholder="e.g. 3999"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-700">Stock</label>
                <input
                  type="number"
                  value={partForm.stock}
                  onChange={(e) => setPartForm({ ...partForm, stock: e.target.value })}
                  placeholder="0"
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Compatible Models (one per line)</label>
                <textarea
                  value={partForm.compatible_models}
                  onChange={(e) => setPartForm({ ...partForm, compatible_models: e.target.value })}
                  placeholder="iPhone 14\niPhone 14 Pro"
                  rows={3}
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Description</label>
                <textarea
                  value={partForm.description}
                  onChange={(e) => setPartForm({ ...partForm, description: e.target.value })}
                  placeholder="Spare part description..."
                  rows={3}
                  className="input mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink-700">Images (one per line)</label>
                <textarea
                  value={partForm.images}
                  onChange={(e) => setPartForm({ ...partForm, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                  rows={3}
                  className="input mt-1"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setPartModal(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={savePart} disabled={partSaving} className="btn-primary text-sm">
                {partSaving ? 'Saving...' : (partModal.part ? 'Update Spare Part' : 'Add Spare Part')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
