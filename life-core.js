// B3/S23, finite boundary. Cells outside the field are dead.
export const PATTERNS = {
  gun: [
    '........................O...........',
    '......................O.O...........',
    '............OO......OO............OO',
    '...........O...O....OO............OO',
    'OO........O.....O...OO..............',
    'OO........O...O.OO....O.O...........',
    '..........O.....O.......O...........',
    '...........O...O....................',
    '............OO......................'
  ],
  glider: ['.O.', '..O', 'OOO'],
  spaceship: ['.O..O', 'O....', 'O...O', 'OOOO.'],
  pulsar: ['..OOO...OOO..', '.............', 'O....O.O....O', 'O....O.O....O', 'O....O.O....O', '..OOO...OOO..', '.............', '..OOO...OOO..', 'O....O.O....O', 'O....O.O....O', 'O....O.O....O', '.............', '..OOO...OOO..'],
  pentomino: ['.OO', 'OO.', '.O.'],
  blinker: ['OOO']
};

export function createWorld(cols, rows) {
  return { cols, rows, alive: new Set(), generation: 0 };
}

export function seedCorner(world) {
  // Parallel lanes keep the sources from destroying one another.
  stamp(world, 'gun', 4, 21);
  stamp(world, 'gun', Math.max(0, Math.min(22, world.cols - 37)), 4);
}

export function stamp(world, name, x, y, flipX = false, flipY = false) {
  const pattern = PATTERNS[name] || PATTERNS.glider;
  pattern.forEach((row, dy) => [...row].forEach((cell, dx) => {
    if (cell !== 'O') return;
    const col = Math.floor(x) + (flipX ? pattern[0].length - 1 - dx : dx);
    const line = Math.floor(y) + (flipY ? pattern.length - 1 - dy : dy);
    if (col >= 0 && col < world.cols && line >= 0 && line < world.rows) world.alive.add(line * world.cols + col);
  }));
}

export function step(world) {
  const counts = new Map();
  for (const cell of world.alive) {
    const x = cell % world.cols;
    const y = Math.floor(cell / world.cols);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || x + dx < 0 || x + dx >= world.cols || y + dy < 0 || y + dy >= world.rows) continue;
      const neighbor = (y + dy) * world.cols + x + dx;
      counts.set(neighbor, (counts.get(neighbor) || 0) + 1);
    }
  }
  const next = new Set();
  for (const [cell, count] of counts) if (count === 3 || (count === 2 && world.alive.has(cell))) next.add(cell);
  world.alive = next;
  world.generation++;
}
