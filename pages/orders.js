import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';

const STATUS_COLORS = {
  completed: 'text-gold bg-gold/10 border-gold/20',
  pending:   'text-yellow-400 bg-yellow-900/20 border-yellow-800/30',
  failed:    'text-red-400 bg-red-900/20 border-red-800/30',
  refunded:  'text-white/40 bg-white/5 border-white/10',
};

export default function Orders() {
  const [data, setData] = useState({ orders: [], total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders?page=${page}&limit=20`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = filter === 'all'
    ? data.orders
    : data.orders.filter((o) => o.status === filter);

  return (
    <>
      <Head><title>FENNTEL Admin — Orders</title></Head>
      <AdminLayout title="Orders">
        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'completed', 'pending', 'failed', 'refunded'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 text-xs font-mono tracking-widest uppercase rounded-sm border transition-all ${
                filter === s ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/10 text-white/30 hover:border-white/20'
              }`}>
              {s}
            </button>
          ))}
          <span className="ml-auto text-white/20 text-xs font-mono self-center">
            {data.total} total orders
          </span>
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/25 text-xs uppercase tracking-widest font-mono">
                  <th className="text-left p-4">Customer Email</th>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Country</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/3">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-white/20 font-display text-lg">No orders found</td></tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order._id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                      <td className="p-4 font-mono text-xs text-white/60">{order.customerEmail}</td>
                      <td className="p-4 text-white/70">
                        {order.product?.title || order.productSnapshot?.title || '—'}
                      </td>
                      <td className="p-4 text-gold font-display">
                        ${order.productSnapshot?.price?.toFixed(2) || '—'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-mono border rounded-sm ${STATUS_COLORS[order.status] || 'text-white/30'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-white/30 font-mono text-xs">{order.customerCountry || '—'}</td>
                      <td className="p-4 text-white/25 font-mono text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        {data.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs font-mono rounded-sm border transition-all ${
                  page === p ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/10 text-white/30 hover:border-white/25'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
}
