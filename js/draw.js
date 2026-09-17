function drawGame(ctx, game) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  const shake = getScreenShakeOffset();
  ctx.save();
  ctx.translate(shake.x, shake.y);

  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0, '#170a0b');
  bg.addColorStop(1, '#2a0f0d');
  ctx.fillStyle = bg;
  ctx.fillRect(-20, -20, CANVAS_W + 40, CANVAS_H + 40);

  ctx.fillStyle = '#3a1512';
  ctx.fillRect(STAGE.left, STAGE.groundY, STAGE.right - STAGE.left, CANVAS_H - STAGE.groundY);
  ctx.fillStyle = '#ff5a3d';
  ctx.fillRect(STAGE.left, STAGE.groundY, STAGE.right - STAGE.left, 6);

  drawFighter(ctx, game.p1);
  drawFighter(ctx, game.cpu);
  drawParticles(ctx);

  ctx.restore();

  drawHud(ctx, game.p1, 40, 'あなた');
  drawHud(ctx, game.cpu, CANVAS_W - 300, 'CPU', true);
}

function drawFighter(ctx, f) {
  const flashing = f.invulnTimer > 0 && Math.floor(f.invulnTimer / 4) % 2 === 0;
  const inHitstun = f.state === 'hitstun';
  const x = f.x - f.w / 2, y = f.y - f.h;

  ctx.save();
  if (flashing) ctx.globalAlpha = 0.5;

  ctx.fillStyle = inHitstun ? '#ffffff' : f.color;
  roundRect(ctx, x, y, f.w, f.h, 14);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  const eyeX = f.facing > 0 ? x + f.w - 18 : x + 6;
  ctx.fillRect(eyeX, y + 22, 12, 8);

  if (f.state === 'punch' || f.state === 'attack' || f.state === 'special') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const fx = f.facing > 0 ? x + f.w : x - 26;
    ctx.fillRect(fx, y + 30, 26, 14);
  }
  if (f.state === 'dodgeInvincible') {
    ctx.strokeStyle = '#ffd23d'; ctx.lineWidth = 4;
    roundRect(ctx, x - 4, y - 4, f.w + 8, f.h + 8, 16); ctx.stroke();
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHud(ctx, f, x, label, rightAlign) {
  ctx.save();
  ctx.textAlign = rightAlign ? 'right' : 'left';
  const tx = rightAlign ? x + 260 : x;
  ctx.fillStyle = '#f3ecec';
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillText(label, tx, 40);
  ctx.font = 'bold 40px "Rajdhani", "Segoe UI", sans-serif';
  ctx.fillStyle = f.percent >= 100 ? '#ff5a3d' : '#ffd479';
  ctx.fillText(Math.round(f.percent) + '%', tx, 78);

  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#f3ecec';
  const stockStr = '●'.repeat(Math.max(f.stocks, 0));
  ctx.fillText(stockStr, tx, 104);
  ctx.restore();
}
