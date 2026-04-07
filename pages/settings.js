import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import GoldButton from '../components/GoldButton';

export default function SettingsPage() {
  const [form, setForm] = useState({ subtitle: '', authorName: '', authorBio: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings').then(r => {
      if (r.status === 401) { router.push('/login'); return null; }
      return r.json();
    }).then(d => d && setForm(d));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setMsg('Saved!');
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <>
      <Head><title>FENNTEL Admin — Settings</title></Head>
      <AdminLayout title="Settings">
        <div className="max-w-lg space-y-4">
          {['subtitle', 'authorName', 'authorBio'].map(k => (
            <div key={k}>
              <label className="block text-xs uppercase tracking-widest text-white/40 font-mono mb-2">{k}</label>
              <input value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })}
                className="fenntel-input w-full px-4 py-3 rounded-sm text-sm" />
            </div>
          ))}
          {msg && <p className="text-gold text-sm">{msg}</p>}
          <GoldButton onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</GoldButton>
        </div>
      </AdminLayout>
    </>
  );
    }
