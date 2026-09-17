function createGame() {
  return {
    p1: createFighter('p1', STAGE.spawnP, '#3dd6ff'),
    cpu: createFighter('cpu', STAGE.spawnC, '#ff5a3d'),
    frame: 0,
    over: false,
    winner: null,
  };
}

function tickGame(game) {
  if (game.over) return;
  game.frame++;

  const p1Input = readPlayerInput();
  const cpuInput = computeAIInput(game.cpu, game.p1);

  updateFighter(game.p1, p1Input, game.cpu);
  updateFighter(game.cpu, cpuInput, game.p1);

  updateParticles();

  if (game.p1.ko || game.cpu.ko) {
    game.over = true;
    game.winner = game.p1.ko && game.cpu.ko ? 'draw' : game.p1.ko ? 'cpu' : 'p1';
  }
}
