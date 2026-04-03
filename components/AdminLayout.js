import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
  { label: 'Analytics', page: 'dashboard', icon: '◈' },
  { label: 'Products',  page: 'products',  icon: '◉' },
  { label: 'Orders',    page: 'orders',    icon: '◎' },
  { label: 'Settings',  page: 'settings',  icon: '◌' },
];

export default function AdminLayout({ children, title = 'Dashboard', secretPath = '' }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Resolve base path: use prop, or extract from route, or fallback
  const base = secretPath || router.query.adminPath || 'xpanel';

  // Verify session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => { if (!r.ok) router.replace(`/${base}/login`); })
      .catch(() => router.replace(`/${base}/login`));
  }, [base, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${base}/login`);
  };

  return (
    <div className="min-h-screen bg-ebony flex font-body">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-obsidian border-r border-white/5
        z-30 flex flex-col transform transition-transform duration-300
        md:translate-x-0 md:static md:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-6 py-8 border-b border-white/5">
          <Link href="/" className="block">
            <h1 className="font-display text-2xl gold-text tracking-widest">FENNTEL</h1>
            <p className="text-white/20 text-xs font-mono mt-1 tracking-widest">CONTROL PANEL</p>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV.map((item) => {
            const href = `/${base}/${item.page}`;
            const active = router.pathname.includes(item.page);
            return (
              <Link
                key={item.page}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-sm text-sm
                  transition-all duration-200 group
                  ${active
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'}
                `}
              >
                <span className={`text-base ${active ? 'text-gold' : 'text-white/30 group-hover:text-white/50'}`}>
                  {item.icon}
                </span>
                <span className="tracking-wider">{item.label}</span>
                {active && <div className="ml-auto w-1 h-1 rounded-full bg-gold" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm text-white/30 hover:text-red-400 hover:bg-red-950/30 transition-all duration-200"
          >
            <span>⊗</span>
            <span className="tracking-wider">{loggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-obsidian/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white/40 hover:text-white transition-colors"
            >☰</button>
            <h2 className="font-display text-xl text-white/80">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white/25 text-xs font-mono tracking-widest">SECURE</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
