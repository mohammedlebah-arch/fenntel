import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import GoldButton from '../components/GoldButton';

const EMPTY = { title: '', description: '', price: '', category: 'Ebook', active: true, image: null };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | product-object
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const fileRef = useRef();

  const fetchProducts = () =>
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.products || []));

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setForm(EMPTY);
    setImageFile(null);
    setPreview(null);
    setError('');
    setModal('add');
  };

  const openEdit = (product) => {
    setForm({ title: product.title, description: product.description || '', price: product.price, category: product.category || 'Ebook', active: product.active });
    setImageFile(null);
    setPreview(product.image);
    setError('');
    setModal(product);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) { setError('Valid price required'); return; }

    setSaving(true);
    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('price', form.price);
    fd.append('category', form.category);
    fd.append('active', form.active);
    if (imageFile) fd.append('image', imageFile);

    try {
      const isEdit = modal !== 'add';
      const res = await fetch(isEdit ? `/api/products/${modal._id}` : '/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      await fetchProducts();
      setModal(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    await fetchProducts();
    setDeleting(null);
  };

  return (
    <>
      <Head><title>FENNTEL Admin — Products</title></Head>
      <AdminLayout title="Products">
        <div className="flex justify-between items-center mb-6">
          <p className="text-white/30 text-sm font-mono">{products.length} product{products.length !== 1 ? 's' : ''}</p>
          <GoldButton onClick={openAdd} className="text-xs px-5 py-2.5">+ Add Product</GoldButton>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <motion.div key={p._id} layout className="glass-card rounded-sm overflow-hidden">
              <div className="relative aspect-[4/3] bg-charcoal">
                <Image src={p.image || '/placeholder-book.jpg'} alt={p.title} fill className="object-cover" />
                <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-mono rounded-sm ${p.active ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/40'}`}>
                  {p.active ? 'Active' : 'Hidden'}
                </div>
              </div>
              <div className="p-4">
                <p className="text-white/80 font-display text-lg leading-snug mb-1">{p.title}</p>
                <p className="gold-text font-display text-xl mb-3">${p.price?.toFixed(2)}</p>
                <div className="flex items-center gap-2 text-white/30 text-xs font-mono mb-4">
                  <span>{p.clickCount || 0} clicks</span>
                  <span>·</span>
                  <span>{p.salesCount || 0} sales</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 py-2 text-xs font-mono tracking-wide border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 rounded-sm transition-all">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id}
                    className="flex-1 py-2 text-xs font-mono tracking-wide border border-red-900/30 text-red-400/40 hover:text-red-400 hover:border-red-900/60 rounded-sm transition-all disabled:opacity-30">
                    {deleting === p._id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <div className="col-span-3 text-center py-20 text-white/20 font-display text-xl">No products yet</div>
          )}
        </div>

        {/* Add / Edit Modal */}
        <AnimatePresence>
          {modal !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ebony/90 backdrop-blur-sm"
              onClick={(e) => e.target === e.currentTarget && setModal(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="glass-card rounded-sm w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto gold-glow">
                <div className="w-8 h-px bg-gold/50 mb-5" />
                <h2 className="font-display text-2xl text-white mb-6">
                  {modal === 'add' ? 'Add Product' : 'Edit Product'}
                </h2>

                <div className="space-y-4">
                  {/* Image upload */}
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-white/40 font-mono mb-2">Cover Image</label>
                    <div onClick={() => fileRef.current?.click()}
                      className="border border-dashed border-white/10 rounded-sm h-36 flex items-center justify-center cursor-pointer hover:border-gold/30 transition-colors relative overflow-hidden">
                      {preview ? (
                        <Image src={preview} alt="preview" fill className="object-cover opacity-60" />
                      ) : (
                        <p className="text-white/20 text-xs font-mono">Click to upload</p>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </div>

                  {[
                    { key: 'title', label: 'Title', type: 'text', max: 200 },
                    { key: 'price', label: 'Price (USD)', type: 'number', step: '0.01', min: '0' },
                    { key: 'category', label: 'Category', type: 'text', max: 100 },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs tracking-widest uppercase text-white/40 font-mono mb-2">{f.label}</label>
                      <input type={f.type} step={f.step} min={f.min}
                        value={form[f.key]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="fenntel-input w-full px-4 py-3 rounded-sm text-sm"
                        maxLength={f.max}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs tracking-widest uppercase text-white/40 font-mono mb-2">Description</label>
                    <textarea value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3} maxLength={2000}
                      className="fenntel-input w-full px-4 py-3 rounded-sm text-sm resize-none" />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-gold' : 'bg-white/10'}`}
                      onClick={() => setForm({ ...form, active: !form.active })}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-ebony transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-white/50 text-xs font-mono tracking-wide">Active (visible on store)</span>
                  </label>
                </div>

                {error && <p className="text-red-400 text-xs font-mono mt-4">{error}</p>}

                <div className="flex gap-3 mt-6">
                  <GoldButton onClick={handleSave} disabled={saving} className="flex-1 justify-center">
                    {saving ? 'Saving...' : 'Save Product'}
                  </GoldButton>
                  <button onClick={() => setModal(null)}
                    className="btn-outline px-5 py-3 rounded-sm text-xs tracking-widest uppercase font-semibold">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminLayout>
    </>
  );
}
