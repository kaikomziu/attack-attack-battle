function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const PARTICLES = [];
function spawnHitParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    PARTICLES.push({
      x, y,
      vx: rand(-4, 4), vy: rand(-5, -1),
      life: rand(14, 26), maxLife: 26,
      color,
    });
  }
}
function updateParticles() {
  for (let i = PARTICLES.length - 1; i >= 0; i--) {
    const p = PARTICLES[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.life--;
    if (p.life <= 0) PARTICLES.splice(i, 1);
  }
}
function drawParticles(ctx) {
  for (const p of PARTICLES) {
    ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
  }
  ctx.globalAlpha = 1;
}

let SCREEN_SHAKE = 0;
function addScreenShake(amount) { SCREEN_SHAKE = Math.max(SCREEN_SHAKE, amount); }
function getScreenShakeOffset() {
  if (SCREEN_SHAKE <= 0) return { x: 0, y: 0 };
  SCREEN_SHAKE *= 0.85;
  if (SCREEN_SHAKE < 0.3) SCREEN_SHAKE = 0;
  return { x: rand(-SCREEN_SHAKE, SCREEN_SHAKE), y: rand(-SCREEN_SHAKE, SCREEN_SHAKE) };
}
