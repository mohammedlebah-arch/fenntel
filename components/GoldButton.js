import { burstParticles } from '../lib/particles';

export default function GoldButton({ children, onClick, className = '', type = 'button', disabled = false, outline = false }) {
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    burstParticles(x, y, 18);
    onClick && onClick(e);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`
        px-6 py-3 rounded-sm text-sm tracking-widest uppercase font-semibold
        transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
        ${outline ? 'btn-outline' : 'btn-gold'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
