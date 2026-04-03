import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FloatingOrbs from '../components/FloatingOrbs';

export default function Success() {
  return (
    <>
      <Head>
        <title>FENNTEL — Thank You!</title>
      </Head>
      <FloatingOrbs />
      <div className="min-h-screen flex items-center justify-center px-4 relative noise">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="glass-card rounded-sm max-w-lg w-full p-12 text-center gold-glow"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', damping: 12 }}
            className="text-6xl mb-6"
          >
            🎉
          </motion.div>

          {/* Gold line */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-gold to-gold-light mx-auto mb-8" />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-4xl text-white mb-4"
          >
            Thank you.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/50 text-base leading-relaxed mb-3"
          >
            Your purchase was successful.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/40 text-sm leading-relaxed mb-10"
          >
            Check your email — your download link is on its way.
            It expires in 24 hours, so don&apos;t wait too long.
          </motion.p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-white/5" />
            <div className="w-1 h-1 rotate-45 bg-gold/30" />
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Link
              href="/"
              className="text-gold/60 text-xs font-mono tracking-widest hover:text-gold transition-colors uppercase"
            >
              ← Back to store
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
