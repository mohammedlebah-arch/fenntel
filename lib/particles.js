/**
 * Silver/white bubble particle burst animation
 * Called on button clicks throughout the site
 */
export function burstParticles(originX, originY, count = 20) {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    const size = 3 + Math.random() * 8;
    const hue = Math.random() > 0.5 ? '#D4AF37' : '#E8E8E8'; // gold or silver

    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size,
      color: hue,
      alpha: 1,
      gravity: 0.15 + Math.random() * 0.1,
    };
  });

  let frame;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    particles.forEach((p) => {
      if (p.alpha <= 0) return;
      alive = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= 0.022;
      p.size *= 0.98;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI * 2);

      // Gradient bubble effect
      const grad = ctx.createRadialGradient(
        p.x - p.size * 0.3, p.y - p.size * 0.3, 0,
        p.x, p.y, p.size
      );
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.4, p.color);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });

    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frame);
    }
  };

  animate();
}
