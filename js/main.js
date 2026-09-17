(function () {
  const verText = document.getElementById('verText');
  if (verText) verText.textContent = AAB_VERSION;

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (el) {
      el.classList.toggle('active', el.id === id);
    });
  }

  const btnQuickmatch = document.getElementById('btn-quickmatch');
  const btnControls = document.getElementById('btn-controls');
  const btnControlsBack = document.getElementById('btn-controls-back');
  const btnSettingsGear = document.getElementById('btn-settings-gear');
  const btnSettingsClose = document.getElementById('btn-settings-close');
  const screenSettings = document.getElementById('screen-settings');
  const screenResults = document.getElementById('screen-results');
  const btnRematch = document.getElementById('btn-rematch');
  const btnResultsTitle = document.getElementById('btn-results-title');

  const SETTINGS_KEY = 'aabSettings';
  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { muted: false, volume: 85 };
    } catch (e) {
      return { muted: false, volume: 85 };
    }
  }
  function saveSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) {}
  }

  const settingsMuted = document.getElementById('settingsMuted');
  const settingsVolume = document.getElementById('settingsVolume');
  const settings = loadSettings();
  if (settingsMuted) settingsMuted.checked = !!settings.muted;
  if (settingsVolume) settingsVolume.value = settings.volume;
  if (settingsMuted) settingsMuted.addEventListener('change', function () {
    settings.muted = settingsMuted.checked;
    saveSettings(settings);
  });
  if (settingsVolume) settingsVolume.addEventListener('input', function () {
    settings.volume = Number(settingsVolume.value);
    saveSettings(settings);
  });

  if (btnSettingsGear) btnSettingsGear.addEventListener('click', function () {
    screenSettings.classList.remove('hidden');
  });
  if (btnSettingsClose) btnSettingsClose.addEventListener('click', function () {
    screenSettings.classList.add('hidden');
  });

  if (btnControls) btnControls.addEventListener('click', function () {
    showScreen('screen-controls');
  });
  if (btnControlsBack) btnControlsBack.addEventListener('click', function () {
    showScreen('screen-title');
  });

  initKeyboard();

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let game = null;
  let simInterval = null;
  let rafId = null;

  function startBattle() {
    game = createGame();
    showScreen('screen-battle');
    screenResults.classList.add('hidden');
    if (simInterval) clearInterval(simInterval);
    simInterval = setInterval(function () {
      tickGame(game);
      clearFrameInput();
      if (game.over) {
        clearInterval(simInterval);
        simInterval = null;
        showResults(game);
      }
    }, 1000 / 60);
    if (!rafId) loop();
  }

  function loop() {
    if (game) drawGame(ctx, game);
    rafId = requestAnimationFrame(loop);
  }

  function showResults(g) {
    const title = document.getElementById('resultsTitle');
    const body = document.getElementById('resultsBody');
    if (g.winner === 'p1') title.textContent = '勝利！';
    else if (g.winner === 'cpu') title.textContent = '敗北…';
    else title.textContent = '引き分け';
    body.textContent = g.winner === 'p1' ? 'CPUを倒した！' : g.winner === 'cpu' ? 'CPUにやられた…' : '相打ちだ…';
    screenResults.classList.remove('hidden');
  }

  if (btnQuickmatch) btnQuickmatch.addEventListener('click', startBattle);
  if (btnRematch) btnRematch.addEventListener('click', startBattle);
  if (btnResultsTitle) btnResultsTitle.addEventListener('click', function () {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (simInterval) { clearInterval(simInterval); simInterval = null; }
    screenResults.classList.add('hidden');
    showScreen('screen-title');
  });

  showScreen('screen-title');
})();
