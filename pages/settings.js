import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import GoldButton from '../../components/GoldButton';

function Section({ title, children }) {
  return (
    <div className="glass-card rounded-sm p-6 mb-5">
      <div className="w-6 h-px bg-gold/40 mb-1" />
      <h3 className="font-display text-lg text-white/80 mb-5">{title}</h3>
      {children}
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [subtitle, setSubtitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(({ settings: s }) => {
        setSettings(s);
        setSubtitle(s.subtitle || '');
        setAuthorName(s.authorName || '');
        setAuthorBio(s.authorBio || '');
        setImagePreview(s.authorImage || null);
      });
  }, []);

  const handleImageFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('subtitle', subtitle);
    fd.append('authorName', authorName);
    fd.append('authorBio', authorBio);
    if (imageFile) fd.append('authorImage', imageFile);

    try {
      const res = await fetch('/api/settings', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Save failed');
      showToast('Settings saved successfully');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    if (newPw !== confirmPw) { showToast('Passwords do not match', 'error'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password changed successfully');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <>
      <Head><title>FENNTEL Admin — Settings</title></Head>
      <AdminLayout title="Settings">
        {/* Toast */}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-sm text-sm font-mono border ${
              toast.type === 'error'
                ? 'bg-red-900/80 text-red-200 border-red-700'
                : 'bg-obsidian text-gold border-gold/30'
            }`}>
            {toast.type === 'error' ? '⚠ ' : '✦ '}{toast.msg}
          </motion.div>
        )}

        <div className="max-w-2xl">
          {/* Homepage Content */}
          <Section title="Homepage Content">
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-white/40 font-mono mb-2">
                  Store Subtitle
                </label>
                <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                  rows={2} maxLength={300}
                  className="fenntel-input w-full px-4 py-3 rounded-sm text-sm resize-none" />
                <p className="text-white/20 text-xs font-mono mt-1">{subtitle.length}/300</p>
              </div>
            </div>
          </Section>

          {/* Author Profile */}
          <Section title="Author Profile">
            <div className="space-y-4">
              {/* Profile image */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-white/40 font-mono mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gold/20 relative flex-shrink-0 bg-charcoal">
                    {imagePreview && <Image src={imagePreview} alt="Profile" fill className="object-cover" />}
                  </div>
                  <button onClick={() => fileRef.current?.click()}
                    className="btn-outline px-4 py-2 rounded-sm text-xs font-mono tracking-widest uppercase">
                    Upload Photo
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-white/40 font-mono mb-2">Author Name</label>
                <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={100} className="fenntel-input w-full px-4 py-3 rounded-sm text-sm" />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-white/40 font-mono mb-2">Author Bio</label>
                <textarea value={authorBio} onChange={(e) => setAuthorBio(e.target.value)}
                  rows={4} maxLength={1000}
                  className="fenntel-input w-full px-4 py-3 rounded-sm text-sm resize-none" />
                <p className="text-white/20 text-xs font-mono mt-1">{authorBio.length}/1000</p>
              </div>
            </div>

            <GoldButton onClick={handleSaveGeneral} disabled={saving} className="mt-5">
              {saving ? 'Saving...' : 'Save Changes'}
            </GoldButton>
          </Section>

          {/* Change Password */}
          <Section title="Security — Change Password">
            <div className="space-y-4">
              {[
                { label: 'Current Password', val: currentPw, set: setCurrentPw },
                { label: 'New Password',     val: newPw,     set: setNewPw },
                { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs tracking-widest uppercase text-white/40 font-mono mb-2">{f.label}</label>
                  <input type="password" value={f.val} onChange={(e) => f.set(e.target.value)}
                    className="fenntel-input w-full px-4 py-3 rounded-sm text-sm" placeholder="••••••••" />
                </div>
              ))}
            </div>
            <GoldButton onClick={handleChangePassword} disabled={pwSaving} outline className="mt-5">
              {pwSaving ? 'Updating...' : 'Change Password'}
            </GoldButton>
          </Section>

          {/* Export */}
          <div className="glass-card rounded-sm p-6 border border-gold/10 mb-5">
            <h3 className="font-display text-lg text-white/70 mb-2">Data Export</h3>
            <p className="text-white/25 text-xs font-mono mb-4">
              Download all orders as a CSV file — opens in Excel or Google Sheets.
            </p>
            <a
              href="/api/orders/export"
              download
              className="inline-block px-5 py-2.5 border border-gold/30 text-gold/70 hover:text-gold hover:border-gold text-xs font-mono rounded-sm transition-all uppercase tracking-widest"
            >
              ↓ Export Orders CSV
            </a>
          </div>

          {/* Danger zone */}
          <div className="glass-card rounded-sm p-6 border border-red-900/20">
            <h3 className="font-display text-lg text-red-400/60 mb-2">Danger Zone</h3>
            <p className="text-white/25 text-xs font-mono mb-4">
              These actions are irreversible. Proceed with caution.
            </p>
            <p className="text-white/20 text-xs font-mono">Contact your database administrator to delete records.</p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
