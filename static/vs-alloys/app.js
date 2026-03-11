// === Alloy Data ===
const METALS = {
  copper:   { name: 'Copper',   color: '#d97734', icon: 'img/Ingot-copper.png' },
  tin:      { name: 'Tin',      color: '#8faab3', icon: 'img/Ingot-tin.png' },
  bismuth:  { name: 'Bismuth',  color: '#6b8e7b', icon: 'img/Ingot-bismuth.png' },
  zinc:     { name: 'Zinc',     color: '#a3b8c8', icon: 'img/Ingot-zinc.png' },
  gold:     { name: 'Gold',     color: '#e8c44a', icon: 'img/Ingot-gold.png' },
  silver:   { name: 'Silver',   color: '#c0c0c0', icon: 'img/Ingot-silver.png' },
  lead:     { name: 'Lead',     color: '#6b6b80', icon: 'img/Ingot-lead.png' },
  nickel:   { name: 'Nickel',   color: '#9a9a7a', icon: 'img/Ingot-nickel.png' },
};

const ALLOYS = [
  {
    id: 'tin-bronze',
    name: 'Tin Bronze',
    tier: 'mid',
    tierLabel: 'Bronze Age',
    desc: 'A reliable, versatile bronze alloy. The classic choice for tools and weapons.',
    accent: '#cd7f32',
    icon: 'img/Ingot-tinbronze.png',
    components: [
      { metal: 'copper', min: 88, max: 92 },
      { metal: 'tin',    min: 8,  max: 12 },
    ],
  },
  {
    id: 'bismuth-bronze',
    name: 'Bismuth Bronze',
    tier: 'mid',
    tierLabel: 'Bronze Age',
    desc: 'A three-component bronze. Useful when tin is scarce.',
    accent: '#6b8e7b',
    icon: 'img/Ingot-bismuthbronze.png',
    components: [
      { metal: 'copper',  min: 50, max: 70 },
      { metal: 'bismuth', min: 10, max: 20 },
      { metal: 'zinc',    min: 20, max: 30 },
    ],
  },
  {
    id: 'black-bronze',
    name: 'Black Bronze',
    tier: 'mid',
    tierLabel: 'Bronze Age',
    desc: 'A decorative bronze with gold and silver. Same tool tier as other bronzes.',
    accent: '#4a4a5a',
    icon: 'img/Ingot-blackbronze.png',
    components: [
      { metal: 'copper', min: 68, max: 84 },
      { metal: 'gold',   min: 8,  max: 16 },
      { metal: 'silver', min: 8,  max: 16 },
    ],
  },
  {
    id: 'brass',
    name: 'Brass',
    tier: 'utility',
    tierLabel: 'Utility',
    desc: 'Used for lanterns, locust nests, and various mechanical parts.',
    accent: '#c5a83d',
    icon: 'img/Ingot-brass.png',
    components: [
      { metal: 'copper', min: 60, max: 70 },
      { metal: 'zinc',   min: 30, max: 40 },
    ],
  },
  {
    id: 'cupronickel',
    name: 'Cupronickel',
    tier: 'utility',
    tierLabel: 'Utility',
    desc: 'A silver-colored alloy used for coinage and decoration.',
    accent: '#9a9a7a',
    icon: 'img/Ingot-cupronickel.png',
    components: [
      { metal: 'copper', min: 65, max: 75 },
      { metal: 'nickel', min: 25, max: 35 },
    ],
  },
  {
    id: 'electrum',
    name: 'Electrum',
    tier: 'high',
    tierLabel: 'Precious',
    desc: 'A shimmering alloy of gold and silver, prized for its beauty.',
    accent: '#e0c860',
    icon: 'img/Ingot-electrum.png',
    components: [
      { metal: 'gold',   min: 40, max: 60 },
      { metal: 'silver', min: 40, max: 60 },
    ],
  },
  {
    id: 'molybdochalkos',
    name: 'Molybdochalkos',
    tier: 'utility',
    tierLabel: 'Utility',
    desc: 'A lead-heavy alloy with a small copper component.',
    accent: '#6b6b80',
    icon: 'img/Ingot-molybdochalkos.png',
    components: [
      { metal: 'lead',   min: 88, max: 92 },
      { metal: 'copper', min: 8,  max: 12 },
    ],
  },
  {
    id: 'lead-solder',
    name: 'Lead Solder',
    tier: 'utility',
    tierLabel: 'Utility',
    desc: 'Equal parts lead and tin. Used for joining metals.',
    accent: '#7a7a90',
    icon: 'img/Ingot-leadsolder.png',
    components: [
      { metal: 'lead', min: 45, max: 55 },
      { metal: 'tin',  min: 45, max: 55 },
    ],
  },
  {
    id: 'silver-solder',
    name: 'Silver Solder',
    tier: 'utility',
    tierLabel: 'Utility',
    desc: 'Silver and tin solder for finer metalwork.',
    accent: '#b0b0c0',
    icon: 'img/Ingot-silversolder.png',
    components: [
      { metal: 'silver', min: 40, max: 50 },
      { metal: 'tin',    min: 50, max: 60 },
    ],
  },
];

// === State ===
let selectedAlloy = null;
let sliderValues = {};  // metal -> current percentage
let multiplier = 1;     // number of crucible batches

// === DOM refs ===
const alloyGrid = document.getElementById('alloyGrid');
const calculator = document.getElementById('calculator');
const alloyTitle = document.getElementById('alloyTitle');
const alloyDesc = document.getElementById('alloyDesc');
const slidersContainer = document.getElementById('slidersContainer');
const ratioStatus = document.getElementById('ratioStatus');
const ingotCount = document.getElementById('ingotCount');
const nuggetTotal = document.getElementById('nuggetTotal');
const nuggetBreakdown = document.getElementById('nuggetBreakdown');
const crucibleVisual = document.getElementById('crucibleVisual');

// === Build alloy selection cards ===
function buildAlloyGrid() {
  alloyGrid.innerHTML = '';
  for (const alloy of ALLOYS) {
    const card = document.createElement('div');
    card.className = 'alloy-card';
    card.dataset.id = alloy.id;
    card.style.setProperty('--card-accent', alloy.accent);

    const tierClass = alloy.tier === 'mid' ? 'tier-mid' :
                      alloy.tier === 'high' ? 'tier-high' :
                      alloy.tier === 'low' ? 'tier-low' : 'tier-utility';

    const metals = alloy.components.map(c => METALS[c.metal].name).join(' + ');

    card.innerHTML = `
      <img class="alloy-card-icon" src="${alloy.icon}" alt="${alloy.name}" width="48" height="48">
      <span class="alloy-card-tier ${tierClass}">${alloy.tierLabel}</span>
      <div class="alloy-card-name">${alloy.name}</div>
      <div class="alloy-card-metals">${metals}</div>
    `;

    card.addEventListener('click', () => selectAlloy(alloy));
    alloyGrid.appendChild(card);
  }
}

// === Select an alloy ===
function selectAlloy(alloy) {
  selectedAlloy = alloy;
  multiplier = 1;

  // Update active card
  document.querySelectorAll('.alloy-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.alloy-card[data-id="${alloy.id}"]`).classList.add('active');

  // Init slider values to midpoint of valid ranges
  sliderValues = {};
  for (const comp of alloy.components) {
    sliderValues[comp.metal] = Math.round((comp.min + comp.max) / 2);
  }
  normalizeSliders();

  // Show calculator
  alloyTitle.textContent = alloy.name;
  alloyDesc.textContent = alloy.desc;
  calculator.style.display = '';

  buildSliders();
  updateResults();

  // Scroll to calculator
  calculator.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// === Normalize sliders so they sum to 100, respecting min/max bounds ===
function normalizeSliders(changedMetal) {
  const alloy = selectedAlloy;
  if (!alloy) return;

  const compMap = {};
  for (const c of alloy.components) compMap[c.metal] = c;
  const metals = alloy.components.map(c => c.metal);

  if (changedMetal) {
    // Distribute the remainder among other metals proportionally, then fix bounds
    const others = metals.filter(m => m !== changedMetal);
    const othersTotal = others.reduce((s, m) => s + sliderValues[m], 0);
    const remaining = 100 - sliderValues[changedMetal];

    if (othersTotal === 0) {
      const each = Math.floor(remaining / others.length);
      others.forEach((m, i) => {
        sliderValues[m] = i === others.length - 1
          ? remaining - each * (others.length - 1)
          : each;
      });
    } else {
      let allocated = 0;
      others.forEach((m, i) => {
        if (i === others.length - 1) {
          sliderValues[m] = remaining - allocated;
        } else {
          sliderValues[m] = Math.round((sliderValues[m] / othersTotal) * remaining);
          allocated += sliderValues[m];
        }
      });
    }
  } else {
    // Simple proportional normalization
    const total = metals.reduce((s, m) => s + sliderValues[m], 0);
    if (total === 100) return;
    const factor = 100 / total;
    let allocated = 0;
    metals.forEach((m, i) => {
      if (i === metals.length - 1) {
        sliderValues[m] = 100 - allocated;
      } else {
        sliderValues[m] = Math.round(sliderValues[m] * factor);
        allocated += sliderValues[m];
      }
    });
  }

  // Iteratively clamp to valid ranges and rebalance until sum === 100
  // Lock the user-changed metal so rebalancing never touches it
  const pinned = new Set();
  if (changedMetal) pinned.add(changedMetal);

  for (let iter = 0; iter < 10; iter++) {
    const locked = new Set(pinned);
    let excess = 0;

    // Clamp and track how much we over/under-shot
    for (const m of metals) {
      const { min, max } = compMap[m];
      if (sliderValues[m] < min) { excess += sliderValues[m] - min; sliderValues[m] = min; locked.add(m); }
      else if (sliderValues[m] > max) { excess += sliderValues[m] - max; sliderValues[m] = max; locked.add(m); }
    }

    if (excess === 0) break;

    // Distribute the excess among unlocked metals
    const adjustable = metals.filter(m => !locked.has(m));
    if (adjustable.length === 0) break;

    let toDistribute = excess;
    for (let i = 0; i < adjustable.length; i++) {
      const m = adjustable[i];
      const share = i === adjustable.length - 1
        ? toDistribute
        : Math.round(toDistribute / (adjustable.length - i));
      sliderValues[m] += share;
      toDistribute -= share;
    }
  }
}

// === Build sliders UI ===
function buildSliders() {
  const alloy = selectedAlloy;
  slidersContainer.innerHTML = '';

  for (const comp of alloy.components) {
    const metal = METALS[comp.metal];
    const value = sliderValues[comp.metal];

    const group = document.createElement('div');
    group.className = 'slider-group';

    group.innerHTML = `
      <div class="slider-label">
        <span class="slider-metal-name">
          <img class="metal-icon" src="${metal.icon}" alt="${metal.name}" width="20" height="20">
          ${metal.name}
        </span>
        <span class="slider-range-label">${comp.min}% – ${comp.max}%</span>
      </div>
      <div class="slider-value-row">
        <input type="range" class="slider-input"
               min="${comp.min}" max="${comp.max}" value="${value}"
               data-metal="${comp.metal}"
               style="accent-color:${metal.color}">
        <span class="slider-pct" data-pct="${comp.metal}">${value}%</span>
      </div>
      <div class="range-bar">
        <div class="range-bar-fill" style="left:${comp.min}%;width:${comp.max - comp.min}%;background:${metal.color}"></div>
      </div>
    `;

    const slider = group.querySelector('.slider-input');
    slider.addEventListener('input', (e) => {
      const val = Math.max(comp.min, Math.min(comp.max, parseInt(e.target.value)));
      sliderValues[comp.metal] = val;
      normalizeSliders(comp.metal);
      updateSliderDisplays();
      updateResults();
    });

    // Click on percentage to type exact value
    const pctEl = group.querySelector('.slider-pct');
    pctEl.style.cursor = 'pointer';
    pctEl.title = 'Click to enter exact value';
    pctEl.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'pct-input';
      input.min = comp.min;
      input.max = comp.max;
      input.value = sliderValues[comp.metal];
      pctEl.replaceWith(input);
      input.focus();
      input.select();

      const commit = () => {
        let val = parseInt(input.value) || 0;
        val = Math.max(comp.min, Math.min(comp.max, val));
        sliderValues[comp.metal] = val;
        normalizeSliders(comp.metal);
        buildSliders();
        updateResults();
      };

      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') {
          input.value = sliderValues[comp.metal];
          input.blur();
        }
      });
    });

    slidersContainer.appendChild(group);
  }

  // Add multiplier controls (max 25 ingots = 2560 units / 100 per ingot)
  const MAX_INGOTS = 25;
  const multDiv = document.createElement('div');
  multDiv.className = 'multiplier-controls';
  multDiv.innerHTML = `
    <span class="multiplier-label">Ingots:</span>
    <button class="mult-step-btn" data-dir="-1">&minus;</button>
    <input type="number" class="mult-input" min="1" max="${MAX_INGOTS}" value="${multiplier}">
    <button class="mult-step-btn" data-dir="1">+</button>
    <span class="mult-max-label">/ ${MAX_INGOTS} max</span>
  `;

  const multInput = multDiv.querySelector('.mult-input');
  const setMultiplier = (val) => {
    multiplier = Math.max(1, Math.min(MAX_INGOTS, val));
    multInput.value = multiplier;
    updateResults();
  };

  multInput.addEventListener('change', () => setMultiplier(parseInt(multInput.value) || 1));
  multDiv.querySelectorAll('.mult-step-btn').forEach(btn => {
    btn.addEventListener('click', () => setMultiplier(multiplier + parseInt(btn.dataset.dir)));
  });
  slidersContainer.appendChild(multDiv);
}

// === Update all slider displays without rebuilding ===
function updateSliderDisplays() {
  for (const comp of selectedAlloy.components) {
    const slider = slidersContainer.querySelector(`[data-metal="${comp.metal}"]`);
    const pct = slidersContainer.querySelector(`[data-pct="${comp.metal}"]`);
    if (slider) slider.value = sliderValues[comp.metal];
    if (pct) pct.textContent = `${sliderValues[comp.metal]}%`;
  }
}

// === Check if ratios are valid ===
function checkValidity() {
  if (!selectedAlloy) return { valid: false, issues: [] };
  const issues = [];
  for (const comp of selectedAlloy.components) {
    const val = sliderValues[comp.metal];
    if (val < comp.min) issues.push(`${METALS[comp.metal].name} below minimum (${comp.min}%)`);
    if (val > comp.max) issues.push(`${METALS[comp.metal].name} above maximum (${comp.max}%)`);
  }
  return { valid: issues.length === 0, issues };
}

// === URL hash state ===
function updateHash() {
  if (!selectedAlloy) return;
  const parts = selectedAlloy.components.map(c => `${c.metal}=${sliderValues[c.metal]}`);
  const hash = `${selectedAlloy.id}:${parts.join(',')}:${multiplier}`;
  history.replaceState(null, '', '#' + hash);
}

function loadFromHash() {
  const hash = location.hash.slice(1);
  if (!hash) return false;
  const [alloyId, ratioStr, mult] = hash.split(':');
  const alloy = ALLOYS.find(a => a.id === alloyId);
  if (!alloy) return false;

  selectedAlloy = alloy;
  multiplier = parseInt(mult) || 1;
  sliderValues = {};

  // Parse ratios
  if (ratioStr) {
    for (const pair of ratioStr.split(',')) {
      const [metal, val] = pair.split('=');
      if (metal && val) sliderValues[metal] = parseInt(val);
    }
  }

  // Fill in any missing metals with midpoints
  for (const comp of alloy.components) {
    if (!(comp.metal in sliderValues)) {
      sliderValues[comp.metal] = Math.round((comp.min + comp.max) / 2);
    }
  }

  // Update active card
  document.querySelectorAll('.alloy-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.alloy-card[data-id="${alloy.id}"]`)?.classList.add('active');

  alloyTitle.textContent = alloy.name;
  alloyDesc.textContent = alloy.desc;
  calculator.style.display = '';

  buildSliders();
  updateResults();
  calculator.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function copyShareLink() {
  updateHash();
  navigator.clipboard.writeText(location.href).then(() => {
    const btn = document.getElementById('shareBtn');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

// === Update results ===
function updateResults() {
  const alloy = selectedAlloy;
  if (!alloy) return;

  const { valid, issues } = checkValidity();

  // Ratio status
  if (valid) {
    ratioStatus.className = 'ratio-status valid';
    ratioStatus.textContent = 'Valid alloy ratio';
  } else {
    ratioStatus.className = 'ratio-status invalid';
    ratioStatus.textContent = issues.join(' · ');
  }

  // Calculate nuggets for the given multiplier
  // 1 ingot = 100 units, 1 nugget = 5 units, so 1 ingot = 20 nuggets
  const UNITS_PER_NUGGET = 5;
  const UNITS_PER_INGOT = 100;
  const totalUnits = UNITS_PER_INGOT * multiplier;
  const nuggets = {};
  let totalNuggets = 0;

  for (const comp of alloy.components) {
    const units = Math.round(totalUnits * sliderValues[comp.metal] / 100);
    const count = Math.round(units / UNITS_PER_NUGGET);
    nuggets[comp.metal] = count;
    totalNuggets += count;
  }

  // Ingots produced (each ingot = 100 units)
  const ingots = valid ? multiplier : 0;
  ingotCount.textContent = ingots;
  nuggetTotal.textContent = `${totalNuggets} nuggets total`;

  // Nugget breakdown
  nuggetBreakdown.innerHTML = '';
  for (const comp of alloy.components) {
    const metal = METALS[comp.metal];
    const count = nuggets[comp.metal];
    const row = document.createElement('div');
    row.className = 'nugget-row';
    row.innerHTML = `
      <img class="metal-icon" src="${metal.icon}" alt="${metal.name}" width="20" height="20">
      <span class="nugget-row-name">${metal.name}</span>
      <span class="nugget-row-count">${count}</span>
      <span class="nugget-row-unit">nuggets</span>
    `;
    nuggetBreakdown.appendChild(row);
  }

  // Crucible visual bar
  crucibleVisual.innerHTML = '';
  for (const comp of alloy.components) {
    const metal = METALS[comp.metal];
    const pct = sliderValues[comp.metal];
    const seg = document.createElement('div');
    seg.className = 'crucible-segment';
    seg.style.width = `${pct}%`;
    seg.style.background = metal.color;
    seg.innerHTML = `<span class="crucible-segment-tooltip">${metal.name}: ${pct}%</span>`;
    crucibleVisual.appendChild(seg);
  }

  updateHash();
}

// === Init ===
buildAlloyGrid();
loadFromHash();
