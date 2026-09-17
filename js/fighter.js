const GRAVITY = 0.6;
const MAX_FALL = 14;
const FASTFALL_MAX = 22;
const WALK_SPEED = 3.4;
const AIR_CONTROL = 2.4;
const JUMP_VEL = -13.5;
const AIR_JUMP_VEL = -12;
const HIGHJUMP_VEL = -20;
const BACKDASH_SPEED = 7.2;
const RESPAWN_INVULN = 90;

const MOVES = {
  normal: { name: '通常攻撃', dur: 22, hitFrame: 8, activeLen: 5, dmg: 6, kbBase: 5, kbScale: 0.35, angle: 50, rangeX: 78, rangeY: 70 },
  special: { name: '必殺技', dur: 34, hitFrame: 12, activeLen: 7, dmg: 13, kbBase: 9, kbScale: 0.5, angle: 45, rangeX: 96, rangeY: 76, cooldown: 20 },
  punch: { name: 'ラッシュパンチ', dur: 14, hitFrame: 3, activeLen: 4, dmg: 3, kbBase: 2.5, kbScale: 0.2, angle: 12, rangeX: 62, rangeY: 56, dashSpeed: 7.5 },
};

function createFighter(id, x, color) {
  return {
    id, x, y: STAGE.groundY, vx: 0, vy: 0,
    facing: id === 'p1' ? 1 : -1,
    w: 56, h: 96,
    percent: 0, stocks: 3,
    state: 'idle', timer: 0,
    grounded: true,
    airJumpsUsed: 0, canHighJump: true,
    cdSpecial: 0, invulnTimer: 0,
    color,
    ko: false,
  };
}

function fighterCanAct(f) {
  return ['idle', 'walk', 'jump', 'fall', 'crouch'].includes(f.state);
}

// 前(相手側)/後ろ(相手と反対側)を、現在の向き(facing)から見た左右キーに変換する
function forwardBackward(f, input) {
  const fwdIsRight = f.facing === 1;
  return {
    forwardHeld: fwdIsRight ? input.right : input.left,
    backwardHeld: fwdIsRight ? input.left : input.right,
  };
}

function startMove(f, moveKey) {
  const m = MOVES[moveKey];
  f.state = moveKey === 'normal' ? 'attack' : moveKey === 'special' ? 'special' : 'punch';
  f.timer = m.dur;
  f._move = moveKey;
  f._hitApplied = false;
  if (moveKey === 'special') f.cdSpecial = m.cooldown + m.dur;
}

function updateFighter(f, input, opponent) {
  if (f.invulnTimer > 0) f.invulnTimer--;
  if (f.cdSpecial > 0) f.cdSpecial--;

  const canAct = fighterCanAct(f);

  if (canAct) {
    if (f.grounded) f.facing = opponent.x >= f.x ? 1 : -1;
    const { forwardHeld, backwardHeld } = forwardBackward(f, input);

    if (input.shiftHeld && input.downJustPressed) {
      f.state = 'dodgeInvincible'; f.timer = 60; f.vx = 0;
    } else if (input.shiftHeld && input.upJustPressed && f.canHighJump) {
      f.canHighJump = false;
      f.vy = HIGHJUMP_VEL;
      f.vx = (input.left ? -4 : input.right ? 4 : 0) * 1.5;
      f.state = 'highjumpLock'; f.timer = 18;
      f.grounded = false;
    } else if (f.grounded && input.shiftHeld && forwardHeld) {
      startMove(f, 'punch');
    } else if (f.grounded && input.shiftHeld && backwardHeld) {
      f.state = 'backdash'; f.timer = 1;
    } else if (input.specialJustPressed && f.cdSpecial <= 0) {
      startMove(f, 'special');
    } else if (input.attackJustPressed) {
      startMove(f, 'normal');
    } else {
      if (input.left) {
        f.vx = -WALK_SPEED;
        f.state = f.grounded ? 'walk' : f.state;
      } else if (input.right) {
        f.vx = WALK_SPEED;
        f.state = f.grounded ? 'walk' : f.state;
      } else {
        if (f.grounded) { f.vx = 0; f.state = input.down ? 'crouch' : 'idle'; }
      }
      if (input.upJustPressed && !input.shiftHeld) {
        if (f.grounded) { f.vy = JUMP_VEL; f.grounded = false; f.state = 'jump'; }
        else if (f.airJumpsUsed < 1) { f.vy = AIR_JUMP_VEL; f.airJumpsUsed++; f.state = 'jump'; }
      }
    }
  } else if (f.state === 'backdash') {
    const { backwardHeld } = forwardBackward(f, input);
    if (input.shiftHeld && backwardHeld && f.grounded) {
      f.vx = -BACKDASH_SPEED * f.facing;
    } else {
      f.state = 'idle'; f.vx = 0;
    }
  } else if (f.state === 'punch') {
    const m = MOVES.punch;
    const active = f.timer <= m.dur - m.hitFrame && f.timer > m.dur - m.hitFrame - m.activeLen;
    f.vx = (active ? m.dashSpeed : 1.5) * f.facing;
    if (!f._hitApplied && active) tryHit(f, opponent, m);
    f.timer--;
    if (f.timer <= 0) {
      const { forwardHeld } = forwardBackward(f, input);
      if (f.grounded && input.shiftHeld && forwardHeld) { startMove(f, 'punch'); }
      else { f.state = 'idle'; f.vx = 0; }
    }
  } else if (f.state === 'attack' || f.state === 'special') {
    const m = MOVES[f._move];
    const active = f.timer <= m.dur - m.hitFrame && f.timer > m.dur - m.hitFrame - m.activeLen;
    if (!f._hitApplied && active) tryHit(f, opponent, m);
    if (f.grounded) f.vx *= 0.8;
    f.timer--;
    if (f.timer <= 0) f.state = 'idle';
  } else if (f.state === 'dodgeInvincible') {
    f.invulnTimer = Math.max(f.invulnTimer, 2);
    f.timer--;
    if (f.timer <= 0) { f.state = 'dodgeRecover'; f.timer = 180; }
  } else if (f.state === 'dodgeRecover') {
    f.vx *= 0.9;
    f.timer--;
    if (f.timer <= 0) f.state = 'idle';
  } else if (f.state === 'highjumpLock') {
    f.timer--;
    if (f.timer <= 0) f.state = 'fall';
  } else if (f.state === 'hitstun') {
    f.vx *= 0.97;
    f.timer--;
    if (f.timer <= 0) f.state = f.grounded ? 'idle' : 'fall';
  }

  if (!f.grounded) {
    const fastFall = input.down ? FASTFALL_MAX : MAX_FALL;
    f.vy = Math.min(f.vy + GRAVITY, fastFall);
    if (['idle', 'walk', 'jump', 'fall'].includes(f.state) && (input.left || input.right)) {
      f.vx = clamp(f.vx + (input.left ? -1 : 1) * AIR_CONTROL * 0.3, -WALK_SPEED * 1.6, WALK_SPEED * 1.6);
    }
  }

  f.x += f.vx;
  f.y += f.vy;

  if (f.y >= STAGE.groundY && f.vy >= 0) {
    f.y = STAGE.groundY; f.vy = 0;
    if (!f.grounded) {
      f.grounded = true;
      f.airJumpsUsed = 0; f.canHighJump = true;
      if (['jump', 'fall', 'highjumpLock'].includes(f.state)) f.state = 'idle';
    }
  } else if (f.y < STAGE.groundY) {
    f.grounded = false;
    if (f.state === 'idle' || f.state === 'walk' || f.state === 'crouch') f.state = 'fall';
  }

  checkBlast(f);
}

function tryHit(attacker, defender, move) {
  if (defender.invulnTimer > 0) return;
  const box = {
    x: attacker.x + (attacker.facing > 0 ? 0 : -move.rangeX),
    y: attacker.y - move.rangeY,
    w: move.rangeX + attacker.w / 2,
    h: move.rangeY,
  };
  const hurt = { x: defender.x - defender.w / 2, y: defender.y - defender.h, w: defender.w, h: defender.h };
  if (!aabbOverlap(box, hurt)) return;
  attacker._hitApplied = true;
  applyHit(attacker, defender, move);
}

function applyHit(attacker, defender, move) {
  defender.percent += move.dmg;
  const kb = move.kbBase + defender.percent * move.kbScale;
  const rad = (move.angle * Math.PI) / 180;
  const dir = attacker.facing;
  defender.vx = Math.cos(rad) * kb * dir;
  defender.vy = -Math.sin(rad) * kb;
  defender.state = 'hitstun';
  defender.timer = clamp(Math.round(kb * 2.2), 8, 70);
  defender.grounded = false;
  spawnHitParticles(defender.x, defender.y - defender.h / 2, attacker.color, 10);
  addScreenShake(clamp(kb * 0.5, 2, 14));
}

function checkBlast(f) {
  const b = STAGE.blast;
  if (f.x < b.left || f.x > b.right || f.y > b.bottom || f.y < b.top) {
    f.stocks--;
    if (f.stocks <= 0) { f.ko = true; return; }
    respawnFighter(f);
  }
}

function respawnFighter(f) {
  f.x = f.id === 'p1' ? STAGE.spawnP : STAGE.spawnC;
  f.y = STAGE.groundY - 260;
  f.vx = 0; f.vy = 0;
  f.percent = 0;
  f.state = 'fall'; f.grounded = false;
  f.airJumpsUsed = 0; f.canHighJump = true;
  f.invulnTimer = RESPAWN_INVULN;
}
