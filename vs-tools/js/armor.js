// === Armor Data (from game JSON: assets/survival/itemtypes/wearable/seraph/armor.json) ===

// Protection stats per construction+material combo
// Each entry: { relProt, flatDR, tier, highTierResist?, perTierRelLoss?, perTierFlatLoss? }
const ARMOR_STATS = {
  'improvised-wood':       { relProt: 0.55, flatDR: 0, tier: 0 },
  'jerkin-leather':        { relProt: 0.40, flatDR: 0.25, tier: 1 },
  'sewn-leather':          { relProt: 0.60, flatDR: 0.60, tier: 1, perTierRelLoss: [0.015, 0.075], perTierFlatLoss: [0.05, 0.1] },
  'sewn-linen':            { relProt: 0.70, flatDR: 0.70, tier: 2, perTierRelLoss: [0.015, 0.075], perTierFlatLoss: [0.05, 0.1] },
  'tailored-linen':        { relProt: 0.75, flatDR: 0.75, tier: 2, perTierRelLoss: [0.015, 0.075], perTierFlatLoss: [0.05, 0.1] },
  'lamellar-wood':         { relProt: 0.65, flatDR: 0.50, tier: 0 },
  'lamellar-copper':       { relProt: 0.75, flatDR: 0.50, tier: 1 },
  'lamellar-tinbronze':    { relProt: 0.77, flatDR: 0.60, tier: 2 },
  'lamellar-bismuthbronze':{ relProt: 0.76, flatDR: 0.58, tier: 2 },
  'lamellar-blackbronze':  { relProt: 0.78, flatDR: 0.65, tier: 2 },
  'lamellar-iron':         { relProt: 0.79, flatDR: 0.70, tier: 3 },
  'lamellar-steel':        { relProt: 0.81, flatDR: 0.80, tier: 4 },
  'brigandine-copper':     { relProt: 0.78, flatDR: 1.00, tier: 1 },
  'brigandine-tinbronze':  { relProt: 0.80, flatDR: 1.10, tier: 2 },
  'brigandine-bismuthbronze': { relProt: 0.79, flatDR: 1.10, tier: 2 },
  'brigandine-blackbronze':{ relProt: 0.81, flatDR: 1.15, tier: 2 },
  'brigandine-iron':       { relProt: 0.82, flatDR: 1.20, tier: 3 },
  'brigandine-meteoriciron':{ relProt: 0.825, flatDR: 1.22, tier: 3 },
  'brigandine-steel':      { relProt: 0.84, flatDR: 1.30, tier: 4 },
  'chain-copper':          { relProt: 0.80, flatDR: 1.10, tier: 1 },
  'chain-gold':            { relProt: 0.82, flatDR: 1.20, tier: 1 },
  'chain-silver':          { relProt: 0.82, flatDR: 1.20, tier: 2 },
  'chain-tinbronze':       { relProt: 0.82, flatDR: 1.20, tier: 2 },
  'chain-bismuthbronze':   { relProt: 0.81, flatDR: 1.20, tier: 2 },
  'chain-blackbronze':     { relProt: 0.83, flatDR: 1.25, tier: 2 },
  'chain-iron':            { relProt: 0.84, flatDR: 1.30, tier: 3 },
  'chain-meteoriciron':    { relProt: 0.845, flatDR: 1.35, tier: 3 },
  'chain-steel':           { relProt: 0.86, flatDR: 1.40, tier: 4 },
  'scale-copper':          { relProt: 0.84, flatDR: 1.30, tier: 1 },
  'scale-tinbronze':       { relProt: 0.86, flatDR: 1.35, tier: 2 },
  'scale-bismuthbronze':   { relProt: 0.85, flatDR: 1.30, tier: 2 },
  'scale-blackbronze':     { relProt: 0.87, flatDR: 1.40, tier: 2 },
  'scale-iron':            { relProt: 0.88, flatDR: 1.50, tier: 3 },
  'scale-meteoriciron':    { relProt: 0.885, flatDR: 1.55, tier: 3 },
  'scale-steel':           { relProt: 0.90, flatDR: 1.60, tier: 4 },
  'plate-copper':          { relProt: 0.90, flatDR: 1.50, tier: 1, highTierResist: true },
  'plate-gold':            { relProt: 0.90, flatDR: 1.50, tier: 1, highTierResist: true },
  'plate-silver':          { relProt: 0.92, flatDR: 1.50, tier: 2, highTierResist: true },
  'plate-tinbronze':       { relProt: 0.92, flatDR: 1.60, tier: 2, highTierResist: true },
  'plate-bismuthbronze':   { relProt: 0.94, flatDR: 1.55, tier: 2, highTierResist: true },
  'plate-blackbronze':     { relProt: 0.95, flatDR: 1.65, tier: 2, highTierResist: true },
  'plate-iron':            { relProt: 0.96, flatDR: 1.70, tier: 3, highTierResist: true },
  'plate-meteoriciron':    { relProt: 0.962, flatDR: 1.72, tier: 3, highTierResist: true },
  'plate-steel':           { relProt: 0.97, flatDR: 1.80, tier: 4, highTierResist: true },
  'blackguard-pristine':   { relProt: 0.96, flatDR: 1.70, tier: 3, highTierResist: true },
  'blackguard-damaged':    { relProt: 0.75, flatDR: 0.50, tier: 1 },
  'blackguard-broken':     { relProt: 0.40, flatDR: 0.25, tier: 1 },
  'forlorn-pristine':      { relProt: 0.96, flatDR: 1.70, tier: 3, highTierResist: true },
  'forlorn-damaged':       { relProt: 0.90, flatDR: 1.50, tier: 1, highTierResist: true },
  'forlorn-broken':        { relProt: 0.40, flatDR: 0.25, tier: 1 },
};

// Stat modifiers per construction type (per piece)
const STAT_MODS = {
  'lamellar':    { walkSpeed: -0.03, healEff: -0.10, hungerRate: 0.08, rangedAcc: -0.03, rangedSpd: -0.07 },
  'sewn-linen':  { walkSpeed: -0.02, healEff: -0.17, hungerRate: 0.03, rangedAcc: 0, rangedSpd: 0 },
  'tailored':    { walkSpeed: 0, healEff: -0.10, hungerRate: 0.03, rangedAcc: 0, rangedSpd: 0 },
  'brigandine':  { walkSpeed: -0.05, healEff: -0.17, hungerRate: 0.12, rangedAcc: -0.07, rangedSpd: -0.14 },
  'chain':       { walkSpeed: -0.03, healEff: -0.10, hungerRate: 0.075, rangedAcc: -0.03, rangedSpd: -0.06 },
  'scale':       { walkSpeed: -0.07, healEff: -0.17, hungerRate: 0.12, rangedAcc: -0.10, rangedSpd: -0.20 },
  'plate':       { walkSpeed: -0.14, healEff: -0.3334, hungerRate: 0.24, rangedAcc: -0.10, rangedSpd: -0.20 },
  'blackguard-pristine': { walkSpeed: -0.12, healEff: -0.20, hungerRate: 0.20, rangedAcc: -0.10, rangedSpd: -0.20 },
  'blackguard-damaged':  { walkSpeed: -0.08, healEff: -0.18, hungerRate: 0.15, rangedAcc: -0.08, rangedSpd: -0.16 },
  'blackguard-broken':   { walkSpeed: -0.05, healEff: -0.17, hungerRate: 0.12, rangedAcc: -0.07, rangedSpd: -0.14 },
  'forlorn-pristine':    { walkSpeed: -0.08, healEff: -0.17, hungerRate: 0.16, rangedAcc: -0.08, rangedSpd: -0.18 },
  'forlorn-damaged':     { walkSpeed: -0.07, healEff: -0.17, hungerRate: 0.14, rangedAcc: -0.08, rangedSpd: -0.16 },
  'forlorn-broken':      { walkSpeed: -0.05, healEff: -0.17, hungerRate: 0.12, rangedAcc: -0.07, rangedSpd: -0.14 },
};

// Durability per construction+material
const DURABILITY = {
  'improvised-wood': 75, 'jerkin-leather': 250, 'sewn-leather': 700, 'sewn-linen': 900, 'tailored-linen': 900,
  'lamellar-wood': 200, 'lamellar-copper': 450, 'lamellar-tinbronze': 600, 'lamellar-bismuthbronze': 525,
  'lamellar-blackbronze': 675, 'lamellar-iron': 800, 'lamellar-steel': 1600,
  'brigandine-copper': 900, 'brigandine-tinbronze': 1100, 'brigandine-bismuthbronze': 1050,
  'brigandine-blackbronze': 1200, 'brigandine-iron': 1300, 'brigandine-meteoriciron': 1500, 'brigandine-steel': 2600,
  'chain-copper': 600, 'chain-gold': 500, 'chain-silver': 700, 'chain-tinbronze': 700,
  'chain-bismuthbronze': 650, 'chain-blackbronze': 750, 'chain-iron': 800, 'chain-meteoriciron': 900, 'chain-steel': 2000,
  'scale-copper': 800, 'scale-tinbronze': 1200, 'scale-bismuthbronze': 1150, 'scale-blackbronze': 1300,
  'scale-iron': 1400, 'scale-meteoriciron': 1700, 'scale-steel': 3500,
  'plate-copper': 500, 'plate-gold': 400, 'plate-silver': 1000, 'plate-tinbronze': 1000,
  'plate-bismuthbronze': 900, 'plate-blackbronze': 1200, 'plate-iron': 2200, 'plate-meteoriciron': 2800, 'plate-steel': 5500,
  'blackguard-pristine': 1800, 'blackguard-damaged': 900, 'blackguard-broken': 600,
  'forlorn-pristine': 1600, 'forlorn-damaged': 1000, 'forlorn-broken': 500,
};

// Which armor combos are available for each slot
// Based on allowedVariants from game JSON
const SLOT_OPTIONS = {
  head: [
    'none',
    'sewn-leather', 'sewn-linen', 'tailored-linen',
    'lamellar-wood', 'lamellar-copper', 'lamellar-tinbronze', 'lamellar-bismuthbronze', 'lamellar-blackbronze', 'lamellar-iron', 'lamellar-steel',
    'brigandine-copper', 'brigandine-tinbronze', 'brigandine-bismuthbronze', 'brigandine-blackbronze', 'brigandine-iron', 'brigandine-meteoriciron', 'brigandine-steel',
    'chain-copper', 'chain-gold', 'chain-silver', 'chain-tinbronze', 'chain-bismuthbronze', 'chain-blackbronze', 'chain-iron', 'chain-meteoriciron', 'chain-steel',
    'scale-copper', 'scale-tinbronze', 'scale-bismuthbronze', 'scale-blackbronze', 'scale-iron', 'scale-meteoriciron', 'scale-steel',
    'plate-copper', 'plate-gold', 'plate-silver', 'plate-tinbronze', 'plate-bismuthbronze', 'plate-blackbronze', 'plate-iron', 'plate-meteoriciron', 'plate-steel',
    'blackguard-pristine', 'blackguard-damaged', 'blackguard-broken',
    'forlorn-pristine', 'forlorn-damaged', 'forlorn-broken',
  ],
  body: [
    'none',
    'improvised-wood', 'jerkin-leather',
    'sewn-leather', 'sewn-linen', 'tailored-linen',
    'lamellar-wood', 'lamellar-copper', 'lamellar-tinbronze', 'lamellar-bismuthbronze', 'lamellar-blackbronze', 'lamellar-iron', 'lamellar-steel',
    'brigandine-copper', 'brigandine-tinbronze', 'brigandine-bismuthbronze', 'brigandine-blackbronze', 'brigandine-iron', 'brigandine-meteoriciron', 'brigandine-steel',
    'chain-copper', 'chain-gold', 'chain-silver', 'chain-tinbronze', 'chain-bismuthbronze', 'chain-blackbronze', 'chain-iron', 'chain-meteoriciron', 'chain-steel',
    'scale-copper', 'scale-tinbronze', 'scale-bismuthbronze', 'scale-blackbronze', 'scale-iron', 'scale-meteoriciron', 'scale-steel',
    'plate-copper', 'plate-gold', 'plate-silver', 'plate-tinbronze', 'plate-bismuthbronze', 'plate-blackbronze', 'plate-iron', 'plate-meteoriciron', 'plate-steel',
    'blackguard-pristine', 'blackguard-damaged', 'blackguard-broken',
    'forlorn-pristine', 'forlorn-damaged', 'forlorn-broken',
  ],
  legs: [
    'none',
    'jerkin-leather',
    'sewn-leather', 'sewn-linen', 'tailored-linen',
    'lamellar-wood', 'lamellar-copper', 'lamellar-tinbronze', 'lamellar-bismuthbronze', 'lamellar-blackbronze', 'lamellar-iron', 'lamellar-steel',
    'brigandine-copper', 'brigandine-tinbronze', 'brigandine-bismuthbronze', 'brigandine-blackbronze', 'brigandine-iron', 'brigandine-meteoriciron', 'brigandine-steel',
    'chain-copper', 'chain-gold', 'chain-silver', 'chain-tinbronze', 'chain-bismuthbronze', 'chain-blackbronze', 'chain-iron', 'chain-meteoriciron', 'chain-steel',
    'scale-copper', 'scale-tinbronze', 'scale-bismuthbronze', 'scale-blackbronze', 'scale-iron', 'scale-meteoriciron', 'scale-steel',
    'plate-copper', 'plate-gold', 'plate-silver', 'plate-tinbronze', 'plate-bismuthbronze', 'plate-blackbronze', 'plate-iron', 'plate-meteoriciron', 'plate-steel',
    'blackguard-pristine', 'blackguard-damaged', 'blackguard-broken',
    'forlorn-pristine', 'forlorn-damaged', 'forlorn-broken',
  ],
};

// === Display helpers ===
function prettyName(key) {
  if (key === 'none') return 'None';
  return key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getConstruction(key) {
  // Return the construction type for stat mod lookup
  if (key.startsWith('blackguard-') || key.startsWith('forlorn-')) return key;
  if (key.startsWith('tailored-')) return 'tailored';
  if (key === 'sewn-linen') return 'sewn-linen';
  // For 'sewn-leather', no stat mod defined so return empty
  const construction = key.split('-')[0];
  return construction;
}

function getGroup(key) {
  if (key === 'none') return 'None';
  if (key.startsWith('improvised')) return 'Improvised';
  if (key.startsWith('jerkin')) return 'Jerkin';
  if (key.startsWith('sewn-leather')) return 'Sewn Leather';
  if (key.startsWith('sewn-linen')) return 'Gambeson';
  if (key.startsWith('tailored')) return 'Tailored Gambeson';
  if (key.startsWith('blackguard')) return 'Blackguard';
  if (key.startsWith('forlorn')) return 'Forlorn Hope';
  return key.split('-')[0].charAt(0).toUpperCase() + key.split('-')[0].slice(1);
}

// === State ===
let attackTier = 2;
let baseDamage = 10;
const loadouts = { a: { head: 'none', body: 'none', legs: 'none' }, b: { head: 'none', body: 'none', legs: 'none' } };

// === Damage calculation ===
function calcDamageThrough(armorKey, atkTier, damage) {
  if (armorKey === 'none') return damage;
  const stats = ARMOR_STATS[armorKey];
  if (!stats) return damage;

  let relProt = stats.relProt;
  let flatDR = stats.flatDR;

  const tierDiff = atkTier - stats.tier;
  if (tierDiff > 0) {
    // Attack tier exceeds armor tier: protection degrades
    if (stats.perTierRelLoss) {
      for (let i = 0; i < tierDiff; i++) {
        relProt -= stats.perTierRelLoss[Math.min(i, stats.perTierRelLoss.length - 1)];
      }
    } else if (!stats.highTierResist) {
      // Default tier loss for armors without explicit loss values
      relProt -= tierDiff * 0.1;
      flatDR -= tierDiff * 0.2;
    } else {
      // High tier resistant (plate): halved loss
      relProt -= tierDiff * 0.05;
      flatDR -= tierDiff * 0.1;
    }
    if (stats.perTierFlatLoss) {
      let flatLoss = 0;
      for (let i = 0; i < tierDiff; i++) {
        flatLoss += stats.perTierFlatLoss[Math.min(i, stats.perTierFlatLoss.length - 1)];
      }
      flatDR -= flatLoss;
    }
  }

  relProt = Math.max(0, Math.min(1, relProt));
  flatDR = Math.max(0, flatDR);

  const afterFlat = Math.max(0, damage - flatDR);
  return afterFlat * (1 - relProt);
}

function calcLoadout(loadout) {
  let totalDamage = baseDamage;
  let totalWalk = 0, totalHeal = 0, totalHunger = 0, totalRangedAcc = 0, totalRangedSpd = 0;
  let totalDurability = 0;
  let piecesEquipped = 0;

  for (const slot of ['head', 'body', 'legs']) {
    const key = loadout[slot];
    if (key === 'none') continue;
    piecesEquipped++;

    // Damage passes through each piece sequentially
    totalDamage = calcDamageThrough(key, attackTier, totalDamage);

    // Stat mods
    const construction = getConstruction(key);
    const mods = STAT_MODS[construction];
    if (mods) {
      totalWalk += mods.walkSpeed;
      totalHeal += mods.healEff;
      totalHunger += mods.hungerRate;
      totalRangedAcc += mods.rangedAcc;
      totalRangedSpd += mods.rangedSpd;
    }

    // Durability
    totalDurability += DURABILITY[key] || 0;
  }

  return {
    effectiveDamage: totalDamage,
    damageReduction: baseDamage - totalDamage,
    reductionPct: baseDamage > 0 ? ((baseDamage - totalDamage) / baseDamage) * 100 : 0,
    walkSpeed: totalWalk,
    healEff: totalHeal,
    hungerRate: totalHunger,
    rangedAcc: totalRangedAcc,
    rangedSpd: totalRangedSpd,
    durability: totalDurability,
    pieces: piecesEquipped,
  };
}

// === Render ===
function buildSlotSelect(parentId, slot, loadoutKey) {
  const select = document.querySelector(`#${parentId} .slot-${slot}`);
  select.innerHTML = '';

  const options = SLOT_OPTIONS[slot];
  let lastGroup = '';

  for (const key of options) {
    const group = getGroup(key);
    if (group !== lastGroup) {
      if (key !== 'none') {
        const optGroup = document.createElement('optgroup');
        optGroup.label = group;
        select.appendChild(optGroup);
      }
      lastGroup = group;
    }

    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = prettyName(key);
    if (key === loadouts[loadoutKey][slot]) opt.selected = true;

    const parent = key === 'none' ? select : select.querySelector(`optgroup:last-child`);
    parent.appendChild(opt);
  }

  select.addEventListener('change', () => {
    loadouts[loadoutKey][slot] = select.value;
    renderResults();
    saveHash();
  });
}

function renderResults() {
  for (const key of ['a', 'b']) {
    const result = calcLoadout(loadouts[key]);
    const container = document.getElementById(`results-${key}`);

    const pctFill = Math.min(100, result.reductionPct);

    container.innerHTML = `
      <div class="effective-damage">
        <div class="effective-damage-value">${result.effectiveDamage.toFixed(2)}</div>
        <div class="effective-damage-label">Damage taken from ${baseDamage} base damage</div>
      </div>

      <div class="result-row" style="margin-top:0.8rem">
        <span class="result-label">Damage reduced</span>
        <span class="result-value good">${result.damageReduction.toFixed(2)} (${result.reductionPct.toFixed(1)}%)</span>
      </div>
      <div class="result-bar">
        <div class="result-bar-fill" style="width:${pctFill}%;background:var(--success)"></div>
      </div>

      <div class="result-row">
        <span class="result-label">Total durability</span>
        <span class="result-value">${result.durability}</span>
      </div>

      <div class="result-divider">Penalties (per piece, stacked)</div>

      <div class="result-row">
        <span class="result-label">Walk speed</span>
        <span class="result-value ${result.walkSpeed < 0 ? 'bad' : ''}">${(result.walkSpeed * 100).toFixed(1)}%</span>
      </div>
      <div class="result-row">
        <span class="result-label">Healing effectiveness</span>
        <span class="result-value ${result.healEff < 0 ? 'bad' : ''}">${(result.healEff * 100).toFixed(1)}%</span>
      </div>
      <div class="result-row">
        <span class="result-label">Hunger rate</span>
        <span class="result-value ${result.hungerRate > 0 ? 'warn' : ''}">+${(result.hungerRate * 100).toFixed(1)}%</span>
      </div>
      <div class="result-row">
        <span class="result-label">Ranged accuracy</span>
        <span class="result-value ${result.rangedAcc < 0 ? 'bad' : ''}">${(result.rangedAcc * 100).toFixed(1)}%</span>
      </div>
      <div class="result-row">
        <span class="result-label">Ranged speed</span>
        <span class="result-value ${result.rangedSpd < 0 ? 'bad' : ''}">${(result.rangedSpd * 100).toFixed(1)}%</span>
      </div>
    `;
  }
}

// === Hash state ===
function saveHash() {
  const parts = [
    `a=${loadouts.a.head},${loadouts.a.body},${loadouts.a.legs}`,
    `b=${loadouts.b.head},${loadouts.b.body},${loadouts.b.legs}`,
    `atk=${attackTier}`,
    `dmg=${baseDamage}`,
  ];
  history.replaceState(null, '', '#' + parts.join(':'));
}

function loadHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const params = {};
  for (const part of hash.split(':')) {
    const [k, v] = part.split('=');
    if (k && v) params[k] = v;
  }
  if (params.atk) attackTier = parseInt(params.atk) || 2;
  if (params.dmg) baseDamage = parseFloat(params.dmg) || 10;
  for (const key of ['a', 'b']) {
    if (params[key]) {
      const [head, body, legs] = params[key].split(',');
      if (head) loadouts[key].head = head;
      if (body) loadouts[key].body = body;
      if (legs) loadouts[key].legs = legs;
    }
  }
}

// === Init ===
loadHash();

// Build tier buttons
const tierSelector = document.getElementById('tierSelector');
for (let t = 0; t <= 4; t++) {
  const btn = document.createElement('button');
  btn.className = `tier-btn${t === attackTier ? ' active' : ''}`;
  btn.textContent = t;
  btn.addEventListener('click', () => {
    attackTier = t;
    tierSelector.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderResults();
    saveHash();
  });
  tierSelector.appendChild(btn);
}

// Damage input
const dmgInput = document.getElementById('dmgInput');
dmgInput.value = baseDamage;
dmgInput.addEventListener('change', () => {
  baseDamage = Math.max(0, parseFloat(dmgInput.value) || 10);
  renderResults();
  saveHash();
});

// Build slot selects
for (const slot of ['head', 'body', 'legs']) {
  buildSlotSelect('loadout-a', slot, 'a');
  buildSlotSelect('loadout-b', slot, 'b');
}

renderResults();
