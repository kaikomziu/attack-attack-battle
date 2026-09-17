const KEYS = {
  held: new Set(),
  justPressed: new Set(),
};

function initKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (!KEYS.held.has(e.code)) KEYS.justPressed.add(e.code);
    KEYS.held.add(e.code);
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyR', 'ShiftLeft', 'ShiftRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    KEYS.held.delete(e.code);
  });
  window.addEventListener('blur', () => {
    KEYS.held.clear();
  });
}

function clearFrameInput() {
  KEYS.justPressed.clear();
}

function readPlayerInput() {
  const held = KEYS.held, jp = KEYS.justPressed;
  const shiftHeld = held.has('ShiftLeft') || held.has('ShiftRight');
  return {
    left: held.has('KeyA'),
    right: held.has('KeyD'),
    up: held.has('KeyW'),
    down: held.has('KeyS'),
    leftJustPressed: jp.has('KeyA'),
    rightJustPressed: jp.has('KeyD'),
    upJustPressed: jp.has('KeyW'),
    downJustPressed: jp.has('KeyS'),
    shiftHeld,
    attackJustPressed: jp.has('KeyE'),
    specialJustPressed: jp.has('KeyR'),
  };
}
