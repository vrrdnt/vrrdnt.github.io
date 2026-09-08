import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'terminal.css', 'app.js', 'life.js', 'life-core.js', 'project-model.js', 'favicon.svg', 'vs-tools']) {
  await cp(new URL(file, root), new URL(file, output), { recursive: true });
}
await mkdir(new URL('data/', output), { recursive: true });
const data = JSON.parse(await readFile(new URL('data/repositories.json', root), 'utf8'));
if (!Array.isArray(data.repos) || !data.syncedAt) throw new Error('Invalid repository snapshot');
await writeFile(new URL('data/repositories.json', output), JSON.stringify(data));
await writeFile(new URL('.nojekyll', output), '');
console.log(`Built static site with ${data.repos.length} repositories and existing Vintage Story tools.`);
