(function () {
  'use strict';

  // Kernel error messages for radiation mode overlays
  const SENTENCES = [
    '[    0.032108]      SQUASHFS error: unable to read id index',
    '[    0.038890] overlayfs: failed to resolve \'/diff\':',
    '[    0.217774]          -- (0x0)            FATAL_EXCEPTION',
    '[    0.095004] acpi USBC000:00: PPM init failed(-110)',
    '[    0.004218] kernel: NMI watchdog: BUG: soft lockup - CPU#3 stuck',
    '[    0.112740] EXT4-fs error (device sda1): ext4_lookup:1690: inode #2: comm init',
    '[    0.008331] ACPI BIOS Error (bug): could not resolve symbol',
    '[    0.041902] BUG: unable to handle page fault at 0xffffd8a0',
    '[    0.156220] RIP: 0010:__alloc_pages_nodemask+0x127/0x2a0',
    '[    0.003100] Kernel panic - not syncing: VFS: Unable to mount root fs',
    '[    0.077413] general protection fault: 0000 [#1] SMP NOPTI',
    '[    0.200110] snd_hda_intel 0000:00:1f.3: DSP not running',
    '[    0.019847] ata1.00: failed command: READ FPDMA QUEUED',
    '[    0.063002] mce: [Hardware Error]: Machine check events logged',
    '[    0.140058] pcieport 0000:00:1c.0: AER: Corrected error received',
    '[    0.088216] iwlwifi: probe of 0000:02:00.0 failed with error -110',
    '[    0.250033] Out of memory: Killed process 1 (systemd)',
    '[    0.005519] DMAR: DRHD: handling fault status reg 2',
    '[    0.300021] watchdog: BUG: soft lockup - CPU#0 stuck for 22s!',
    '[    0.172800] blk_update_request: I/O error, dev sda, sector 0',
    '[    0.420115] nvidia 0000:01:00.0: GPU has fallen off the bus',
    '[    0.001337] traps: SIGNAL 11 (core dumped)',
    '[    0.510020] task systemd-journal:168 blocked for more than 120 seconds',
    '[    0.068400] usb 1-1: device descriptor read/64, error -71',
    '[    0.220045] Instruction Fetch Unit Ext. Error Code: 3',
    '[    0.130077] cache level: L1, tx: INSN, mem-tx: IRD',
    '[    0.045678] CPU:3 (17:71:0) MC1_STATUS[Over|CE|MiscV|AddrV|-|-|SyndV|-|-|-]: 0xdc20000000030151',
    '[    0.098765] IPID: 0x000100b000000000, Syndrome: 0x000000001a030601',
  ];

  // Global color (yellow-green phosphor)
  const COLOR_R = 185, COLOR_G = 220, COLOR_B = 40;

  // Shared tunables
  const CELL         = 16;     // grid cell size px
  const FONT_SZ      = 11;     // font size px
  const FLASH_CHANCE = 0.0004; // probability per cell per frame of triggering a flash
  const FLASH_PEAK   = 1;      // peak alpha of a flash
  const FLASH_DECAY  = 0.02;   // alpha lost per frame during flash decay
  const FPS          = 60;
  const FRAME_MS     = 1000 / FPS;

  // Radiation tunables
  const BASE_A         = 0.08;  // base alpha of idle chars
  const SENT_ALPHA     = 0.95;  // alpha when a sentence is shown
  const SENT_HOLD      = 180;   // frames at full alpha before fading (~3s)
  const SENT_FADE      = 0.016; // alpha lost per frame while fading
  const SENT_SPAWN_MIN = 240;   // min frames between sentence spawns (~4s)
  const SENT_SPAWN_MAX = 480;   // max frames between sentence spawns (~8s)

  // Cluster tunables
  const CL_SPAWN_MIN     = 4;     // min frames between cluster spawns
  const CL_SPAWN_MAX     = 15;    // max frames between cluster spawns
  const CL_MAX_CLUSTERS  = 32;    // max simultaneous clusters
  const CL_FADE_RATE     = 0.005; // alpha decay per frame during fade phase
  const CL_PEAK_HOLD     = 100;   // frames to hold at peak before fading
  const CL_PULSE_SPEED   = 0.04;  // pulsation angular velocity (radians/frame)
  const CL_PULSE_AMP     = 1;  // pulsation amplitude
  const CL_BASE_ALPHA    = 0.95;  // cluster cell base alpha at peak
  const CL_BG_ALPHA      = 0.16;  // faint background fill for non-cluster cells
  const CL_GROW_FRAMES   = 40;    // frames to grow from seed to full size

  // GoL tunables
  const GOL_ALIVE_A = 0.55;  // base alpha for alive cells
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

  // Cluster state
  let clusters = [];
  let clusterSpawnTimer = 0;
  let clusterAlpha;   // Float32Array — reusable per-frame accumulator
  let globalFrame = 0;

  // Radiation mode: active error message overlays
  let activeSents    = [];  // { row, startCol, text, alpha, hold, revealed, glitchBlocks }
  let sentSpawnTimer = 0;
  const GLITCH_CHARS = '0123456789abcdef#$%&@!?/\\|=+~^';
  const SENT_REVEAL_RATE = 1; // chars revealed per frame (typewriter speed)

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

  // Cascade character pool — weighted toward × and x for dense triangular texture
  const CASCADE_CHARS = `
    ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏
    ⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟
    ⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯
    ⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿
    ⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏
    ⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟
    ⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯
    ⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿
    ⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏
    ⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟
    ⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭⢮⢯
    ⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿
    ⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏
    ⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟
    ⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯
    ⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿
    ▶◀▼▲◆◇○●◐◑◒◓◔◕◖◗ꙮ֍✤
  `;

  function cchar() {
    return CASCADE_CHARS[Math.random() * CASCADE_CHARS.length | 0];
  }

  // ── Organic cluster engine ────────────────────────────────────────────────

  // Simple hash for repeatable per-cell noise within a cluster
  function hashNoise(x, y, seed) {
    let h = seed;
    h = ((h << 5) - h + x) | 0;
    h = ((h << 5) - h + y) | 0;
    h = Math.sin(h * 12.9898 + y * 78.233) * 43758.5453;
    return h - Math.floor(h); // 0..1
  }

  function spawnCluster() {
    if (clusters.length >= CL_MAX_CLUSTERS) return;

    // Random center position
    const cx = Math.random() * cols;
    const cy = Math.random() * rows;

    // Varied radii for irregular shape (elliptical + noise)
    const rx = 3 + Math.random() * 12;  // 3-15 cells wide
    const ry = 2 + Math.random() * 8;   // 2-10 cells tall
    const angle = Math.random() * Math.PI; // rotation for variety

    // Density: how filled the cluster is (0.45 = sparse, 0.85 = dense)
    const density = 0.45 + Math.random() * 0.40;

    // Edge roughness: how jagged the boundary is
    const roughness = 0.3 + Math.random() * 0.5;

    const seed = (Math.random() * 100000) | 0;

    clusters.push({
      cx, cy, rx, ry, angle, density, roughness, seed,
      phase: 'grow',
      growProgress: 0,
      holdTimer: CL_PEAK_HOLD + (Math.random() * 60) | 0,
      alpha: 1.0,
      pulseOffset: Math.random() * Math.PI * 2,
    });
  }

  function updateClusters() {
    // Spawn timer
    if (--clusterSpawnTimer <= 0) {
      spawnCluster();
      clusterSpawnTimer = (CL_SPAWN_MIN + Math.random() * (CL_SPAWN_MAX - CL_SPAWN_MIN)) | 0;
    }

    for (let i = clusters.length - 1; i >= 0; i--) {
      const c = clusters[i];

      if (c.phase === 'grow') {
        c.growProgress += 1 / CL_GROW_FRAMES;
        if (c.growProgress >= 1) {
          c.growProgress = 1;
          c.phase = 'hold';
        }
      } else if (c.phase === 'hold') {
        if (--c.holdTimer <= 0) c.phase = 'fade';
      } else { // fade
        c.alpha -= CL_FADE_RATE;
        if (c.alpha <= 0) {
          clusters.splice(i, 1);
        }
      }
    }
  }

  // Test if a grid cell (col, row) falls inside a cluster's noisy region
  function clusterCellAlpha(c, col, row) {
    // Transform to cluster-local coordinates
    const dx = col - c.cx;
    const dy = row - c.cy;
    const cosA = Math.cos(c.angle);
    const sinA = Math.sin(c.angle);
    const lx = (dx * cosA + dy * sinA) / c.rx;
    const ly = (-dx * sinA + dy * cosA) / c.ry;

    // Elliptical distance (0 at center, 1 at boundary)
    const dist = lx * lx + ly * ly;

    // Apply growth — scale the effective radius
    const growScale = c.growProgress * c.growProgress; // ease-in
    if (dist > growScale) return 0;

    // Noise-based fill: use hash to decide if this cell is active
    const n = hashNoise(col, row, c.seed);

    // Edge roughness: cells near the boundary have lower probability
    const edgeFactor = 1 - (dist / growScale);
    const threshold = (1 - c.density) + c.roughness * (1 - edgeFactor);

    if (n > threshold) return 0;

    // Alpha falloff toward edges
    return edgeFactor * edgeFactor;
  }

  // ── Radiation ────────────────────────────────────────────────────────────

  function initRadiation() {
    activeSents       = [];
    sentSpawnTimer    = (SENT_SPAWN_MIN + Math.random() * (SENT_SPAWN_MAX - SENT_SPAWN_MIN)) | 0;
    clusters          = [];
    clusterSpawnTimer = (CL_SPAWN_MIN * 0.5) | 0; // spawn first cluster quickly
    clusterAlpha      = new Float32Array(cols * rows);
  }

  function makeGlitchBlocks(textLen) {
    // Create 1-3 dark rectangular blocks that obscure parts of the text
    const blocks = [];
    const count = 1 + (Math.random() * 3) | 0;
    for (let i = 0; i < count; i++) {
      const start = (Math.random() * textLen) | 0;
      const len = 2 + (Math.random() * 6) | 0;
      blocks.push({ start, len });
    }
    return blocks;
  }

  function spawnSentence() {
    const eligible = SENTENCES.filter(s => s.length <= cols);
    if (!eligible.length) return;
    const text     = eligible[Math.random() * eligible.length | 0];
    const row      = Math.floor(Math.random() * rows);
    const startCol = Math.floor(Math.random() * Math.max(1, cols - text.length));
    const glitchBlocks = makeGlitchBlocks(text.length);
    activeSents.push({
      row, startCol, text, alpha: SENT_ALPHA, hold: SENT_HOLD,
      revealed: 0, glitchBlocks
    });
  }

  function updateRadiation() {
    updateClusters();

    // Sentence spawn timer
    if (--sentSpawnTimer <= 0) {
      spawnSentence();
      sentSpawnTimer = (SENT_SPAWN_MIN + Math.random() * (SENT_SPAWN_MAX - SENT_SPAWN_MIN)) | 0;
    }

    // Sentence lifecycle: reveal → hold → fade
    for (let i = activeSents.length - 1; i >= 0; i--) {
      const s = activeSents[i];
      // Typewriter reveal phase
      if (s.revealed < s.text.length) {
        s.revealed = Math.min(s.text.length, s.revealed + SENT_REVEAL_RATE);
      } else if (s.hold > 0) {
        s.hold--;
        // Randomly shift glitch blocks during hold
        if (Math.random() < 0.05) {
          s.glitchBlocks = makeGlitchBlocks(s.text.length);
        }
      } else {
        s.alpha -= SENT_FADE;
        if (s.alpha <= 0) activeSents.splice(i, 1);
      }
    }
  }

  function drawRadiation() {
    globalFrame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font         = `${FONT_SZ}px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Accumulate cluster contributions into reusable buffer
    clusterAlpha.fill(0);
    for (const c of clusters) {
      const pulse = 1.0 + CL_PULSE_AMP * Math.sin(globalFrame * CL_PULSE_SPEED + c.pulseOffset);
      const effAlpha = c.alpha * pulse;

      // Only iterate over cells within the cluster's bounding box
      const maxR = Math.max(c.rx, c.ry) * 1.2;
      const r0 = Math.max(0, (c.cy - maxR) | 0);
      const r1 = Math.min(rows - 1, (c.cy + maxR) | 0);
      const c0 = Math.max(0, (c.cx - maxR) | 0);
      const c1 = Math.min(cols - 1, (c.cx + maxR) | 0);

      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const cellA = clusterCellAlpha(c, col, row);
          if (cellA > 0) {
            clusterAlpha[row * cols + col] += CL_BASE_ALPHA * effAlpha * cellA;
          }
        }
      }
    }

    // Build sparse overlay map for active sentences with glitch
    const overlay = new Map();
    const glitchRects = []; // dark rectangles to draw over text
    for (const s of activeSents) {
      const revealLen = s.revealed | 0;
      for (let ci = 0; ci < revealLen; ci++) {
        const col = s.startCol + ci;
        if (col >= cols) break;
        const idx = s.row * cols + col;

        // Check if this char is inside a glitch block
        let inGlitch = false;
        for (const gb of s.glitchBlocks) {
          if (ci >= gb.start && ci < gb.start + gb.len) {
            inGlitch = true;
            break;
          }
        }

        let ch;
        if (inGlitch) {
          // Garbled character or blank for glitch blocks
          ch = Math.random() < 0.4 ? ' ' : GLITCH_CHARS[Math.random() * GLITCH_CHARS.length | 0];
        } else {
          ch = s.text[ci];
        }

        if (!overlay.has(idx) || overlay.get(idx).alpha < s.alpha)
          overlay.set(idx, { ch, alpha: s.alpha, glitch: inGlitch });
      }

      // Collect glitch block rectangles for dark overlay rendering
      for (const gb of s.glitchBlocks) {
        if (gb.start < revealLen) {
          const blockStart = s.startCol + gb.start;
          const blockLen = Math.min(gb.len, revealLen - gb.start);
          glitchRects.push({
            row: s.row, col: blockStart, len: blockLen, alpha: s.alpha * 0.5
          });
        }
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
          a = clusterAlpha[idx];
          if (a < 0.005) {
            // Faint background noise: sparse random dots
            if (Math.random() < 0.06) {
              a  = CL_BG_ALPHA;
              ch = Math.random() < 0.5 ? '·' : '.';
            } else {
              continue;
            }
          } else {
            ch = cchar();
          }
        }

        if (a > 1.0) a = 1.0;

        ctx.fillStyle = `rgba(${COLOR_R},${COLOR_G},${COLOR_B},${a.toFixed(3)})`;
        ctx.fillText(ch, cx, cy);
      }
    }

    // Draw dark glitch rectangles over corrupted sections of error messages
    for (const gr of glitchRects) {
      const x = gr.col * CELL;
      const y = gr.row * CELL;
      ctx.fillStyle = `rgba(20,30,8,${(gr.alpha * 0.7).toFixed(3)})`;
      ctx.fillRect(x, y, gr.len * CELL, CELL);
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
        if (a > 1.0)  a = 1.0;

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
