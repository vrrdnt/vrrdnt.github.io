(function () {
  'use strict';

  // Character pool — terminal/matrix feel with some katakana
  const CHARS = '01アウエカキクケコサシスセタチツテトナニヌ+×=[]{}|/<>?!#$%ABCDEFabcdef0123456789';

  // Tunables
  const CELL         = 20;    // grid cell size px
  const FONT_SZ      = 11;    // font size px
  const BASE_A       = 0.04;  // base alpha of idle characters
  const MOUSE_R      = 440;   // mouse glow radius px
  const MOUSE_PEAK   = 0.46;  // max additional alpha near mouse
  const FLASH_CHANCE = 0.0004; // probability per cell per frame of a flash
  const FLASH_PEAK   = 1;  // max alpha of a flash
  const FLASH_DECAY  = 0.02;  // how fast flashes fade per frame
  const FPS          = 90;
  const FRAME_MS     = 1000 / FPS;

  let canvas, ctx;
  let cols, rows, cells;
  let mouseX = -9999, mouseY = -9999;
  let lastTs = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function rchar() { return CHARS[Math.random() * CHARS.length | 0]; }

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
  }

  function update() {
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];

      // Character cycling
      if (--c.t <= 0) {
        c.ch = rchar();
        c.t  = (8 + Math.random() * 70) | 0;
      }

      // Random flash trigger
      if (c.flash > 0) {
        c.flash -= FLASH_DECAY;
        if (c.flash < 0) c.flash = 0;
      } else if (Math.random() < FLASH_CHANCE) {
        c.flash = FLASH_PEAK;
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
        const cx = col * CELL + CELL * 0.5;
        const c  = cells[row * cols + col];

        // Mouse proximity glow
        const md = Math.hypot(cx - mouseX, cy - mouseY);
        let a = BASE_A + (md < MOUSE_R
          ? MOUSE_PEAK * Math.pow(1 - md / MOUSE_R, 1.8)
          : 0);

        // Random flash
        a += c.flash;

        if (a < 0.008) continue;
        if (a > 0.88)  a = 0.88;

        ctx.fillStyle = `rgba(0,200,71,${a.toFixed(3)})`;
        ctx.fillText(c.ch, cx, cy);
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

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
