// ─── CONFETTI & INTERACTIVE EFFECTS FOR SSSB STUDIO ─── //

const SSSB_COLORS = ['#C0431A', '#E8C030', '#2C1A0A', '#ff006e', '#00f5d4', '#8338ec', '#fb5607', '#3a86ff'];

// ─── MAIN CONFETTI BURST ────────────────────────────────
function launchConfetti(options = {}) {
  const {
    duration = 2500,
    particleCount = 80,
    colors = SSSB_COLORS,
    origin = { x: 0.5, y: 0.6 }
  } = options;

  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const shapes = ['rect', 'circle', 'strip'];

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 8 + Math.random() * 12;
    particles.push(createParticle(canvas, origin, angle, velocity, colors, shapes));
  }

  animateParticles(canvas, ctx, particles, duration);
}

// ─── MINI BURST (on click / button hover) ───────────────
function miniBurst(x, y, count = 15) {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const origin = { x: x / canvas.width, y: y / canvas.height };
  const shapes = ['circle', 'strip'];

  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 3 + Math.random() * 6;
    particles.push(createParticle(canvas, origin, angle, velocity, SSSB_COLORS, shapes, 3));
  }

  animateParticles(canvas, ctx, particles, 1200);
}

// ─── SPARKLE TRAIL (follows mouse on hero) ──────────────
let sparkleCanvas, sparkleCtx, sparkles = [], sparkleRAF;
function initSparkleTrail() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  sparkleCanvas = document.createElement('canvas');
  sparkleCanvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';
  hero.style.position = 'relative';
  hero.appendChild(sparkleCanvas);

  function resize() {
    sparkleCanvas.width = hero.offsetWidth;
    sparkleCanvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 2; i++) {
      sparkles.push({
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        size: 2 + Math.random() * 3,
        color: SSSB_COLORS[Math.floor(Math.random() * SSSB_COLORS.length)],
        life: 1,
        decay: 0.02 + Math.random() * 0.02
      });
    }
  });

  function animateSparkles() {
    sparkleRAF = requestAnimationFrame(animateSparkles);
    sparkleCtx = sparkleCanvas.getContext('2d');
    sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

    sparkles = sparkles.filter(s => s.life > 0);

    sparkles.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
      s.size *= 0.98;

      sparkleCtx.save();
      sparkleCtx.globalAlpha = s.life;
      sparkleCtx.fillStyle = s.color;
      sparkleCtx.shadowColor = s.color;
      sparkleCtx.shadowBlur = 6;

      // Star shape
      sparkleCtx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const ox = Math.cos(angle) * s.size;
        const oy = Math.sin(angle) * s.size;
        if (i === 0) sparkleCtx.moveTo(s.x + ox, s.y + oy);
        else sparkleCtx.lineTo(s.x + ox, s.y + oy);
        const midAngle = angle + Math.PI / 4;
        sparkleCtx.lineTo(s.x + Math.cos(midAngle) * s.size * 0.3, s.y + Math.sin(midAngle) * s.size * 0.3);
      }
      sparkleCtx.closePath();
      sparkleCtx.fill();
      sparkleCtx.restore();
    });
  }
  animateSparkles();
}

// ─── BUTTON HOVER SPARKLES ──────────────────────────────
function initButtonEffects() {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
      const rect = btn.getBoundingClientRect();
      miniBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
    });
  });

  // Click anywhere for tiny burst
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-primary, .copy-btn, .caption-copy-btn, .idea-action-btn, .mark-btn, .filter-btn')) {
      miniBurst(e.clientX, e.clientY, 12);
    }
  });
}

// ─── EMOJI RAIN (for special moments) ───────────────────
function emojiRain(emoji = '🎉', count = 20, duration = 3000) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:-30px;
      font-size:${16 + Math.random() * 20}px;
      animation:emojiDrop ${1.5 + Math.random() * 2}s ease-in forwards;
      animation-delay:${Math.random() * 1}s;
      opacity:0.8;
    `;
    container.appendChild(span);
  }

  // Add keyframes if not exists
  if (!document.getElementById('emoji-rain-style')) {
    const style = document.createElement('style');
    style.id = 'emoji-rain-style';
    style.textContent = `
      @keyframes emojiDrop {
        0% { transform:translateY(0) rotate(0deg); opacity:0; }
        10% { opacity:0.8; }
        100% { transform:translateY(${window.innerHeight + 50}px) rotate(${360}deg); opacity:0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), duration + 2000);
}

// ─── SUCCESS TOAST + CONFETTI ───────────────────────────
function showSuccessToast(message, options = {}) {
  launchConfetti(options);

  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(20px) scale(0.9);
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
    toast.style.transform = 'translateX(-50%) translateY(0) scale(1)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px) scale(0.9)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ─── HELPERS ────────────────────────────────────────────
let _confettiCanvas = null;

function getCanvas() {
  // Reuse canvas if it exists and is in DOM
  if (_confettiCanvas && _confettiCanvas.parentNode) return _confettiCanvas;

  _confettiCanvas = document.createElement('canvas');
  _confettiCanvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  _confettiCanvas.width = window.innerWidth;
  _confettiCanvas.height = window.innerHeight;
  document.body.appendChild(_confettiCanvas);

  window.addEventListener('resize', () => {
    if (_confettiCanvas) {
      _confettiCanvas.width = window.innerWidth;
      _confettiCanvas.height = window.innerHeight;
    }
  });

  return _confettiCanvas;
}

function createParticle(canvas, origin, angle, velocity, colors, shapes, baseSize = 5) {
  return {
    x: canvas.width * origin.x,
    y: canvas.height * origin.y,
    vx: Math.cos(angle) * velocity * (0.5 + Math.random()),
    vy: Math.sin(angle) * velocity * -1 - Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: baseSize + Math.random() * (baseSize + 1),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
    gravity: 0.12 + Math.random() * 0.08,
    drag: 0.97 + Math.random() * 0.02,
    opacity: 1,
    wobble: Math.random() * 10,
    wobbleSpeed: 0.05 + Math.random() * 0.1
  };
}

function animateParticles(canvas, ctx, particles, duration) {
  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const progress = elapsed / duration;

    if (progress >= 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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

// ─── INIT ON PAGE LOAD ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSparkleTrail();
  initButtonEffects();

  // Welcome confetti on first visit
  if (!sessionStorage.getItem('sssb_welcomed')) {
    sessionStorage.setItem('sssb_welcomed', '1');
    setTimeout(() => {
      launchConfetti({ particleCount: 40, duration: 2000 });
    }, 500);
  }
});
