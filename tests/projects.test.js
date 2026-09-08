import test from 'node:test';
import assert from 'node:assert/strict';
import { isActive, normalizeRepositories, selectProjects } from '../project-model.js';
import { fetchRepositories } from '../scripts/sync-repositories.mjs';

const now = Date.parse('2026-09-08T12:00:00Z');
const repo = (name, days, extra = {}) => ({
  name, pushedAt: new Date(now - days * 86400000).toISOString(),
  description: '', language: 'Java', category: 'mods', archived: false, ...extra
});

test('activity includes the exact cutoff and excludes older or archived repos', () => {
  assert.equal(isActive(repo('cutoff', 90), 90, now), true);
  assert.equal(isActive(repo('older', 90.001), 90, now), false);
  assert.equal(isActive(repo('archived', 1, { archived: true }), 90, now), false);
  assert.equal(isActive(repo('unknown', 1, { pushedAt: null }), 90, now), false);
});

test('active maintained forks are included, with featured exceptions and newest first', () => {
  const result = selectProjects([
    repo('older', 200), repo('fork', 1, { fork: true }), repo('recent', 2),
    repo('featured', 300, { featured: true }), repo('archived', 1, { archived: true, featured: true })
  ], { now });
  assert.deepEqual(result.map(r => r.name), ['featured', 'fork', 'recent']);
});

test('archive and search remain available independently of the active cutoff', () => {
  const repos = [repo('older', 200), repo('fork', 1, { fork: true }), repo('archived', 1, { archived: true })];
  assert.deepEqual(selectProjects(repos, { scope: 'archive', now }).map(r => r.name), ['archived', 'older']);
  assert.equal(selectProjects(repos, { scope: 'all', query: 'OLDER', category: 'mods', now }).length, 1);
  assert.equal(selectProjects(repos, { scope: 'all', query: 'older', category: 'web', now }).length, 0);
});

test('private repositories and explicit exclusions never enter the public snapshot', () => {
  const inputs = [
    { name: 'private', private: true }, { name: 'excluded', private: false },
    { name: 'public', private: false, description: null, fork: true }
  ];
  const settings = { excluded: ['excluded'], overrides: { public: { description: 'A maintained fork', category: 'mods' } } };
  const result = normalizeRepositories(inputs, settings);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'public');
  assert.equal(result[0].description, 'A maintained fork');
  assert.equal(result[0].fork, true);
});

test('repository discovery paginates beyond 100 entries', async () => {
  const calls = [];
  const result = await fetchRepositories('vrrdnt', async path => {
    calls.push(path);
    return path.includes('page=2') ? [{ name: 'last' }] : Array.from({ length: 100 }, (_, i) => ({ name: String(i) }));
  });
  assert.equal(result.length, 101);
  assert.equal(calls.length, 2);
  assert.equal(result.at(-1).name, 'last');
});

test('API failures are surfaced rather than mistaken for an empty list', async () => {
  await assert.rejects(fetchRepositories('vrrdnt', async () => { throw new Error('HTTP 403'); }), /403/);
});
