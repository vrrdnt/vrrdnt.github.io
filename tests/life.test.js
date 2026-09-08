import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, stamp, step, seedCorner } from '../life-core.js';

test('the upper-left sources persist and send gliders progressively outward', () => {
  const world = createWorld(250, 200);
  seedCorner(world);
  const original = new Set(world.alive);
  assert.equal(original.size, 72);
  for (let i = 0; i < 120; i++) step(world);
  assert.equal(world.alive.size, 112);
  assert.ok([...original].every(cell => world.alive.has(cell)));
  assert.ok(Math.max(...[...world.alive].map(cell => cell % world.cols)) > 60);
  for (let i = 0; i < 360; i++) step(world);
  assert.equal(world.alive.size, 232);
  assert.ok([...original].every(cell => world.alive.has(cell)));
});

test('both corner sources fit a narrow mobile field and survive edge exits', () => {
  const world = createWorld(54, 120);
  seedCorner(world);
  const original = new Set(world.alive);
  assert.equal(original.size, 72);
  for (let i = 0; i < 120; i++) step(world);
  assert.ok([...original].every(cell => world.alive.has(cell)));
});

test('a glider translates one cell diagonally after four generations', () => {
  const world = createWorld(30, 30);
  stamp(world, 'glider', 5, 5);
  for (let i = 0; i < 4; i++) step(world);
  const expected = createWorld(30, 30);
  stamp(expected, 'glider', 6, 6);
  assert.deepEqual(world.alive, expected.alive);
});

test('a mirrored glider travels outwards in the opposite direction', () => {
  const world = createWorld(30, 30);
  stamp(world, 'glider', 10, 10, true, true);
  for (let i = 0; i < 4; i++) step(world);
  const expected = createWorld(30, 30);
  stamp(expected, 'glider', 9, 9, true, true);
  assert.deepEqual(world.alive, expected.alive);
});

test('a pulsar returns to its original 48 cells after three generations', () => {
  const world = createWorld(40, 40);
  stamp(world, 'pulsar', 10, 10);
  const initial = new Set(world.alive);
  assert.equal(initial.size, 48);
  step(world);
  assert.notDeepEqual(world.alive, initial);
  step(world);
  step(world);
  assert.deepEqual(world.alive, initial);
});

test('a lightweight spaceship translates two cells left after four generations', () => {
  const world = createWorld(40, 40);
  stamp(world, 'spaceship', 10, 10);
  for (let i = 0; i < 4; i++) step(world);
  const expected = createWorld(40, 40);
  stamp(expected, 'spaceship', 8, 10);
  assert.deepEqual(world.alive, expected.alive);
});

test('a blinker oscillates with period two', () => {
  const world = createWorld(10, 10);
  stamp(world, 'blinker', 3, 4);
  const original = new Set(world.alive);
  step(world);
  assert.deepEqual(world.alive, new Set([34, 44, 54]));
  step(world);
  assert.deepEqual(world.alive, original);
});

test('isolated cells die and the finite boundary does not wrap', () => {
  const world = createWorld(5, 5);
  world.alive = new Set([0, 4, 20, 24]);
  step(world);
  assert.equal(world.alive.size, 0);
  stamp(world, 'pulsar', -5, -5);
  assert.ok([...world.alive].every(cell => cell >= 0 && cell < 25));
});
