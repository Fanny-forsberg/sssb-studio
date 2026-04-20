// Confetti effect for SSSB Studio
function launchConfetti(options = {}) {
  const {
    duration = 2500,
    particleCount = 80,
    colors = ['#C0431A', '#E8C030', '#2C1A0A', '#ff006e', '#00f5d4', '#8338ec', '#fb5607', '#3a86ff'],
    origin = { x: 0.5, y: 0.6 }
  } = options;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = [];
  const shapes = ['rect', 'circle', 'strip'];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const velocity = 8 + Math.random() * 12;
    particles.push({
      x: canvas.width * origin.x,
      y: canvas.height * origin.y,
      vx: Math.cos(angle) * velocity * (0.5 + Math.random()),
      vy: Math.sin(angle) * velocity * -1 - Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      gravity: 0.12 + Math.random() * 0.08,
      drag: 0.97 + Math.random() * 0.02,
      opacity: 1,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.05 + Math.random() * 0.1
    });
  }

  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const progress = elapsed / duration;

    if (progress >= 1) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx + Math.sin(p.wobble) * 0.5;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;
      p.opacity = Math.max(0, 1 - (progress * 1.2 - 0.2));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 6, -p.size, p.size / 3, p.size * 2);
      }

      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// Success toast with confetti
function showSuccessToast(message, options = {}) {
  // Launch confetti
  launchConfetti(options);

  // Show toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(20px);
    background:#2E5435; color:white; padding:14px 28px; border-radius:100px;
    font-size:14px; font-weight:700; font-family:'Inter',sans-serif;
    box-shadow:0 8px 30px rgba(0,0,0,.2);
    z-index:10000; opacity:0; transition:all .4s cubic-bezier(.16,1,.3,1);
    display:flex; align-items:center; gap:8px;
  `;
  toast.innerHTML = `<span style="font-size:18px;">&#x1F389;</span> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
