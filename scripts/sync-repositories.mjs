import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalizeRepositories } from '../project-model.js';

const root = new URL('../', import.meta.url);

export async function github(path, request = fetch) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'vrrdnt-terminal' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await request(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
  return response.json();
}

export async function fetchRepositories(username, request = github) {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await request(`/users/${encodeURIComponent(username)}/repos?type=owner&per_page=100&sort=pushed&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}

async function sync() {
  const settings = JSON.parse(await readFile(new URL('data/project-settings.json', root), 'utf8'));
  try {
    const repos = normalizeRepositories(await fetchRepositories(settings.username), settings);
    const latest = [...repos].filter(repo => !repo.archived).sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt)).slice(0, 6);
    const activity = (await Promise.all(latest.map(async repo => {
      try {
        const [commit] = await github(`/repos/${settings.username}/${encodeURIComponent(repo.name)}/commits?per_page=1`);
        return commit ? { repo: repo.name, title: commit.commit.message.split('\n')[0], date: commit.commit.committer.date, url: commit.html_url } : null;
      } catch { return null; }
    }))).filter(Boolean).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const snapshot = { syncedAt: new Date().toISOString(), activeDays: settings.activeDays, repos, activity };
    const temporary = new URL('data/repositories.json.tmp', root);
    await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n');
    await rename(temporary, new URL('data/repositories.json', root));
    console.log(`Synced ${repos.length} public repositories and ${activity.length} recent commits.`);
  } catch (error) {
    // A failed refresh must never replace the last usable public snapshot.
    const cached = JSON.parse(await readFile(new URL('data/repositories.json', root), 'utf8'));
    if (!Array.isArray(cached.repos)) throw error;
    console.warn(`Refresh unavailable (${error.message}); retaining snapshot from ${cached.syncedAt}.`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await sync();
