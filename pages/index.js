import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import BuyModal from '../components/BuyModal';
import FloatingOrbs from '../components/FloatingOrbs';
import GoldButton from '../components/GoldButton';
import { trackEvent, getSessionId } from '../lib/session';
import connectDB from '../lib/mongodb';
import Product from '../models/Product';
import Settings, { getSetting } from '../models/Settings';

export async function getServerSideProps() {
  try {
    await connectDB();
    const [products, subtitle, authorName, authorBio, authorImage] = await Promise.all([
      Product.find({ active: true }).sort({ createdAt: -1 }).lean(),
      getSetting('subtitle', 'Welcome to Fenntel, where coffee, music, and books meet.'),
      getSetting('authorName', 'Yassine Lebah'),
      getSetting('authorBio', 'Author, thinker, and digital creator. Yassine Lebah writes at the intersection of psychology, philosophy, and personal mastery — distilling complex ideas into powerful, actionable books.'),
      getSetting('authorImage', '/author.jpg'),
    ]);

    return {
      props: {
        products: JSON.parse(JSON.stringify(products)),
        settings: {
          subtitle,
          authorName,
          authorBio,
          authorImage,
        },
      },
    };
  } catch {
    return { props: { products: [], settings: {} } };
  }
}

export default function Home({ products, settings }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const subtitle = settings.subtitle || 'Welcome to Fenntel, where coffee, music, and books meet.';
  const authorName = settings.authorName || 'Yassine Lebah';
  const authorBio = settings.authorBio || '';
  const authorImage = settings.authorImage || '/author.jpg';

  useEffect(() => {
    // Track pageview
    trackEvent('pageview');

    // Check payment status from URL
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment) {
      setPaymentStatus(payment);
      setTimeout(() => setPaymentStatus(null), 5000);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleProductClick = async (productId) => {
    // Track click
    trackEvent('product_click', { productId });
    await fetch('/api/products/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, sessionId: getSessionId() }),
    });

    // Fetch recommendations
    try {
      const res = await fetch(`/api/products/recommend?productId=${productId}&sessionId=${getSessionId()}`);
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch { /* silent */ }
  };

  const handleBuy = (product) => {
    trackEvent('buy_click', { productId: product._id });
    setSelectedProduct(product);
  };

  return (
    <>
      <Head>
        <title>FENNTEL — Premium Self-Help Books</title>
        <meta name="description" content={subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FloatingOrbs />

      {/* Payment Status Toast */}
      <AnimatePresence>
        {paymentStatus && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-sm text-sm font-mono tracking-wide ${
              paymentStatus === 'success'
                ? 'bg-gold text-ebony'
                : 'bg-red-900/80 text-red-200 border border-red-700'
            }`}
          >
            {paymentStatus === 'success'
              ? '✦ Payment successful — check your email!'
              : '⚠ Payment was not completed.'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative min-h-screen noise">
        {/* ── HEADER ────────────────────────────────────────────── */}
        <header className="relative z-10 text-center pt-20 pb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="text-gold/50 text-xs tracking-[0.3em] font-mono uppercase">Est. 2024</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
            </div>

            {/* Main title */}
            <h1 className="font-display text-7xl md:text-9xl font-light tracking-[0.15em] mb-4">
              <span className="gold-text">FENNTEL</span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white/40 text-base md:text-lg max-w-lg mx-auto font-light tracking-wide leading-relaxed mt-4"
            >
              {subtitle}
            </motion.p>

            {/* Decorative ornament */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex items-center justify-center gap-3 mt-10"
            >
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-gold/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-gold/40" />
            </motion.div>
          </motion.div>
        </header>

        {/* ── PRODUCTS GRID ──────────────────────────────────────── */}
        <main className="relative z-10 max-w-6xl mx-auto px-4 pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs tracking-[0.4em] uppercase text-gold/50 font-mono mb-3">Collection</p>
            <h2 className="font-display text-3xl text-white/80">The Library</h2>
          </motion.div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-white/20 font-display text-xl">
              The collection is being curated. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={i}
                  onBuy={handleBuy}
                  onTrackClick={handleProductClick}
                />
              ))}
            </div>
          )}

          {/* ── AI RECOMMENDATIONS ──────────────────────────────── */}
          <AnimatePresence>
            {recommendations.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-20"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
                  <p className="text-xs tracking-[0.3em] uppercase text-gold/50 font-mono">
                    You might also like
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-l from-gold/20 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((product, i) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={i}
                      onBuy={handleBuy}
                      onTrackClick={handleProductClick}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        {/* ── FOOTER / AUTHOR SECTION ─────────────────────────────── */}
        <footer className="relative z-10 border-t border-white/5 py-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Gold divider */}
            <div className="flex items-center gap-4 mb-16">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <div className="w-2 h-2 rotate-45 bg-gold/40" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Author image */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex-shrink-0"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border border-gold/30 gold-glow relative">
                  <Image
                    src={authorImage}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Ring decoration */}
                <div className="absolute -inset-3 rounded-full border border-gold/10 animate-pulse" />
              </motion.div>

              {/* Author info */}
              <div>
                <p className="text-xs tracking-[0.4em] uppercase text-gold/50 font-mono mb-2">About the Author</p>
                <h3 className="font-display text-3xl text-white mb-4">{authorName}</h3>
                <p className="text-white/40 leading-relaxed max-w-lg text-sm">{authorBio}</p>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/20 text-xs font-mono tracking-wide">
                © {new Date().getFullYear()} FENNTEL. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="/admin" className="text-white/20 text-xs hover:text-gold/50 transition-colors font-mono tracking-wide">
                  Admin
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <BuyModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
