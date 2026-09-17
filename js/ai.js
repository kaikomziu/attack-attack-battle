function computeAIInput(cpu, player) {
  const input = {
    left: false, right: false, up: false, down: false,
    leftJustPressed: false, rightJustPressed: false, upJustPressed: false, downJustPressed: false,
    shiftHeld: false, attackJustPressed: false, specialJustPressed: false,
  };

  const dx = player.x - cpu.x;
  const dist = Math.abs(dx);
  const towardRight = dx >= 0;

  if (!cpu.grounded) {
    const nearGround = cpu.y > STAGE.groundY - 60 && cpu.vy >= 0;
    const offSide = cpu.x < STAGE.left + 30 || cpu.x > STAGE.right - 30;
    if (cpu.canHighJump && (nearGround || offSide) && fighterCanAct(cpu)) {
      input.shiftHeld = true; input.up = true; input.upJustPressed = true;
      const center = (STAGE.left + STAGE.right) / 2;
      if (cpu.x < center) { input.right = true; } else { input.left = true; }
      return input;
    }
    if (cpu.x < STAGE.left + 200) input.right = true;
    else if (cpu.x > STAGE.right - 200) input.left = true;
    else if (towardRight) input.right = true; else input.left = true;
    return input;
  }

  if (!fighterCanAct(cpu)) return input;

  if (cpu.percent > 85 && dist < 160 && Math.random() < 0.02) {
    if (towardRight) input.left = true; else input.right = true;
    input.shiftHeld = true;
    return input;
  }

  if (dist < 220 && Math.random() < 0.006) {
    if (towardRight) input.left = true; else input.right = true;
    input.downJustPressed = true;
    input.shiftHeld = true;
    return input;
  }

  if (dist > 210) {
    if (towardRight) { input.right = true; } else { input.left = true; }
    input.shiftHeld = true;
    return input;
  }

  if (dist > 95) {
    if (towardRight) { input.right = true; } else { input.left = true; }
    if (Math.random() < 0.4) input.shiftHeld = true;
    return input;
  }

  if (cpu.cdSpecial <= 0 && Math.random() < 0.035) {
    input.specialJustPressed = true;
    return input;
  }
  if (Math.random() < 0.09) {
    input.attackJustPressed = true;
    return input;
  }

  if (towardRight) input.right = true; else input.left = true;
  return input;
}
