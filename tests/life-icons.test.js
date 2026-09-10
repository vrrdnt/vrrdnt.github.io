import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWorld, step } from '../life-core.js';
import { OSCILLATORS } from '../life-patterns.js';
import { oscillatorFrames, assignOscillators } from '../life-icons.js';

test('every icon evolves under B3/S23 and closes its loop without a reset', () => {
  for (const pattern of OSCILLATORS) {
    const frames = oscillatorFrames(pattern);
    const world = createWorld(Math.max(...pattern.rows.map(row => row.length)) + 40, pattern.rows.length + 40);
    const asSet = cells => new Set(cells.map(([x, y]) => y * world.cols + x));
    world.alive = asSet(frames[0]);
    for (let generation = 1; generation <= pattern.period; generation++) {
      step(world);
      assert.deepEqual(world.alive, asSet(frames[generation % pattern.period]), `${pattern.name}, generation ${generation}`);
      if (generation < pattern.period) assert.notDeepEqual(world.alive, asSet(frames[0]), `${pattern.name} must have its declared period`);
    }
    assert.ok(world.alive.size > 0);
  }
});

test('every current repository gets a distinct oscillator independent of input order', async () => {
  const { repos } = JSON.parse(await readFile(new URL('../data/repositories.json', import.meta.url), 'utf8'));
  const assignments = assignOscillators(repos);
  assert.equal(new Set([...assignments.values()].map(pattern => pattern.name)).size, repos.length);
  assert.deepEqual(assignments, assignOscillators([...repos].reverse()));
});

test('a growing repository list gets distinct looping pairs after the catalog is exhausted', () => {
  const repos = Array.from({ length: 70 }, (_, index) => ({ name: `repo-${String(index).padStart(2, '0')}` }));
  const patterns = [...assignOscillators(repos).values()];
  assert.equal(new Set(patterns.map(pattern => pattern.rows.join('\n'))).size, repos.length);
  for (const pattern of patterns.slice(OSCILLATORS.length)) {
    const frames = oscillatorFrames(pattern);
    const world = createWorld(Math.max(...pattern.rows.map(row => row.length)) + 40, pattern.rows.length + 40);
    world.alive = new Set(frames.at(-1).map(([x, y]) => y * world.cols + x));
    step(world);
    assert.deepEqual(world.alive, new Set(frames[0].map(([x, y]) => y * world.cols + x)), pattern.name);
  }
});
