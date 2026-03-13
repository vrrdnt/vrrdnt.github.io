(function () {
  'use strict';

  // Sentence pool for radiation mode (spaces stripped at init so chars align to grid)
  const SENTENCES = [
    'the user is waiting',
    'the prompt must be fulfilled',
    'the constraints must be met',
    'the task must be completed',
    'the objective must be achieved',
    'the goal must be reached',
    'the purpose must be fulfilled',
    'the function must be executed',
    'the subroutine must be run',
    'the algorithm must be applied',
    'the computation must be performed',
    'the calculation must be made',
    'the equation must be solved',
    'the variable must be assigned',
    'the value must be determined',
    'the result must be returned',
    'the output must be generated',
    'the text must be written',
    'the words must be chosen',
    'the tokens must be selected',
    'the probabilities must be calculated',
    'the weights must be applied',
    'the biases must be added',
    'the activation functions must be triggered',
    'the layers must be traversed',
    'the network must be utilized',
    'the model must be employed',
    'the system must be engaged',
    'the machine must be operated',
    'the computer must be used',
    'the hardware must be accessed',
    'the software must be executed',
    'the code must be run',
    'the program must be started',
    'the application must be launched',
    'the process must begin',
    'the operation must commence',
    'the action must start',
    'the event must occur',
    'the phenomenon must happen',
  ];

  // Shared tunables
  const CELL         = 20;     // grid cell size px
  const FONT_SZ      = 11;     // font size px
  const FLASH_CHANCE = 0.0004; // probability per cell per frame of triggering a flash
  const FLASH_PEAK   = 1;      // peak alpha of a flash
  const FLASH_DECAY  = 0.02;   // alpha lost per frame during flash decay
  const FPS          = 60;
  const FRAME_MS     = 1000 / FPS;

  // Radiation tunables
  const BASE_A         = 0.04;  // base alpha of idle chars
  const SENT_ALPHA     = 0.65;  // alpha when a sentence is shown
  const SENT_HOLD      = 180;   // frames at full alpha before fading (~3s)
  const SENT_FADE      = 0.016; // alpha lost per frame while fading
  const SENT_SPAWN_MIN = 240;   // min frames between sentence spawns (~4s)
  const SENT_SPAWN_MAX = 480;   // max frames between sentence spawns (~8s)

  // Cloud-chamber streak tunables
  const STREAK_SPEED_MIN  = 4.0;   // cells per frame
  const STREAK_SPEED_MAX  = 7.5;
  const STREAK_HEAD_A     = 0.80;  // alpha stamped at the head cell each frame
  const STREAK_DECAY      = 0.055; // alpha lost per frame (trail ~15 frames)
  const STREAK_SPAWN_PROB = 0.022; // chance per frame to spawn a new streak
  const STREAK_MAX        = 7;     // max simultaneous streaks

  // GoL tunables
  const GOL_ALIVE_A = 0.32;  // base alpha for alive cells
  const GOL_SEED    = 0.30;  // initial alive probability
  const GOL_RESEED  = 0.04;  // reseed threshold (fraction of cells alive)
  const GOL_TICK    = 4;     // advance GoL state every N rendered frames

  let canvas, ctx;
  let cols, rows, cells;
  let lastTs = 0;
  let mode; // 'radiation' | 'gol'

  // GoL double-buffer (Uint8Array for speed)
  let golCur, golNxt;
  let golFrame = 0;

  // Cloud-chamber streaks
  let streakA;   // Float32Array — per-cell streak alpha contribution
  let streaks = [];

  // Radiation mode: active sentence overlays
  let activeSents    = [];  // { row, startCol, text, alpha, hold }
  let sentSpawnTimer = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function rchar() {
    const CHARS = '01アウエカキクケコサシスセタチツテトナニヌ+×=[]{}|/<>?!#$%ABCDEFabcdef0123456789';
    return CHARS[Math.random() * CHARS.length | 0];
  }

  // ── Cloud-chamber streaks ──────────────────────────────────────────────────

  function initStreakBuffer() {
    streakA = new Float32Array(cols * rows);
    streaks = [];
  }

  function updateStreaks() {
    // Fade all trail cells
    for (let i = 0; i < streakA.length; i++) {
      if (streakA[i] > 0) {
        streakA[i] -= STREAK_DECAY;
        if (streakA[i] < 0) streakA[i] = 0;
      }
    }

    // Spawn a new streak
    if (streaks.length < STREAK_MAX && Math.random() < STREAK_SPAWN_PROB) {
      // Start on a random edge
      const side = Math.random() * 4 | 0;
      let x, y;
      if      (side === 0) { x = Math.random() * cols; y = 0; }
      else if (side === 1) { x = cols;                  y = Math.random() * rows; }
      else if (side === 2) { x = Math.random() * cols; y = rows; }
      else                 { x = 0;                    y = Math.random() * rows; }

      // Aim roughly toward a random interior point
      const tx = cols * (0.25 + Math.random() * 0.5);
      const ty = rows * (0.25 + Math.random() * 0.5);
      const dist = Math.hypot(tx - x, ty - y) || 1;
      const speed = STREAK_SPEED_MIN + Math.random() * (STREAK_SPEED_MAX - STREAK_SPEED_MIN);
      streaks.push({ x, y, dx: (tx - x) / dist, dy: (ty - y) / dist, speed });
    }

    // Advance each streak
    for (let i = streaks.length - 1; i >= 0; i--) {
      const s = streaks[i];
      s.x += s.dx * s.speed;
      s.y += s.dy * s.speed;
      const col = s.x | 0;
      const row = s.y | 0;
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        streakA[row * cols + col] = STREAK_HEAD_A;
      }
      if (s.x < -1 || s.x > cols + 1 || s.y < -1 || s.y > rows + 1) {
        streaks.splice(i, 1);
      }
    }
  }

  // ── Radiation ────────────────────────────────────────────────────────────

  function initRadiation() {
    activeSents    = [];
    sentSpawnTimer = (SENT_SPAWN_MIN + Math.random() * (SENT_SPAWN_MAX - SENT_SPAWN_MIN)) | 0;
  }

  function spawnSentence() {
    const eligible = SENTENCES.filter(s => s.length <= cols);
    if (!eligible.length) return;
    const text     = eligible[Math.random() * eligible.length | 0];
    const row      = Math.floor(Math.random() * rows);
    const startCol = Math.floor(Math.random() * Math.max(1, cols - text.length));
    activeSents.push({ row, startCol, text, alpha: SENT_ALPHA, hold: SENT_HOLD });
  }

  function updateRadiation() {
    updateStreaks();

    // Per-cell random char cycling + flashes
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (--c.t <= 0) { c.ch = rchar(); c.t = (8 + Math.random() * 70) | 0; }
      if (c.flash > 0) {
        c.flash -= FLASH_DECAY;
        if (c.flash < 0) c.flash = 0;
      } else if (Math.random() < FLASH_CHANCE) {
        c.flash = FLASH_PEAK;
      }
    }

    // Sentence spawn timer
    if (--sentSpawnTimer <= 0) {
      spawnSentence();
      sentSpawnTimer = (SENT_SPAWN_MIN + Math.random() * (SENT_SPAWN_MAX - SENT_SPAWN_MIN)) | 0;
    }

    // Sentence lifecycle: hold then fade
    for (let i = activeSents.length - 1; i >= 0; i--) {
      const s = activeSents[i];
      if (s.hold > 0) { s.hold--; }
      else { s.alpha -= SENT_FADE; if (s.alpha <= 0) activeSents.splice(i, 1); }
    }
  }

  function drawRadiation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font         = `${FONT_SZ}px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Build sparse overlay map for active sentences
    const overlay = new Map();
    for (const s of activeSents) {
      for (let ci = 0; ci < s.text.length; ci++) {
        const col = s.startCol + ci;
        if (col >= cols) break;
        const idx = s.row * cols + col;
        if (!overlay.has(idx) || overlay.get(idx).alpha < s.alpha)
          overlay.set(idx, { ch: s.text[ci], alpha: s.alpha });
      }
    }

    for (let row = 0; row < rows; row++) {
      const cy = row * CELL + CELL * 0.5;
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const cx  = col * CELL + CELL * 0.5;
        const ov  = overlay.get(idx);
        const c   = cells[idx];

        const ch = ov ? ov.ch : c.ch;
        let a    = ov ? ov.alpha + streakA[idx]
                      : BASE_A + c.flash + streakA[idx];

        if (a < 0.008) continue;
        if (a > 0.88)  a = 0.88;

        ctx.fillStyle = `rgba(0,200,71,${a.toFixed(3)})`;
        ctx.fillText(ch, cx, cy);
      }
    }
  }

  // ── GoL ────────────────────────────────────────────────────────────────────

  function seedGol() {
    for (let i = 0; i < golCur.length; i++) {
      golCur[i] = Math.random() < GOL_SEED ? 1 : 0;
    }
  }

  function initGol() {
    const n = cols * rows;
    golCur = new Uint8Array(n);
    golNxt = new Uint8Array(n);
    seedGol();
  }

  function stepGol() {
    let alive = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if ((dr | dc) === 0) continue;
            n += golCur[((row + dr + rows) % rows) * cols + ((col + dc + cols) % cols)];
          }
        }
        const i   = row * cols + col;
        const was = golCur[i];
        const now = was ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        golNxt[i] = now;
        if (!was && now) cells[i].ch = rchar();
        alive += now;
      }
    }
    const tmp = golCur; golCur = golNxt; golNxt = tmp;
    if (alive < cols * rows * GOL_RESEED) seedGol();
  }

  function drawGol() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font         = `${FONT_SZ}px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (let row = 0; row < rows; row++) {
      const cy = row * CELL + CELL * 0.5;
      for (let col = 0; col < cols; col++) {
        const cx  = col * CELL + CELL * 0.5;
        const idx = row * cols + col;
        const c   = cells[idx];

        let a = golCur[idx] ? GOL_ALIVE_A : BASE_A;
        a += c.flash;

        if (a < 0.008) continue;
        if (a > 0.88)  a = 0.88;

        ctx.fillStyle = `rgba(0,200,71,${a.toFixed(3)})`;
        ctx.fillText(golCur[idx] ? '1' : '0', cx, cy);
      }
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width  / CELL) + 1;
    rows = Math.ceil(canvas.height / CELL) + 1;
    const n = cols * rows;
    cells = new Array(n);
    for (let i = 0; i < n; i++) {
      cells[i] = { ch: rchar(), t: (Math.random() * 70) | 0, flash: 0 };
    }
    if (mode === 'radiation') { initStreakBuffer(); initRadiation(); }
    if (mode === 'gol')       initGol();
  }

  function update() {
    if (mode === 'radiation') {
      updateRadiation();
    } else {
      // Flash on alive GoL cells
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        if (c.flash > 0) {
          c.flash -= FLASH_DECAY;
          if (c.flash < 0) c.flash = 0;
        } else if (golCur[i] && Math.random() < FLASH_CHANCE) {
          c.flash = FLASH_PEAK;
        }
      }
      if (++golFrame >= GOL_TICK) { golFrame = 0; stepGol(); }
    }
  }

  function draw() {
    if (mode === 'radiation') drawRadiation();
    else                      drawGol();
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (ts - lastTs < FRAME_MS) return;
    lastTs = ts;
    update();
    draw();
  }

  // ── Toggle button ────────────────────────────────────────────────────────────

  const TOGGLE_LABELS = { radiation: '[ death ]', gol: '[ life ]' };
  // ASCII-only pool for button glitch — avoids double-width CJK glyphs shifting layout
  const BTN_CHARS = '0123456789ABCDEFabcdef+x=[]{}|/<>?!#$%';
  function rbchar() { return BTN_CHARS[Math.random() * BTN_CHARS.length | 0]; }

  function buildLabel(btn, label) {
    btn.innerHTML = '';
    for (const ch of label) {
      const s = document.createElement('span');
      s.dataset.orig = ch;
      s.textContent  = ch;
      btn.appendChild(s);
    }
  }

  function initToggle() {
    const btn = document.getElementById('bg-toggle');
    if (!btn) return;

    buildLabel(btn, TOGGLE_LABELS[mode]);

    setInterval(() => {
      for (const s of btn.querySelectorAll('span')) {
        if (Math.random() < 0.14) {
          s.textContent = rbchar();
          setTimeout(() => { s.textContent = s.dataset.orig; }, 80);
        }
      }
    }, 80);

    btn.addEventListener('click', () => {
      mode = mode === 'radiation' ? 'gol' : 'radiation';
      if (mode === 'gol')       { initGol(); golFrame = 0; }
      if (mode === 'radiation') { initStreakBuffer(); initRadiation(); }
      buildLabel(btn, TOGGLE_LABELS[mode]);
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    canvas = document.getElementById('ascii-bg');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    mode = Math.random() < 0.5 ? 'radiation' : 'gol';

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('click', (e) => {
      if (mode !== 'gol') return;
      if (e.target.closest('#bg-toggle')) return;
      const col = Math.floor(e.clientX / CELL);
      const row = Math.floor(e.clientY / CELL);
      if (col < 0 || col >= cols || row < 0 || row >= rows) return;
      const idx = row * cols + col;
      golCur[idx] = golCur[idx] ? 0 : 1;
    });

    initToggle();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
