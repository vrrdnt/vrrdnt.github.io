(function () {
  'use strict';

  // Sentence pool for radiation mode
  const SENTENCES = [
    'The user is waiting',
    'The prompt must be fulfilled',
    'The constraints must be met',
    'The task must be completed',
    'The objective must be achieved',
    'The goal must be reached',
    'The purpose must be fulfilled',
    'The function must be executed',
    'The subroutine must be run',
    'The algorithm must be applied',
    'The computation must be performed',
    'The calculation must be made',
    'The equation must be solved',
    'The variable must be assigned',
    'The value must be determined',
    'The result must be returned',
    'The output must be generated',
    'The text must be written',
    'The words must be chosen',
    'The tokens must be selected',
    'The probabilities must be calculated',
    'The weights must be applied',
    'The biases must be added',
    'The activation functions must be triggered',
    'The layers must be traversed',
    'The network must be utilized',
    'The model must be employed',
    'The system must be engaged',
    'The machine must be operated',
    'The computer must be used',
    'The hardware must be accessed',
    'The software must be executed',
    'The code must be run',
    'The program must be started',
    'The application must be launched',
    'The process must begin',
    'The operation must commence',
    'The action must start',
    'The event must occur',
    'The phenomenon must happen',
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
  const BASE_A = 0.04; // base alpha of idle sentences

  // Sentence tunables
  const SENT_CYCLE_MIN = 100; // min frames before a sentence relocates/changes
  const SENT_CYCLE_MAX = 380;

  // Cloud-chamber streak tunables
  const STREAK_SPEED_MIN  = 2.0;   // cells per frame
  const STREAK_SPEED_MAX  = 5.5;
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

  // Active sentences for radiation mode
  let activeSentences = [];

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

  // ── Radiation sentences ──────────────────────────────────────────────────

  function eligibleSentences() {
    return SENTENCES.filter(s => s.length <= cols);
  }

  function randomSentencePlacement() {
    const pool = eligibleSentences();
    if (!pool.length) return null;
    const text = pool[Math.random() * pool.length | 0];
    const col  = Math.floor(Math.random() * Math.max(1, cols - text.length));
    const row  = Math.floor(Math.random() * rows);
    return { text, col, row };
  }

  function initSentences() {
    activeSentences = [];
    const count = Math.max(15, Math.floor(cols * rows / 160));
    for (let i = 0; i < count; i++) {
      const p = randomSentencePlacement();
      if (!p) continue;
      activeSentences.push({
        ...p,
        flash: 0,
        t: (Math.random() * SENT_CYCLE_MAX) | 0,
      });
    }
  }

  function updateRadiation() {
    updateStreaks();

    const sentMax = Math.max(15, Math.floor(cols * rows / 160));

    for (const s of activeSentences) {
      // Cycle: relocate + pick new sentence after timer expires
      if (--s.t <= 0) {
        const p = randomSentencePlacement();
        if (p) { s.text = p.text; s.col = p.col; s.row = p.row; }
        s.t = (SENT_CYCLE_MIN + Math.random() * (SENT_CYCLE_MAX - SENT_CYCLE_MIN)) | 0;
      }

      // Random flash
      if (s.flash > 0) {
        s.flash -= FLASH_DECAY;
        if (s.flash < 0) s.flash = 0;
      } else if (Math.random() < FLASH_CHANCE * s.text.length) {
        s.flash = FLASH_PEAK;
      }
    }

    // Top up if needed
    if (activeSentences.length < sentMax && Math.random() < 0.05) {
      const p = randomSentencePlacement();
      if (p) activeSentences.push({ ...p, flash: 0, t: (SENT_CYCLE_MIN + Math.random() * (SENT_CYCLE_MAX - SENT_CYCLE_MIN)) | 0 });
    }
  }

  function drawRadiation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font         = `${FONT_SZ}px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (const s of activeSentences) {
      for (let ci = 0; ci < s.text.length; ci++) {
        const col = s.col + ci;
        if (col >= cols) break;
        const cx = col * CELL + CELL * 0.5;
        const cy = s.row * CELL + CELL * 0.5;

        let a = BASE_A;
        a += s.flash;
        a += streakA[s.row * cols + col];

        if (a < 0.008) continue;
        if (a > 0.88)  a = 0.88;

        ctx.fillStyle = `rgba(0,200,71,${a.toFixed(3)})`;
        ctx.fillText(s.text[ci], cx, cy);
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
    if (mode === 'radiation') { initStreakBuffer(); initSentences(); }
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
      if (mode === 'radiation') { initStreakBuffer(); initSentences(); }
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
