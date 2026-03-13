(function () {
  'use strict';

  // Character pool — terminal/matrix feel with some katakana
  const CHARS = '01アウエカキクケコサシスセタチツテトナニヌ+×=[]{}|/<>?!#$%ABCDEFabcdef0123456789';

  // Shared tunables
  const CELL         = 20;     // grid cell size px
  const FONT_SZ      = 11;     // font size px
  const BASE_A       = 0.04;   // base alpha for idle/dead characters
  const MOUSE_R      = 440;    // mouse glow radius px
  const MOUSE_PEAK   = 0.46;   // max extra alpha near mouse
  const FLASH_CHANCE = 0.0004; // probability per cell per frame of triggering a flash
  const FLASH_PEAK   = 1;      // peak alpha of a flash
  const FLASH_DECAY  = 0.02;   // alpha lost per frame during flash decay
  const FPS          = 90;
  const FRAME_MS     = 1000 / FPS;

  // GoL tunables
  const GOL_ALIVE_A  = 0.32;   // base alpha for alive cells
  const GOL_SEED     = 0.30;   // initial alive probability
  const GOL_RESEED   = 0.04;   // reseed threshold (fraction of cells alive)
  const GOL_TICK     = 4;      // advance GoL state every N rendered frames

  let canvas, ctx;
  let cols, rows, cells;
  let mouseX = -9999, mouseY = -9999;
  let lastTs = 0;
  let mode; // 'ascii' | 'gol'

  // GoL double-buffer (Uint8Array for speed)
  let golCur, golNxt;
  let golFrame = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function rchar() { return CHARS[Math.random() * CHARS.length | 0]; }

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
        if (!was && now) cells[i].ch = rchar(); // assign char on birth
        alive += now;
      }
    }
    // Swap buffers
    const tmp = golCur; golCur = golNxt; golNxt = tmp;

    // Reseed if population collapses
    if (alive < cols * rows * GOL_RESEED) {
      seedGol();
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
    if (mode === 'gol') initGol();
  }

  function update() {
    if (mode === 'ascii') {
      // Randomly cycle characters
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        if (--c.t <= 0) {
          c.ch = rchar();
          c.t  = (8 + Math.random() * 70) | 0;
        }
      }
    } else {
      // Advance GoL every GOL_TICK frames
      if (++golFrame >= GOL_TICK) {
        golFrame = 0;
        stepGol();
      }
    }

    // Random flashes (shared) — GoL only flashes alive cells
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (c.flash > 0) {
        c.flash -= FLASH_DECAY;
        if (c.flash < 0) c.flash = 0;
      } else if (mode === 'ascii' || golCur[i]) {
        if (Math.random() < FLASH_CHANCE) c.flash = FLASH_PEAK;
      }
    }
  }

  function draw() {
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

        // Base alpha: GoL alive cells are brighter
        const baseA = (mode === 'gol' && golCur[idx]) ? GOL_ALIVE_A : BASE_A;

        // Mouse glow (ascii only)
        const md = mode === 'ascii' ? Math.hypot(cx - mouseX, cy - mouseY) : MOUSE_R + 1;
        let a = baseA + (md < MOUSE_R
          ? MOUSE_PEAK * Math.pow(1 - md / MOUSE_R, 1.8)
          : 0);

        // Flash
        a += c.flash;

        if (a < 0.008) continue;
        if (a > 0.88)  a = 0.88;

        ctx.fillStyle = `rgba(0,200,71,${a.toFixed(3)})`;
        ctx.fillText(mode === 'gol' ? (golCur[idx] ? '1' : '0') : c.ch, cx, cy);
      }
    }
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (ts - lastTs < FRAME_MS) return;
    lastTs = ts;
    update();
    draw();
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    canvas = document.getElementById('ascii-bg');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    mode = Math.random() < 0.5 ? 'ascii' : 'gol';

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('click', (e) => {
      if (mode !== 'gol') return;
      const col = Math.floor(e.clientX / CELL);
      const row = Math.floor(e.clientY / CELL);
      if (col < 0 || col >= cols || row < 0 || row >= rows) return;
      const idx = row * cols + col;
      golCur[idx] = golCur[idx] ? 0 : 1;
    });

    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
