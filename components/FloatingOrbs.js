import { motion } from 'framer-motion';

const orbs = [
  { size: 400, x: '-10%', y: '-5%', delay: 0, duration: 8, opacity: 0.06 },
  { size: 300, x: '75%', y: '60%', delay: 2, duration: 10, opacity: 0.04 },
  { size: 200, x: '45%', y: '15%', delay: 4, duration: 7, opacity: 0.05 },
  { size: 150, x: '85%', y: '10%', delay: 1, duration: 9, opacity: 0.03 },
];

export default function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle at 35% 35%, #E8C84A, #D4AF37, transparent 70%)`,
            opacity: orb.opacity,
            filter: 'blur(60px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
}
