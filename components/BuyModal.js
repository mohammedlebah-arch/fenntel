import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GoldButton from './GoldButton';
import { getSessionId } from '../lib/session';

export default function BuyModal({ product, onClose }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'processing' | 'error'
  const [error, setError] = useState('');

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleProceed = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address to continue.');
      return;
    }

    setStep('processing');

    try {
      // 1. Create pending order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          customerEmail: email,
          sessionId: getSessionId(),
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const { orderId } = await orderRes.json();

      // 2. Initiate payment — get 2CO checkout URL
      const payRes = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!payRes.ok) {
        const data = await payRes.json();
        throw new Error(data.error || 'Payment initiation failed');
      }

      const { checkoutUrl } = await payRes.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message);
      setStep('error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-ebony/90 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative glass-card rounded-sm w-full max-w-md p-8 gold-glow"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/30 hover:text-gold transition-colors text-2xl leading-none"
          >
            ×
          </button>

          {/* Gold line accent */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-gold to-gold-light mb-6" />

          {step === 'email' && (
            <>
              <h2 className="font-display text-2xl text-white mb-1">Complete Your Order</h2>
              <p className="text-white/40 text-sm mb-2">
                You&apos;re purchasing:
              </p>
              <p className="font-display text-lg gold-text mb-6">{product.title}</p>

              <form onSubmit={handleProceed}>
                <div className="mb-5">
                  <label className="block text-xs tracking-widest uppercase text-white/50 mb-2 font-mono">
                    Email Address <span className="text-gold">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="your@email.com"
                    className="fenntel-input w-full px-4 py-3 rounded-sm text-sm"
                    required
                    autoFocus
                  />
                  {emailError && (
                    <p className="text-red-400 text-xs mt-2">{emailError}</p>
                  )}
                  <p className="text-white/25 text-xs mt-2">
                    Your email is required to receive your purchase.
                  </p>
                </div>

                <div className="flex items-center justify-between mb-6 pt-2 border-t border-white/5">
                  <span className="text-white/40 text-sm">Total</span>
                  <span className="font-display text-xl gold-text">
                    ${product.price?.toFixed(2)} {product.currency || 'USD'}
                  </span>
                </div>

                <GoldButton type="submit" className="w-full justify-center py-4">
                  Proceed to Payment
                </GoldButton>
              </form>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60 font-body">Redirecting to secure payment...</p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="font-display text-xl text-white mb-2">Something went wrong</h3>
              <p className="text-red-400 text-sm mb-6">{error}</p>
              <GoldButton onClick={() => setStep('email')} outline>
                Try Again
              </GoldButton>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
