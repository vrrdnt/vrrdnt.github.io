import { createWorld, step } from './life-core.js';
import { OSCILLATORS } from './life-patterns.js';

export function oscillatorFrames(pattern) {
  const world = createWorld(Math.max(...pattern.rows.map(row => row.length)) + 40, pattern.rows.length + 40);
  pattern.rows.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell === 'O') world.alive.add((y + 20) * world.cols + x + 20);
  }));
  const frames = [];
  for (let i = 0; i < pattern.period; i++) {
    frames.push([...world.alive].map(cell => [cell % world.cols, Math.floor(cell / world.cols)]));
    step(world);
  }
  return frames;
}

export function assignOscillators(repos) {
  // Assign against the complete snapshot, never the filtered or push-sorted view.
  return new Map([...repos].sort((a, b) => a.name.localeCompare(b.name, 'en')).map((repo, index) => {
    const base = OSCILLATORS[index % OSCILLATORS.length];
    const group = Math.floor(index / OSCILLATORS.length);
    if (!group) return [repo.name, base];
    // Future entries get distinct, separated oscillator pairs instead of duplicates.
    const other = OSCILLATORS[(index + group) % OSCILLATORS.length];
    const width = Math.max(...base.rows.map(row => row.length));
    const rows = Array.from({ length: Math.max(base.rows.length, other.rows.length) }, (_, y) =>
      (base.rows[y] || '').padEnd(width + 20 + group, '.') + (other.rows[y] || ''));
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    return [repo.name, { name: `${base.name} / ${other.name}`, period: base.period * other.period / gcd(base.period, other.period), rows }];
  }));
}

export function startLifeIcons() {
  const toggle = document.querySelector('#motion-toggle');
  const visible = new Set();
  const entries = new WeakMap();
  const loops = new Map();
  let timer;
  const paused = () => document.hidden || toggle.getAttribute('aria-pressed') === 'true';

  function draw(canvas) {
    const entry = entries.get(canvas);
    const { frames, minX, minY, width, height } = entry.loop;
    const context = canvas.getContext('2d');
    const size = Math.min(12, Math.floor(80 / (Math.max(width, height) + 2)));
    const left = Math.floor((80 - width * size) / 2);
    const top = Math.floor((80 - height * size) / 2);
    context.clearRect(0, 0, 80, 80);
    context.fillStyle = getComputedStyle(canvas).color;
    for (const [x, y] of frames[entry.frame]) {
      context.fillRect(left + (x - minX) * size, top + (y - minY) * size, Math.max(1, size - 1), Math.max(1, size - 1));
    }
    canvas.dataset.frame = entry.frame;
  }

  function schedule() {
    clearTimeout(timer);
    if (paused() || !visible.size) return;
    timer = setTimeout(() => {
      for (const canvas of visible) {
        const entry = entries.get(canvas);
        entry.frame = (entry.frame + 1) % entry.loop.frames.length;
        draw(canvas);
      }
      schedule();
    }, 333);
  }

  const observer = new IntersectionObserver(changes => {
    for (const { target, isIntersecting } of changes) {
      if (!target.isConnected) continue;
      if (isIntersecting) visible.add(target); else visible.delete(target);
    }
    schedule();
  });
  document.addEventListener('life:motion', schedule);
  document.addEventListener('visibilitychange', schedule);

  return {
    create(pattern) {
      if (!loops.has(pattern)) {
        const frames = oscillatorFrames(pattern);
        const cells = frames.flat();
        const minX = Math.min(...cells.map(cell => cell[0]));
        const minY = Math.min(...cells.map(cell => cell[1]));
        loops.set(pattern, { frames, minX, minY,
          width: Math.max(...cells.map(cell => cell[0])) - minX + 1,
          height: Math.max(...cells.map(cell => cell[1])) - minY + 1 });
      }
      const canvas = document.createElement('canvas');
      canvas.className = 'entry-life';
      canvas.width = canvas.height = 80;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.title = `${pattern.name} · period ${pattern.period}`;
      canvas.dataset.pattern = pattern.name;
      entries.set(canvas, { loop: loops.get(pattern), frame: 0 });
      return canvas;
    },
    refresh() {
      observer.disconnect();
      visible.clear();
      document.querySelectorAll('.entry-life').forEach(canvas => { draw(canvas); observer.observe(canvas); });
      schedule();
    }
  };
}
