import { createWorld, stamp, step, seedCorner, PATTERNS } from './life-core.js';

export function startLife() {
  const canvas = document.querySelector('#life-field');
  const context = canvas.getContext('2d');
  const toggle = document.querySelector('#motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cellSize = 6;
  let world;
  let paused = reduced.matches;
  let frame = 0;
  let lastStep = 0;
  let emissions = 0;
  let traces = new Map();
  const lastEmission = { scroll: -Infinity, hover: -Infinity };
  let scrollIntentUntil = 0;
  let width = 0, height = 0;
  try { if (localStorage.getItem('life-paused') === 'true') paused = true; } catch { /* Optional preference. */ }

  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function recordCells() {
    for (const cell of world.alive) {
      const trace = traces.get(cell);
      if (trace) trace.last = world.generation;
      else traces.set(cell, { first: world.generation, last: world.generation });
    }
    for (const [cell, trace] of traces) {
      if (world.generation - trace.last > 96) traces.delete(cell);
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.shadowBlur = 0;
    context.lineWidth = 1;
    for (const [cell, trace] of traces) {
      const col = cell % world.cols, row = Math.floor(cell / world.cols);
      const living = world.alive.has(cell);
      const age = world.generation - trace.first;
      const density = living ? Math.max(.25, 1 - age / 480) : .45 * Math.max(0, 1 - (world.generation - trace.last) / 96);
      // Ordered dithering is a rendering treatment; it never changes B3/S23.
      if (bayer[(row % 4) * 4 + col % 4] / 16 >= density) continue;
      const x = col * cellSize + 1, y = row * cellSize + 1;
      context.globalAlpha = living ? .35 + density * .5 : density * .48;
      context.fillStyle = living ? '#aace79' : '#829661';
      context.strokeStyle = '#aace79';
      const glyph = (col * 7 + row * 3) % 5;
      if (!living || age > 160) {
        context.fillRect(x + 2, y + 2, 1, 1);
        if (density > .5) context.fillRect(x, y, 1, 1);
      } else if (glyph === 0) {
        context.strokeRect(x + .5, y + .5, 3, 3);
      } else if (glyph === 1) {
        context.fillRect(x + 2, y, 1, 5);
        context.fillRect(x, y + 2, 5, 1);
      } else if (glyph === 2) {
        context.beginPath();
        context.moveTo(x + .5, y + .5); context.lineTo(x + 4.5, y + 4.5);
        context.moveTo(x + 4.5, y + .5); context.lineTo(x + .5, y + 4.5);
        context.stroke();
      } else {
        context.fillRect(x + 1, y + 1, 3, 3);
      }
    }
    context.globalAlpha = 1;
    document.querySelector('#generation').textContent = String(world.generation).padStart(6, '0');
    document.querySelector('#population').textContent = String(world.alive.size).padStart(4, '0');
  }

  function resize() {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const next = createWorld(Math.ceil(width / cellSize), Math.ceil(height / cellSize));
    if (world) {
      const remappedTraces = new Map();
      for (const [cell, trace] of traces) {
        const x = cell % world.cols, y = Math.floor(cell / world.cols);
        if (x < next.cols && y < next.rows) remappedTraces.set(y * next.cols + x, trace);
      }
      traces = remappedTraces;
      next.generation = world.generation;
      for (const cell of world.alive) {
        const x = cell % world.cols, y = Math.floor(cell / world.cols);
        if (x < next.cols && y < next.rows) next.alive.add(y * next.cols + x);
      }
    } else {
      seedCorner(next);
    }
    world = next;
    recordCells();
    draw();
  }

  function loop(time) {
    if (paused || document.hidden) { frame = 0; return; }
    if (time - lastStep >= 62.5 && (world.alive.size || traces.size)) {
      step(world); recordCells(); draw(); lastStep = time;
    }
    frame = requestAnimationFrame(loop);
  }
  function updateMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    toggle.textContent = paused ? 'resume' : 'pause';
    toggle.setAttribute('aria-pressed', String(paused));
    document.querySelector('#field-state').textContent = paused ? 'paused' : 'running';
    if (!paused && !document.hidden) frame = requestAnimationFrame(loop);
    draw();
  }

  function emit(element, { pattern = 'glider', reason = 'interaction', manual = false, reverse, point } = {}) {
    const now = performance.now();
    if (!manual && (paused || (reason === 'hover' && now < scrollIntentUntil) || now - (lastEmission[reason] ?? -Infinity) < 300)) return false;
    lastEmission[reason] = now;
    const origin = element?.querySelector('.entry-origin') || element;
    const box = origin?.getBoundingClientRect();
    const x = point ? point.clientX : box ? box.left + Math.min(10, box.width / 2) : width / 2;
    const y = point ? point.clientY : box ? box.top + box.height / 2 : height / 2;
    const shape = PATTERNS[pattern] || PATTERNS.glider;
    const col = Math.max(0, Math.min(world.cols - shape[0].length, Math.floor(x / cellSize) - 1));
    const row = Math.max(0, Math.min(world.rows - shape.length, Math.floor(y / cellSize) - 1));
    stamp(world, pattern, col, row, x > width * .7, reverse ?? y > height * .65);
    // Refresh the rendering age of this explicitly seeded footprint.
    for (let dy = 0; dy < shape.length; dy++) for (let dx = 0; dx < shape[0].length; dx++) {
      const cell = (row + dy) * world.cols + col + dx;
      if (world.alive.has(cell)) traces.set(cell, { first: world.generation, last: world.generation });
    }
    emissions++;
    document.querySelector('#emissions').textContent = String(emissions).padStart(3, '0');
    draw();
    canvas.dispatchEvent(new CustomEvent('life:emit', { detail: { pattern, reason, emissions, x, y } }));
    return true;
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('life-paused', String(paused)); } catch { /* Optional preference. */ }
    updateMotion();
  });
  document.querySelector('#clear-field').addEventListener('click', () => { world.alive.clear(); traces.clear(); draw(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
  document.addEventListener('visibilitychange', updateMotion);
  window.addEventListener('resize', resize, { passive: true });
  resize();
  updateMotion();

  let previousScroll = scrollY;
  let distance = 0;
  let queued = false;
  function markScrollIntent() { scrollIntentUntil = performance.now() + 900; }
  window.addEventListener('wheel', markScrollIntent, { passive: true });
  window.addEventListener('touchmove', markScrollIntent, { passive: true });
  window.addEventListener('keydown', event => {
    if (!event.target.matches('input, textarea, select') && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) markScrollIntent();
  });
  window.addEventListener('pointermove', event => {
    if (event.buttons === 1 && event.clientX >= document.documentElement.clientWidth - 18) markScrollIntent();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    const delta = scrollY - previousScroll;
    previousScroll = scrollY;
    if (performance.now() > scrollIntentUntil) { distance = 0; return; }
    distance += Math.abs(delta);
    if (distance < 100 || queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const candidates = [...document.querySelectorAll('.repo-card, .tool-link, .log-entry')].filter(element => {
        const box = element.getBoundingClientRect();
        return box.top > 115 && box.top < innerHeight - 135;
      });
      const entering = delta > 0 ? candidates.at(-1) : candidates[0];
      if (entering && emit(entering, { pattern: emissions % 4 === 3 ? 'spaceship' : 'glider', reason: 'scroll', reverse: delta < 0 })) distance = 0;
    });
  }, { passive: true });
  return { emit };
}
