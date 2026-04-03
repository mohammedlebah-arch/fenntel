import { motion } from 'framer-motion';
import Image from 'next/image';
import GoldButton from './GoldButton';

export default function ProductCard({ product, onBuy, onTrackClick, index = 0 }) {
  const handleBuyClick = () => {
    onTrackClick && onTrackClick(product._id);
    onBuy && onBuy(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="glass-card rounded-sm overflow-hidden group relative"
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-shimmer" />
      </div>

      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
        <Image
          src={product.image || '/placeholder-book.jpg'}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ebony/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-xs tracking-widest text-gold/60 uppercase mb-2 font-mono">
          {product.category || 'Ebook'}
        </p>
        <h3 className="font-display text-xl text-white/90 mb-3 leading-snug">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-sm text-white/40 mb-4 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price + Button */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-display font-semibold gold-text">
              ${product.price?.toFixed(2)}
            </span>
            <span className="text-xs text-white/30 ml-1">{product.currency || 'USD'}</span>
          </div>
          <GoldButton onClick={handleBuyClick} className="text-xs px-5 py-2.5">
            Buy Now
          </GoldButton>
        </div>
      </div>
    </motion.div>
  );
}
