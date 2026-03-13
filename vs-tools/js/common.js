// === VS Tools Site Chrome ===
const VS_TOOLS = [
  { id: 'alloys',  name: 'Alloys',  href: 'alloys.html',  accent: '#cd7f32', desc: 'Calculate perfect alloy ratios for your crucible' },
  { id: 'meals',   name: 'Meals',   href: 'meals.html',   accent: '#4ade80', desc: 'Plan optimal meals for balanced nutrition' },
  { id: 'armor',   name: 'Armor',   href: 'armor.html',   accent: '#60a5fa', desc: 'Compare armor sets and damage reduction' },
  { id: 'farming', name: 'Farming', href: 'farming.html', accent: '#a3e635', desc: 'Plan crop rotations to maintain soil fertility' },
  { id: 'steel',   name: 'Steel',   href: 'steel.html',   accent: '#f87171', desc: 'Track your steel making progression' },
];

function initSiteChrome() {
  const app = document.querySelector('.app');
  if (!app) return;

  // Build nav
  const nav = document.createElement('nav');
  nav.className = 'site-nav';

  const brand = document.createElement('a');
  brand.className = 'site-nav-brand';
  brand.href = 'index.html';
  brand.textContent = 'VS Tools';
  nav.appendChild(brand);

  const links = document.createElement('div');
  links.className = 'site-nav-links';

  const path = location.pathname;
  for (const tool of VS_TOOLS) {
    const a = document.createElement('a');
    a.className = 'site-nav-link';
    a.href = tool.href;
    a.textContent = tool.name;
    if (path.endsWith(tool.href)) {
      a.classList.add('active');
    }
    links.appendChild(a);
  }

  nav.appendChild(links);

  // Hamburger toggle
  const toggle = document.createElement('button');
  toggle.className = 'site-nav-toggle';
  toggle.setAttribute('aria-label', 'Menu');
  toggle.innerHTML = '&#9776;';
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  nav.appendChild(toggle);

  // Close menu when clicking a link on mobile
  links.addEventListener('click', () => links.classList.remove('open'));

  app.prepend(nav);

  // Build footer (only if page doesn't already have one)
  if (!app.querySelector('footer')) {
    const footer = document.createElement('footer');
    footer.innerHTML = `
      <p>Data and images sourced from the <a href="https://wiki.vintagestory.at/" target="_blank" rel="noopener">Vintage Story Wiki</a>, licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>.</p>
      <p>Vintage Story is developed by <a href="https://www.vintagestory.at/" target="_blank" rel="noopener">Anego Studios</a>.</p>
    `;
    app.appendChild(footer);
  }
}

// Shared utility: copy share link
function copyShareLink() {
  navigator.clipboard.writeText(location.href).then(() => {
    const btn = document.getElementById('shareBtn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

document.addEventListener('DOMContentLoaded', initSiteChrome);
