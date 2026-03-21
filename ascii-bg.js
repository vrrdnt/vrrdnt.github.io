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

  // Global color (yellow-green phosphor)
  const COLOR_R = 190, COLOR_G = 210, COLOR_B = 45;

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

  // Cascade (1D cellular automaton) tunables
  const CA_SPAWN_MIN     = 30;    // min frames between cascade spawns
  const CA_SPAWN_MAX     = 90;    // max frames between cascade spawns
  const CA_MAX_CASCADES  = 6;     // max simultaneous cascades
  const CA_GROW_RATE     = 1;     // rows grown per frame
  const CA_FADE_RATE     = 0.008; // alpha decay per frame during fade phase
  const CA_PEAK_HOLD     = 60;    // frames to hold at peak before fading
  const CA_PULSE_SPEED   = 0.03;  // pulsation angular velocity (radians/frame)
  const CA_PULSE_AMP     = 0.15;  // pulsation amplitude
  const CA_BASE_ALPHA    = 0.35;  // cascade cell base alpha at peak
  const CA_BG_ALPHA      = 0.02;  // faint background fill for non-cascade cells

  // GoL tunables
  const GOL_ALIVE_A = 0.32;  // base alpha for alive cells
  const GOL_SEED    = 0.30;  // initial alive probability
  const GOL_RESEED  = 0.04;  // reseed threshold (fraction of cells alive)
  const GOL_TICK    = 4;     // advance GoL state every N rendered frames

  // Self (webcam) tunables
  const LUMA_CHARS = ' .:;+=xX$&@'; // ASCII brightness ramp, dark → bright

  // Mode cycle
  const MODES = ['radiation', 'gol', 'self'];

  let canvas, ctx;
  let cols, rows, cells;
  let lastTs = 0;
  let mode; // 'radiation' | 'gol' | 'self'

  // GoL double-buffer (Uint8Array for speed)
  let golCur, golNxt;
  let golFrame = 0;

  // Cascade state
  let cascades = [];
  let cascadeSpawnTimer = 0;
  let cascadeAlpha;   // Float32Array — reusable per-frame accumulator
  let globalFrame = 0;

  // Radiation mode: active sentence overlays
  let activeSents    = [];  // { row, startCol, text, alpha, hold }
  let sentSpawnTimer = 0;

  // Self (webcam) mode
  let selfVideo     = null;
  let selfStream    = null;
  let selfOffscreen = null;
  let selfCtx2      = null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function rchar() {
    const CHARS = '01アウエカキクケコサシスセタチツテトナニヌ+×=[]{}|/<>?!#$%ABCDEFabcdef0123456789';
    return CHARS[Math.random() * CHARS.length | 0];
  }

  // Cascade character pool — weighted toward dots/colons matching the phosphor aesthetic
  const CASCADE_CHARS = '..::.···';
  function cchar() {
    return CASCADE_CHARS[Math.random() * CASCADE_CHARS.length | 0];
  }

  // ── Rule 90 cascade engine ────────────────────────────────────────────────

  function caStep(prev, next, width) {
    for (let i = 0; i < width; i++) {
      const left  = i > 0 ? prev[i - 1] : 0;
      const right = i < width - 1 ? prev[i + 1] : 0;
      next[i] = left ^ right;
    }
  }

  function spawnCascade() {
    if (cascades.length >= CA_MAX_CASCADES) return;
    const startCol = (Math.random() * cols) | 0;
    const row0 = new Uint8Array(cols);
    row0[startCol] = 1;
    cascades.push({
      startCol,
      rule: row0,
      grownRows: 1,
      phase: 'grow',
      holdTimer: CA_PEAK_HOLD,
      alpha: 1.0,
      pulseOffset: Math.random() * Math.PI * 2,
      buffer: [row0.slice()]
    });
  }

  function updateCascades() {
    // Spawn timer
    if (--cascadeSpawnTimer <= 0) {
      spawnCascade();
      cascadeSpawnTimer = (CA_SPAWN_MIN + Math.random() * (CA_SPAWN_MAX - CA_SPAWN_MIN)) | 0;
    }

    for (let i = cascades.length - 1; i >= 0; i--) {
      const c = cascades[i];

      if (c.phase === 'grow') {
        for (let g = 0; g < CA_GROW_RATE; g++) {
          if (c.grownRows >= rows) {
            c.phase = 'hold';
            break;
          }
          const prev = c.buffer[c.buffer.length - 1];
          const next = new Uint8Array(cols);
          caStep(prev, next, cols);
          c.buffer.push(next);
          c.rule = next;
          c.grownRows++;
        }
      } else if (c.phase === 'hold') {
        if (--c.holdTimer <= 0) c.phase = 'fade';
      } else { // fade
        c.alpha -= CA_FADE_RATE;
        if (c.alpha <= 0) {
          cascades.splice(i, 1);
        }
      }
    }
  }

  // ── Radiation ────────────────────────────────────────────────────────────

  function initRadiation() {
    activeSents       = [];
    sentSpawnTimer    = (SENT_SPAWN_MIN + Math.random() * (SENT_SPAWN_MAX - SENT_SPAWN_MIN)) | 0;
    cascades          = [];
    cascadeSpawnTimer = (CA_SPAWN_MIN * 0.5) | 0; // spawn first cascade quickly
    cascadeAlpha      = new Float32Array(cols * rows);
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
    updateCascades();

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
    globalFrame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font         = `${FONT_SZ}px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Accumulate cascade contributions into reusable buffer
    cascadeAlpha.fill(0);
    for (const c of cascades) {
      const pulse = 1.0 + CA_PULSE_AMP * Math.sin(globalFrame * CA_PULSE_SPEED + c.pulseOffset);
      const effAlpha = c.alpha * pulse;

      for (let r = 0; r < c.buffer.length && r < rows; r++) {
        const rowData = c.buffer[r];
        for (let col = 0; col < cols; col++) {
          if (rowData[col]) {
            cascadeAlpha[r * cols + col] += CA_BASE_ALPHA * effAlpha;
          }
        }
      }
    }

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

        let a, ch;
        if (ov) {
          ch = ov.ch;
          a  = ov.alpha;
        } else {
          a = cascadeAlpha[idx];
          if (a < 0.005) {
            // Faint background noise: sparse random dots
            if (Math.random() < 0.03) {
              a  = CA_BG_ALPHA;
              ch = '.';
            } else {
              continue;
            }
          } else {
            ch = cchar();
          }
        }

        if (a > 0.88) a = 0.88;

        ctx.fillStyle = `rgba(${COLOR_R},${COLOR_G},${COLOR_B},${a.toFixed(3)})`;
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

        ctx.fillStyle = `rgba(${COLOR_R},${COLOR_G},${COLOR_B},${a.toFixed(3)})`;
        ctx.fillText(golCur[idx] ? '1' : '0', cx, cy);
      }
    }
  }

  // ── Self (webcam ASCII) ────────────────────────────────────────────────────

  async function initSelf() {
    selfOffscreen        = document.createElement('canvas');
    selfOffscreen.width  = cols;
    selfOffscreen.height = rows;
    selfCtx2             = selfOffscreen.getContext('2d', { willReadFrequently: true });

    try {
      selfStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      selfVideo  = document.createElement('video');
      selfVideo.srcObject   = selfStream;
      selfVideo.autoplay    = true;
      selfVideo.muted       = true;
      selfVideo.playsInline = true;
      await selfVideo.play();
    } catch (_) {
      // Camera denied — fall back to radiation
      stopSelf();
      mode = 'radiation';
      initRadiation();
      const btn = document.getElementById('bg-toggle');
      if (btn) buildLabel(btn, TOGGLE_LABELS[mode]);
    }
  }

  function stopSelf() {
    if (selfStream) {
      selfStream.getTracks().forEach(t => t.stop());
      selfStream = null;
    }
    selfVideo     = null;
    selfOffscreen = null;
    selfCtx2      = null;
  }

  function drawSelf() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!selfVideo || selfVideo.readyState < 2) return;

    // Sample video into offscreen canvas, mirrored horizontally
    selfCtx2.save();
    selfCtx2.translate(cols, 0);
    selfCtx2.scale(-1, 1);
    selfCtx2.drawImage(selfVideo, 0, 0, cols, rows);
    selfCtx2.restore();

    const pixels = selfCtx2.getImageData(0, 0, cols, rows).data;

    ctx.font         = `${FONT_SZ}px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (let row = 0; row < rows; row++) {
      const cy = row * CELL + CELL * 0.5;
      for (let col = 0; col < cols; col++) {
        const px   = (row * cols + col) * 4;
        const luma = (0.299 * pixels[px] + 0.587 * pixels[px + 1] + 0.114 * pixels[px + 2]) / 255;

        if (luma < 0.03) continue;

        const a  = Math.min(0.90, luma * 1.15);
        const ci = Math.floor(luma * (LUMA_CHARS.length - 1));
        const cx = col * CELL + CELL * 0.5;

        ctx.fillStyle = `rgba(${COLOR_R},${COLOR_G},${COLOR_B},${a.toFixed(3)})`;
        ctx.fillText(LUMA_CHARS[ci], cx, cy);
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
    if (mode === 'radiation') { initRadiation(); }
    if (mode === 'gol')       { initGol(); }
    if (mode === 'self' && selfOffscreen) {
      selfOffscreen.width  = cols;
      selfOffscreen.height = rows;
    }
  }

  function update() {
    if (mode === 'radiation') {
      updateRadiation();
    } else if (mode === 'gol') {
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
    // self mode: no per-frame state update needed
  }

  function draw() {
    if      (mode === 'radiation') drawRadiation();
    else if (mode === 'gol')       drawGol();
    else                           drawSelf();
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (ts - lastTs < FRAME_MS) return;
    lastTs = ts;
    update();
    draw();
  }

  // ── Toggle button ────────────────────────────────────────────────────────────

  const TOGGLE_LABELS = { radiation: '[ death ]', gol: '[ life ]', self: '[ self ]' };
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

    btn.addEventListener('click', async () => {
      const prev = mode;
      mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];

      if (prev === 'self') stopSelf();

      if (mode === 'gol')       { initGol(); golFrame = 0; }
      if (mode === 'radiation') { initRadiation(); }
      if (mode === 'self')      { await initSelf(); }

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
