// === Steel Making Data ===
const PHASES = [
  { id: 'preparation',  name: 'Preparation',  color: '#60a5fa' },
  { id: 'construction', name: 'Construction', color: '#fbbf24' },
  { id: 'production',   name: 'Production',   color: '#f87171' },
];

const MATERIALS = {
  ironOre:       { name: 'Iron Ore Nuggets', icon: 'img/steel/hematite.png' },
  charcoal:      { name: 'Charcoal',         icon: 'img/steel/charcoal.png' },
  ironIngot:     { name: 'Iron Ingots',       icon: 'img/steel/ingot-iron.png' },
  ironPlate:     { name: 'Iron Plates',       icon: 'img/steel/plate-iron.png' },
  blistersteel:  { name: 'Blister Steel',     icon: 'img/steel/ingot-blistersteel.png' },
  steelIngot:    { name: 'Steel Ingots',      icon: 'img/steel/ingot-steel.png' },
  refBrick:      { name: 'Refractory Bricks', icon: 'img/steel/refractorybrick.png' },
  crushedBaux:   { name: 'Crushed Bauxite',   icon: 'img/steel/crushed-bauxite.png' },
  crushedQuartz: { name: 'Crushed Quartz',    icon: 'img/steel/crushed-quartz.png' },
  crushedOliv:   { name: 'Crushed Olivine',   icon: 'img/steel/crushed-olivine.png' },
  crushedIlm:    { name: 'Crushed Ilmenite',  icon: 'img/steel/crushed-ilmenite.png' },
  lime:          { name: 'Powdered Lime',      icon: 'img/steel/lime.png' },
  ironbloom:     { name: 'Iron Blooms',       icon: 'img/steel/ironbloom.png' },
};

const STEEL_STEPS = [
  {
    id: 'mine-ore',
    name: 'Mine Iron Ore',
    phase: 'preparation',
    desc: 'Mine iron ore from deposits. Hematite, magnetite, and limonite all yield iron. Use a prospecting pick to locate veins.',
    materials: (batches) => [
      { ...MATERIALS.ironOre, qty: batches * 16 * 12, note: `~${batches * 16 * 12} nuggets for ${batches * 16} ingots` },
    ],
  },
  {
    id: 'make-charcoal',
    name: 'Produce Charcoal',
    phase: 'preparation',
    desc: 'Create charcoal in a charcoal pit using logs. You need charcoal for both smelting and cementation.',
    materials: (batches) => [
      { ...MATERIALS.charcoal, qty: batches * 16 * 12 + batches * 40, note: 'For smelting + cementation' },
    ],
  },
  {
    id: 'smelt-blooms',
    name: 'Smelt Iron Blooms',
    phase: 'preparation',
    desc: 'Smelt iron ore in a bloomery furnace to produce iron blooms. Each bloom requires ore and charcoal. (1.22) Attaching bellows to the bloomery significantly speeds up smelting.',
    materials: (batches) => [
      { ...MATERIALS.ironbloom, qty: batches * 16, note: `${batches * 16} blooms needed` },
    ],
    duration: (batches) => `~${(batches * 16 * 0.5).toFixed(1)} in-game hours of smelting`,
  },
  {
    id: 'work-blooms',
    name: 'Work Iron Blooms on Anvil',
    phase: 'preparation',
    desc: 'Hammer iron blooms on an iron anvil to remove slag and produce iron ingots. Use Split mode to remove impurities. (1.22) Equip metal tongs (10–100× durability vs wooden) for extended forging sessions.',
    materials: (batches) => [
      { ...MATERIALS.ironIngot, qty: batches * 16, note: `${batches * 16} iron ingots produced` },
    ],
  },
  {
    id: 'crush-materials',
    name: 'Crush Refractory Materials',
    phase: 'construction',
    desc: 'Use a pulverizer to crush bauxite, quartz, olivine, or ilmenite into powder. Mix with fire clay to create refractory brick recipes.',
    materials: () => [
      { ...MATERIALS.crushedBaux, qty: 24, note: 'For Tier 1 bricks' },
      { ...MATERIALS.crushedQuartz, qty: 24, note: 'Alternative material' },
    ],
    oneTime: true,
  },
  {
    id: 'fire-bricks',
    name: 'Fire Refractory Bricks',
    phase: 'construction',
    desc: 'Combine crushed materials with fire clay, form raw bricks, and fire them in a pit kiln. Higher tiers last longer.',
    materials: () => [
      { ...MATERIALS.refBrick, qty: 55, note: '53-55 bricks for furnace structure' },
    ],
    oneTime: true,
  },
  {
    id: 'build-furnace',
    name: 'Build Cementation Furnace',
    phase: 'construction',
    desc: 'Construct the 5x5x6 cementation furnace structure using refractory bricks, grating blocks, an iron door, and stone coffin components.',
    materials: () => [
      { ...MATERIALS.refBrick, qty: 55, note: 'Brick blocks + grating' },
      { ...MATERIALS.ironPlate, qty: 2, note: 'For the iron door' },
    ],
    oneTime: true,
  },
  {
    id: 'carburize',
    name: 'Carburize Iron into Blister Steel',
    phase: 'production',
    desc: 'Place 16 iron ingots and 40 charcoal/coke in the stone coffin inside the cementation furnace. Burn 160 fuel below the furnace.',
    materials: (batches) => [
      { ...MATERIALS.ironIngot, qty: batches * 16, note: `${batches * 16} ingots (${batches} batch${batches > 1 ? 'es' : ''})` },
      { ...MATERIALS.charcoal, qty: batches * 40, note: `${batches * 40} for coffin layering` },
      { ...MATERIALS.charcoal, qty: batches * 160, note: `${batches * 160} to burn under furnace` },
    ],
    duration: (batches) => `${(batches * 6.67).toFixed(1)} in-game days (${batches} batch${batches > 1 ? 'es' : ''} x 6.67 days)`,
  },
  {
    id: 'refine-steel',
    name: 'Refine on Anvil to Steel',
    phase: 'production',
    desc: 'Work blister steel ingots on an iron anvil (by hand or with a helve hammer) to produce usable steel ingots. (1.22) Steel anvils are now craftable in survival as a higher-tier upgrade. Once tool heads are forged, you can quench/temper them for ±durability/power and grind blades on a grinding wheel for a crit-damage bonus.',
    materials: (batches) => [
      { ...MATERIALS.steelIngot, qty: batches * 16, note: `${batches * 16} steel ingots produced` },
    ],
  },
];

// === State ===
let targetIngots = 16;
let completedSteps = new Set();

// === Load state ===
function loadState() {
  // Try URL hash first
  const hash = location.hash.slice(1);
  if (hash) {
    const params = {};
    for (const part of hash.split(':')) {
      const [k, v] = part.split('=');
      if (k && v) params[k] = v;
    }
    if (params.target) targetIngots = Math.max(1, parseInt(params.target) || 16);
    if (params.done) completedSteps = new Set(params.done.split(','));
  } else {
    // Try localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('vs-tools-steel-progress') || '{}');
      if (saved.target) targetIngots = saved.target;
      if (saved.done) completedSteps = new Set(saved.done);
    } catch (e) { /* ignore */ }
  }
}

function saveState() {
  const state = { target: targetIngots, done: [...completedSteps] };
  try { localStorage.setItem('vs-tools-steel-progress', JSON.stringify(state)); } catch (e) { /* ignore */ }
  const hash = `target=${targetIngots}:done=${[...completedSteps].join(',')}`;
  history.replaceState(null, '', '#' + hash);
}

// === Calculations ===
function getBatches() {
  return Math.ceil(targetIngots / 16);
}

// === Render ===
function render() {
  const batches = getBatches();

  // Goal input
  document.getElementById('goalInput').value = targetIngots;

  // Timing
  const totalDays = (batches * 6.67).toFixed(1);
  document.getElementById('timingInfo').innerHTML = `
    <strong>${batches}</strong> batch${batches > 1 ? 'es' : ''} of 16 &middot;
    <strong>${totalDays}</strong> in-game days for cementation
  `;

  // Materials summary
  renderMaterialsSummary(batches);

  // Progress bar
  renderProgress();

  // Step list
  renderSteps(batches);

  saveState();
}

function renderMaterialsSummary(batches) {
  const totals = {
    'Iron Ore Nuggets': { qty: batches * 16 * 12, icon: MATERIALS.ironOre.icon },
    'Charcoal (total)': { qty: batches * 16 * 12 + batches * 40 + batches * 160, icon: MATERIALS.charcoal.icon },
    'Iron Ingots': { qty: batches * 16, icon: MATERIALS.ironIngot.icon },
    'Refractory Bricks': { qty: 55, icon: MATERIALS.refBrick.icon },
    'Steel Ingots (output)': { qty: batches * 16, icon: MATERIALS.steelIngot.icon },
  };

  const grid = document.getElementById('materialsGrid');
  grid.innerHTML = '';
  for (const [name, { qty, icon }] of Object.entries(totals)) {
    const card = document.createElement('div');
    card.className = 'material-card';
    card.innerHTML = `
      <img class="material-card-icon pixel-icon" src="${icon}" alt="" width="32" height="32">
      <div class="material-card-info">
        <span class="material-card-count">${qty}</span>
        <span class="material-card-name">${name}</span>
      </div>
    `;
    grid.appendChild(card);
  }
}

function renderProgress() {
  const bar = document.getElementById('progressBar');
  const totalSteps = STEEL_STEPS.length;
  const doneCount = completedSteps.size;

  // Count per phase
  const phaseSteps = {};
  const phaseDone = {};
  for (const p of PHASES) { phaseSteps[p.id] = 0; phaseDone[p.id] = 0; }
  for (const step of STEEL_STEPS) {
    phaseSteps[step.phase]++;
    if (completedSteps.has(step.id)) phaseDone[step.phase]++;
  }

  bar.innerHTML = '';
  for (const phase of PHASES) {
    const total = phaseSteps[phase.id];
    const done = phaseDone[phase.id];
    const widthPct = (total / totalSteps) * 100;

    const seg = document.createElement('div');
    seg.className = 'progress-segment';
    seg.style.width = `${widthPct}%`;
    seg.style.background = phase.color;
    seg.style.opacity = done === total ? '1' : '0.3';
    bar.appendChild(seg);
  }

  document.getElementById('progressLabel').innerHTML = `
    <span><strong>${doneCount}</strong> / ${totalSteps} steps complete</span>
    <span>${Math.round((doneCount / totalSteps) * 100)}%</span>
  `;
}

function renderSteps(batches) {
  const list = document.getElementById('stepList');
  list.innerHTML = '';

  for (const step of STEEL_STEPS) {
    const phase = PHASES.find(p => p.id === step.phase);
    const isDone = completedSteps.has(step.id);
    const materials = step.materials(batches);
    const duration = step.duration ? step.duration(batches) : null;

    const card = document.createElement('div');
    card.className = `step-card${isDone ? ' completed' : ''}`;
    card.style.setProperty('--step-phase-color', phase.color);

    let materialsHtml = '';
    for (const mat of materials) {
      materialsHtml += `
        <span class="step-material-tag">
          <img class="pixel-icon" src="${mat.icon}" alt="" width="18" height="18">
          ${mat.qty} ${mat.name}
        </span>
      `;
    }

    card.innerHTML = `
      <div class="step-header">
        <input type="checkbox" class="step-checkbox" data-step="${step.id}" ${isDone ? 'checked' : ''}>
        <span class="step-name">${step.name}</span>
        <span class="step-phase-badge" style="background:${phase.color}22;color:${phase.color}">${phase.name}</span>
      </div>
      <div class="step-desc">${step.desc}</div>
      <div class="step-materials">${materialsHtml}</div>
      ${duration ? `<div class="step-duration">&#9202; ${duration}</div>` : ''}
      ${step.oneTime ? '<div class="step-duration" style="color:var(--text-dim)">One-time cost (not per batch)</div>' : ''}
    `;

    const checkbox = card.querySelector('.step-checkbox');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        completedSteps.add(step.id);
      } else {
        completedSteps.delete(step.id);
      }
      render();
    });

    list.appendChild(card);
  }
}

// === Init ===
loadState();

const goalInput = document.getElementById('goalInput');
goalInput.value = targetIngots;
goalInput.addEventListener('change', () => {
  targetIngots = Math.max(1, parseInt(goalInput.value) || 16);
  render();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  completedSteps.clear();
  render();
});

render();
