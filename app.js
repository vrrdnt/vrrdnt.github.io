import { isActive, selectProjects } from './project-model.js';
import { startLife } from './life.js';

const $ = selector => document.querySelector(selector);
const life = startLife();
const state = { repos: [], activity: [], days: 90, scope: 'active', category: 'all', query: '' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function link(text, url, className) {
  const node = el('a', className, text);
  node.href = safeUrl(url) || 'https://github.com/vrrdnt';
  return node;
}
function age(date) {
  const days = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 86400000));
  return days === 0 ? 'today' : days < 365 ? days + 'd ago' : Math.floor(days / 365) + 'y ago';
}

function repoCard(repo) {
  const card = el('details', 'repo-card');
  card.id = 'repo-' + repo.name;
  const summary = el('summary');
  const origin = el('span', 'entry-origin', '›');
  origin.setAttribute('aria-hidden', 'true');
  const heading = el('div', 'repo-heading');
  heading.append(el('h3', '', repo.name));
  if (repo.fork) heading.append(el('span', 'repo-badge', 'fork'));
  if (repo.archived) heading.append(el('span', 'repo-badge', 'archived'));
  if (repo.featured) heading.append(el('span', 'repo-badge', 'featured'));
  const inspect = el('span', 'inspect-label', '[+]');
  inspect.setAttribute('aria-hidden', 'true');
  heading.append(inspect);
  const bottom = el('div', 'repo-bottomline');
  const time = el('time', '', 'pushed ' + age(repo.pushedAt));
  time.dateTime = repo.pushedAt;
  time.title = new Date(repo.pushedAt).toLocaleString();
  bottom.append(el('span', '', repo.language), el('span', 'repo-type', repo.category), time);
  summary.append(origin, heading, el('p', 'repo-description', repo.description), bottom);
  const detail = el('div', 'repo-details');
  const commit = state.activity.find(item => item.repo === repo.name);
  detail.append(el('p', '', commit ? 'commit: ' + commit.title :
    repo.archived ? 'Archived on GitHub.' : 'last push: ' + new Date(repo.pushedAt).toLocaleString()));
  const actions = el('div', 'repo-actions');
  if (safeUrl(repo.homepage)) actions.append(link('project ↗', repo.homepage));
  actions.append(link('source ↗', repo.url), link('releases ↗', repo.url + '/releases'));
  if (commit) actions.append(link('commit ↗', commit.url));
  detail.append(actions);
  card.append(summary, detail);
  card.addEventListener('toggle', () => {
    inspect.textContent = card.open ? '[-]' : '[+]';
    if (card.open) history.replaceState(null, '', '#' + encodeURIComponent(card.id));
    else if (location.hash === '#' + encodeURIComponent(card.id)) history.replaceState(null, '', '#projects');
  });
  summary.addEventListener('click', event => life.emit(summary, {
    pattern: 'glider', reason: 'inspect', point: event.detail ? event : undefined
  }));
  return card;
}

function renderProjects() {
  const list = $('#project-list');
  const projects = selectProjects(state.repos, state);
  list.replaceChildren(...projects.map(repoCard));
  if (!projects.length) {
    const empty = el('div', 'empty-message', 'No projects match this view.');
    const reset = el('button', '', 'Show all repositories ↗');
    reset.addEventListener('click', () => resetFilters('all'));
    empty.append(reset);
    list.append(empty);
  }
  $('#project-count').textContent = String(projects.length).padStart(2, '0') + ' ' +
    (state.scope === 'archive' ? 'OLDER' : state.scope === 'active' ? 'ACTIVE' : 'REPOSITORIES');
  $('#result-status').textContent = projects.length + ' repositories shown.';
  document.querySelectorAll('[data-scope]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scope === state.scope)));
}
function resetFilters(scope) {
  Object.assign(state, { scope, category: 'all', query: '' });
  $('#category').value = 'all';
  $('#project-search').value = '';
  renderProjects();
}
function renderActivity() {
  const entries = state.activity.map(item => {
    const entry = link('', item.url, 'log-entry');
    const time = el('time', '', age(item.date));
    time.dateTime = item.date;
    time.title = new Date(item.date).toLocaleString();
    const body = el('div');
    body.append(el('strong', '', item.repo), el('p', '', item.title));
    entry.append(time, body, el('span', '', '↗'));
    return entry;
  });
  $('#activity-list').replaceChildren(...entries);
  if (!entries.length) $('#activity-list').append(link('Explore recent work on GitHub ↗', 'https://github.com/vrrdnt', 'log-entry'));
}
async function loadProjects() {
  try {
    const response = await fetch('/data/repositories.json');
    if (!response.ok) throw new Error('Snapshot unavailable');
    const data = await response.json();
    if (!Array.isArray(data.repos) || !Number.isFinite(Date.parse(data.syncedAt))) throw new Error('Invalid snapshot');
    state.repos = data.repos;
    state.activity = data.activity || [];
    state.days = data.activeDays;
    $('#active-days').textContent = state.days + 'd';
    $('#archive-count').textContent = state.repos.filter(repo => !isActive(repo, state.days)).length + ' repos ↗';
    const stale = Date.now() - Date.parse(data.syncedAt) > 86400000;
    $('#sync-note').textContent = (stale ? 'Cached snapshot' : 'Synced') + ' ' +
      new Date(data.syncedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) +
      ' · Public repos · Active = pushed within ' + state.days + ' days.';
    renderProjects();
    renderActivity();
    followHash();
    
  } catch {
    const message = el('div', 'empty-message', 'The project index could not be loaded.');
    const retry = el('button', '', 'Retry');
    retry.addEventListener('click', loadProjects);
    message.append(retry, link('Browse repositories on GitHub ↗', 'https://github.com/vrrdnt?tab=repositories'));
    $('#project-list').replaceChildren(message);
    $('#sync-note').textContent = 'Game tools and field controls are still available.';
    $('#activity-list').replaceChildren(link('See activity on GitHub ↗', 'https://github.com/vrrdnt', 'log-entry'));
  }
}
function openRepo(repo) {
  resetFilters('all');
  const card = document.getElementById('repo-' + repo.name);
  card.open = true;
  card.scrollIntoView({ block: 'start' });
  card.querySelector('summary').focus({ preventScroll: true });
}
function followHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (id.startsWith('repo-')) {
    const repo = state.repos.find(repo => 'repo-' + repo.name === id);
    if (repo) openRepo(repo);
  } else if (id && document.getElementById(id)) document.getElementById(id).scrollIntoView();
}

document.querySelectorAll('[data-scope]').forEach(button => button.addEventListener('click', () => {
  state.scope = button.dataset.scope;
  renderProjects();
  life.emit(button, { reason: 'filter' });
}));
$('#category').addEventListener('change', event => { state.category = event.target.value; renderProjects(); life.emit(event.target, { reason: 'filter' }); });
$('#project-search').addEventListener('input', event => { state.query = event.target.value; renderProjects(); });
$('#browse-archive').addEventListener('click', () => { resetFilters('archive'); $('#projects').scrollIntoView(); $('#project-search').focus({ preventScroll: true }); });
window.addEventListener('hashchange', followHash);
const navigation = [...document.querySelectorAll('.nav-link')];
const observer = new IntersectionObserver(() => {
  const sections = [...document.querySelectorAll('.content-section')];
  const current = sections.filter(section => section.getBoundingClientRect().top < innerHeight * .45).at(-1) || sections[0];
  navigation.forEach(item => {
    const active = item.hash === '#' + current.id;
    item.classList.toggle('selected', active);
    if (active) item.setAttribute('aria-current', 'location'); else item.removeAttribute('aria-current');
  });
}, { rootMargin: '-10% 0px -55% 0px' });
document.querySelectorAll('.section-heading').forEach(heading => observer.observe(heading));

const commandHistory = [];
let historyIndex = 0;
const input = $('#command-input');
const output = $('#command-output');
function report(text) {
  output.textContent = text;
  output.hidden = false;
}
function runCommand(command) {
  const [verb, ...args] = command.trim().split(/\s+/);
  const argument = args.join(' ');
  const target = verb === 'cd' ? argument : verb;
  if (!['pause', 'resume', 'clear', 'seed'].includes(verb)) life.emit(input, { reason: 'command' });
  if (verb === 'help') {
    report('ls [--all | --archive]  list repositories\nfind <text>            search all repositories\nopen <repository>      inspect a repository\ncd projects|tools|archive|about\nseed glider|spaceship|pulsar|pentomino|gun\npause / resume / clear  control the Conway field\n↑ ↓ command history    Esc dismiss output');
  } else if (verb === 'cat' && ['about.txt', 'conway.txt'].includes(argument)) {
    report(argument === 'about.txt' ? $('#about > p').textContent : [...document.querySelectorAll('.about-field p')].map(p => p.textContent).join('\n\n'));
  } else if (verb === 'ls' && ['archive', 'tools', 'tools/vintage-story'].includes(argument)) {
    document.getElementById(argument === 'archive' ? 'archive' : 'tools').scrollIntoView();
    output.hidden = true;
  } else if (verb === 'ls' || verb === 'active' || verb === 'all') {
    const scope = verb === 'all' || argument === '--all' ? 'all' : argument === '--archive' ? 'archive' : 'active';
    resetFilters(scope);
    $('#projects').scrollIntoView();
    report($('#result-status').textContent);
  } else if (verb === 'find') {
    resetFilters('all');
    state.query = argument;
    $('#project-search').value = argument;
    renderProjects();
    $('#projects').scrollIntoView();
    report($('#result-status').textContent);
  } else if (verb === 'open') {
    const repo = state.repos.find(repo => repo.name.toLowerCase() === argument.toLowerCase());
    if (repo) { openRepo(repo); report(repo.name); } else report('Repository not found: ' + argument);
  } else if (['projects', 'tools', 'archive', 'about'].includes(target)) {
    location.hash = target;
    document.getElementById(target).scrollIntoView();
    output.hidden = true;
  } else if (verb === 'seed') {
    const pattern = argument === 'lwss' ? 'spaceship' : argument;
    if (!['glider', 'spaceship', 'pulsar', 'pentomino', 'gun'].includes(pattern)) {
      report('Patterns: glider, spaceship, pulsar, pentomino, gun');
    } else {
      life.emit(input, { pattern, manual: true, reason: 'command' });
      report('seeded ' + pattern);
    }
  } else if (verb === 'pause' || verb === 'resume') {
    const paused = $('#motion-toggle').getAttribute('aria-pressed') === 'true';
    if ((verb === 'pause') !== paused) $('#motion-toggle').click();
    report('conway: ' + (verb === 'pause' ? 'paused' : 'running'));
  } else if (verb === 'clear') {
    $('#clear-field').click();
    output.hidden = true;
  } else {
    report('Unknown command: ' + verb + '\nType help for commands.');
  }
}
$('#command-form').addEventListener('submit', event => {
  event.preventDefault();
  const command = input.value.trim();
  if (!command) return;
  commandHistory.push(command);
  historyIndex = commandHistory.length;
  input.value = '';
  runCommand(command);
});
input.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    historyIndex = Math.max(0, Math.min(commandHistory.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
    input.value = commandHistory[historyIndex] || '';
  }
});
function focusFind() {
  input.value = 'find ';
  input.focus({ preventScroll: true });
}
$('#open-command').addEventListener('click', focusFind);
document.addEventListener('keydown', event => {
  const typing = event.target.matches('input, textarea, select, [contenteditable="true"]');
  if ((event.key === '/' && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
    event.preventDefault();
    focusFind();
  }
  if (event.key === 'Escape') { output.hidden = true; input.value = ''; }
});
document.querySelectorAll('.nav-link, .tool-link, .repo-actions a, .archive-button, .brand, .github-link').forEach(element => {
  element.addEventListener('click', event => life.emit(element, { point: event.detail ? event : undefined, reason: 'navigate' }));
});
let hoveredEntry = null;
document.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || (!event.movementX && !event.movementY)) return;
  const entry = event.target.closest('.repo-card summary');
  if (entry && entry !== hoveredEntry) life.emit(entry, { point: event, reason: 'hover' });
  hoveredEntry = entry;
}, { passive: true });
loadProjects();
