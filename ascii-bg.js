(function () {
  'use strict';

  // Character pool — terminal/matrix feel with some katakana
  const CHARS = '01アウエカキクケコサシスセタチツテトナニヌ+×=[]{}|/<>?!#$%ABCDEFabcdef0123456789';

  // Shared tunables
  const CELL         = 20;     // grid cell size px
  const FONT_SZ      = 11;     // font size px
  const MOUSE_R      = 440;    // mouse glow radius px
  const MOUSE_PEAK   = 0.46;   // max extra alpha near mouse
  const FLASH_CHANCE = 0.0004; // probability per cell per frame of triggering a flash
  const FLASH_PEAK   = 1;      // peak alpha of a flash
  const FLASH_DECAY  = 0.02;   // alpha lost per frame during flash decay
  const FPS          = 60;
  const FRAME_MS     = 1000 / FPS;

  // Matrix rain tunables
  const STREAM_SPEED_MIN = 0.25; // rows per frame
  const STREAM_SPEED_MAX = 0.65;
  const STREAM_LEN_MIN   = 10;   // trail length in cells
  const STREAM_LEN_MAX   = 24;
  const COL_SPAWN_MIN    = 20;   // frames between spawns per column
  const COL_SPAWN_MAX    = 120;
  const HEAD_ALPHA       = 0.92; // alpha of the leading head cell

  // GoL tunables
  const GOL_ALIVE_A  = 0.32;   // base alpha for alive cells
  const BASE_A       = 0.04;   // base alpha for dead/idle cells
  const GOL_SEED     = 0.30;   // initial alive probability
  const GOL_RESEED   = 0.04;   // reseed threshold (fraction of cells alive)
  const GOL_TICK     = 4;      // advance GoL state every N rendered frames

  let canvas, ctx;
  let cols, rows, cells;
  let mouseX = -9999, mouseY = -9999;
  let lastTs = 0;
  let mode; // 'ascii' | 'gol'

  // Matrix rain state
  let streams = [];
  let colCooldown = [];

  // GoL double-buffer (Uint8Array for speed)
  let golCur, golNxt;
  let golFrame = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function rchar() { return CHARS[Math.random() * CHARS.length | 0]; }

  // ── Matrix rain ─────────────────────────────────────────────────────────────

  function initStreams() {
    streams = [];
    colCooldown = Array.from({ length: cols }, () => (Math.random() * COL_SPAWN_MAX) | 0);
  }

  function updateStreams() {
    // Spawn new streams
    for (let col = 0; col < cols; col++) {
      if (colCooldown[col] > 0) { colCooldown[col]--; continue; }
      // Don't spawn a new stream while one is still near the top of this column
      const tooClose = streams.some(s => s.col === col && s.headY < STREAM_LEN_MAX + 2);
      if (!tooClose) {
        streams.push({
          col,
          headY: 0,
          speed: STREAM_SPEED_MIN + Math.random() * (STREAM_SPEED_MAX - STREAM_SPEED_MIN),
          len:   (STREAM_LEN_MIN  + Math.random() * (STREAM_LEN_MAX  - STREAM_LEN_MIN))  | 0,
          rc:    {}, // row -> char
        });
        colCooldown[col] = (COL_SPAWN_MIN + Math.random() * (COL_SPAWN_MAX - COL_SPAWN_MIN)) | 0;
      }
    }

    // Advance all streams
    for (let i = streams.length - 1; i >= 0; i--) {
      const s = streams[i];
      s.headY += s.speed;
      const hr = s.headY | 0;

      // Head char changes rapidly
      s.rc[hr] = rchar();

      // Assign and occasionally mutate trail chars
      for (let d = 1; d < s.len; d++) {
        const r = hr - d;
        if (r < 0) continue;
        if (!s.rc[r])                    s.rc[r] = rchar();
        else if (Math.random() < 0.04)   s.rc[r] = rchar();
      }

      // Prune chars that have scrolled above the tail
      for (const r in s.rc) {
        if (+r < hr - s.len - 1) delete s.rc[r];
      }

      // Remove streams whose tail is fully off the bottom
      if (s.headY - s.len > rows + 1) streams.splice(i, 1);
    }
  }

  function drawMatrix() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font         = `${FONT_SZ}px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (const s of streams) {
      const hr = s.headY | 0;
      const cx = s.col * CELL + CELL * 0.5;

      for (let d = 0; d <= s.len; d++) {
        const row = hr - d;
        if (row < 0 || row >= rows) continue;

        const cy  = row * CELL + CELL * 0.5;
        const ch  = s.rc[row] || ' ';
        const idx = row * cols + s.col;

        if (d === 0) {
          // Head: near-white, bright
          ctx.fillStyle = `rgba(200,255,210,${HEAD_ALPHA})`;
          ctx.fillText(ch, cx, cy);
          continue;
        }

        // Trail: fade with distance from head
        let a = 0.7 * Math.pow(1 - d / s.len, 1.8);

        // Mouse glow
        const md = Math.hypot(cx - mouseX, cy - mouseY);
        a += md < MOUSE_R ? MOUSE_PEAK * Math.pow(1 - md / MOUSE_R, 1.8) : 0;

        // Flash
        if (cells[idx]) a += cells[idx].flash;

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
    if (mode === 'ascii') initStreams();
    if (mode === 'gol')   initGol();
  }

  function update() {
    if (mode === 'ascii') {
      updateStreams();
    } else {
      if (++golFrame >= GOL_TICK) { golFrame = 0; stepGol(); }
    }

    // Random flashes — GoL only flashes alive cells; matrix flashes are visible only on trail cells
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
    if (mode === 'ascii') drawMatrix();
    else                  drawGol();
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (ts - lastTs < FRAME_MS) return;
    lastTs = ts;
    update();
    draw();
  }

  // ── Toggle button ────────────────────────────────────────────────────────────

  const TOGGLE_LABELS = { ascii: '[ life ]', gol: '[ matrix ]' };

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
          s.textContent = rchar();
          setTimeout(() => { s.textContent = s.dataset.orig; }, 80);
        }
      }
    }, 80);

    btn.addEventListener('click', () => {
      mode = mode === 'ascii' ? 'gol' : 'ascii';
      if (mode === 'gol')   { initGol();     golFrame = 0; }
      if (mode === 'ascii') { initStreams(); }
      buildLabel(btn, TOGGLE_LABELS[mode]);
    });
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
