// === Farming Planner Data ===

const CROPS = [
  // { id, name, icon, N consumption, P consumption, K consumption, growthDays, season notes }
  // N/P/K values are % consumed per growth cycle (from wiki farming data)
  { id: 'carrot',     name: 'Carrot',      icon: 'img/farming/carrot.png',     n: 25, p: 15, k: 25, days: 4.25 },
  { id: 'cabbage',    name: 'Cabbage',     icon: 'img/farming/cabbage.png',    n: 40, p: 25, k: 25, days: 5.75 },
  { id: 'onion',      name: 'Onion',       icon: 'img/farming/onion.png',      n: 25, p: 15, k: 25, days: 4.25 },
  { id: 'turnip',     name: 'Turnip',      icon: 'img/farming/turnip.png',     n: 20, p: 15, k: 20, days: 3.0 },
  { id: 'parsnip',    name: 'Parsnip',     icon: 'img/farming/parsnip.png',    n: 25, p: 15, k: 25, days: 4.25 },
  { id: 'pumpkin',    name: 'Pumpkin',     icon: 'img/farming/pumpkin.png',    n: 35, p: 30, k: 35, days: 7.0 },
  { id: 'bellpepper', name: 'Bell Pepper', icon: 'img/farming/bellpepper.png', n: 30, p: 20, k: 30, days: 6.0 },
  { id: 'cassava',    name: 'Cassava',     icon: 'img/farming/cassava.png',    n: 20, p: 10, k: 20, days: 4.25 },
  { id: 'spelt',      name: 'Spelt',       icon: 'img/farming/spelt.png',      n: 40, p: 15, k: 25, days: 5.75 },
  { id: 'rye',        name: 'Rye',         icon: 'img/farming/rye.png',        n: 35, p: 15, k: 25, days: 5.75 },
  { id: 'rice',       name: 'Rice',        icon: 'img/farming/rice.png',       n: 40, p: 15, k: 20, days: 5.75 },
  { id: 'amaranth',   name: 'Amaranth',    icon: 'img/farming/amaranth.png',   n: 30, p: 15, k: 20, days: 5.75 },
  { id: 'flax',       name: 'Flax',        icon: 'img/farming/flax.png',       n: 20, p: 10, k: 15, days: 4.25 },
  { id: 'sunflower',  name: 'Sunflower',   icon: 'img/farming/sunflower.png',  n: 35, p: 20, k: 25, days: 6.0 },
  { id: 'peanut',     name: 'Peanut',      icon: 'img/farming/peanut.png',     n: -10, p: 15, k: 20, days: 5.0 },
  { id: 'soybean',    name: 'Soybean',     icon: 'img/farming/soybean.png',    n: -15, p: 15, k: 20, days: 5.0 },
  { id: 'pineapple',  name: 'Pineapple',   icon: 'img/farming/pineapple.png',  n: 25, p: 20, k: 30, days: 7.0 },
];

const FERTILIZERS = [
  { id: 'none',      name: 'None',       icon: null,                         n: 0,  p: 0,  k: 0 },
  { id: 'compost',   name: 'Compost',    icon: 'img/farming/bonemeal.png',   n: 15, p: 15, k: 15 },
  { id: 'bonemeal',  name: 'Bonemeal',   icon: 'img/farming/bonemeal.png',   n: 0,  p: 30, k: 0 },
  { id: 'saltpeter', name: 'Saltpeter',  icon: 'img/farming/saltpeter.png',  n: 30, p: 0,  k: 0 },
  { id: 'potash',    name: 'Potash',     icon: 'img/farming/potash.png',     n: 0,  p: 0,  k: 30 },
];

const SEASONS = [
  { id: 1, name: 'Spring' },
  { id: 2, name: 'Summer' },
  { id: 3, name: 'Fall' },
];

// === State ===
let gridSize = 4;
let currentSeason = 1;
let selectedTool = null; // { type: 'crop'|'fert'|'eraser', id }
// Grid data: grid[season][row][col] = { crop: id|null, fert: id|null }
let grid = {};

function initGrid() {
  for (const s of SEASONS) {
    if (!grid[s.id]) grid[s.id] = [];
    for (let r = 0; r < gridSize; r++) {
      if (!grid[s.id][r]) grid[s.id][r] = [];
      for (let c = 0; c < gridSize; c++) {
        if (!grid[s.id][r][c]) {
          grid[s.id][r][c] = { crop: null, fert: null };
        }
      }
    }
    // Trim if grid shrunk
    grid[s.id] = grid[s.id].slice(0, gridSize).map(row => row.slice(0, gridSize));
  }
}

// === Load/Save State ===
function loadState() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  try {
    const params = {};
    for (const part of hash.split(':')) {
      const eq = part.indexOf('=');
      if (eq > 0) params[part.slice(0, eq)] = part.slice(eq + 1);
    }
    if (params.size) gridSize = Math.max(2, Math.min(6, parseInt(params.size) || 4));
    if (params.grid) {
      const decoded = JSON.parse(decodeURIComponent(params.grid));
      for (const [sKey, rows] of Object.entries(decoded)) {
        grid[parseInt(sKey)] = rows;
      }
    }
  } catch (e) { /* ignore */ }
}

function saveState() {
  // Only save non-empty cells to keep URL short
  const compact = {};
  let hasData = false;
  for (const s of SEASONS) {
    if (!grid[s.id]) continue;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[s.id]?.[r]?.[c];
        if (cell && (cell.crop || cell.fert)) {
          if (!compact[s.id]) compact[s.id] = [];
          // Ensure rows exist
          while (compact[s.id].length <= r) compact[s.id].push([]);
          while (compact[s.id][r].length <= c) compact[s.id][r].push({crop:null,fert:null});
          compact[s.id][r][c] = cell;
          hasData = true;
        }
      }
    }
  }
  const hash = `size=${gridSize}${hasData ? ':grid=' + encodeURIComponent(JSON.stringify(compact)) : ''}`;
  history.replaceState(null, '', '#' + hash);
}

// === Nutrient Calculation ===
function calcNutrients() {
  // Returns nutrients[row][col] = { n, p, k } after all seasons
  const nutrients = [];
  for (let r = 0; r < gridSize; r++) {
    nutrients[r] = [];
    for (let c = 0; c < gridSize; c++) {
      let n = 100, p = 100, k = 100;
      for (const s of SEASONS) {
        const cell = grid[s.id]?.[r]?.[c];
        if (!cell) continue;
        // Apply fertilizer first (adds nutrients)
        if (cell.fert) {
          const fert = FERTILIZERS.find(f => f.id === cell.fert);
          if (fert) {
            n = Math.min(100, n + fert.n);
            p = Math.min(100, p + fert.p);
            k = Math.min(100, k + fert.k);
          }
        }
        // Apply crop consumption
        if (cell.crop) {
          const crop = CROPS.find(cr => cr.id === cell.crop);
          if (crop) {
            n = Math.max(0, n - crop.n);
            p = Math.max(0, p - crop.p);
            k = Math.max(0, k - crop.k);
          }
        }
      }
      nutrients[r][c] = { n: Math.round(n), p: Math.round(p), k: Math.round(k) };
    }
  }
  return nutrients;
}

// === Auto-Suggest Rotation ===
function autoSuggest() {
  // Simple strategy: Season 1 = heavy feeder, Season 2 = light feeder, Season 3 = legume
  const heavy = CROPS.filter(c => c.n >= 30 && c.n > 0);
  const light = CROPS.filter(c => c.n > 0 && c.n < 30);
  const legumes = CROPS.filter(c => c.n < 0);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const hIdx = (r * gridSize + c) % heavy.length;
      const lIdx = (r * gridSize + c) % light.length;
      const legIdx = (r * gridSize + c) % legumes.length;
      grid[1][r][c] = { crop: heavy[hIdx].id, fert: null };
      grid[2][r][c] = { crop: light[lIdx].id, fert: null };
      grid[3][r][c] = { crop: legumes[legIdx].id, fert: 'compost' };
    }
  }
  render();
}

// === Render ===
function render() {
  renderSeasonTabs();
  renderGrid();
  renderPalette();
  renderNutrients();
  saveState();
}

function renderSeasonTabs() {
  const container = document.getElementById('seasonTabs');
  container.innerHTML = '';
  for (const s of SEASONS) {
    const btn = document.createElement('button');
    btn.className = `season-tab${s.id === currentSeason ? ' active' : ''}`;
    btn.textContent = s.name;
    btn.addEventListener('click', () => { currentSeason = s.id; render(); });
    container.appendChild(btn);
  }
}

function renderGrid() {
  const farmGrid = document.getElementById('farmGrid');
  farmGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  farmGrid.innerHTML = '';

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = grid[currentSeason]?.[r]?.[c] || { crop: null, fert: null };
      const crop = cell.crop ? CROPS.find(cr => cr.id === cell.crop) : null;
      const fert = cell.fert ? FERTILIZERS.find(f => f.id === cell.fert) : null;

      const div = document.createElement('div');
      div.className = `farm-cell${crop ? ' has-crop' : ''}`;
      div.dataset.row = r;
      div.dataset.col = c;

      if (crop) {
        div.innerHTML = `
          <img class="farm-cell-icon pixel-icon" src="${crop.icon}" alt="${crop.name}" width="28" height="28">
          <span class="farm-cell-name">${crop.name}</span>
          ${fert && fert.icon ? `<img class="farm-cell-fert pixel-icon" src="${fert.icon}" alt="${fert.name}" width="14" height="14">` : ''}
        `;
      } else {
        div.innerHTML = `<span class="farm-cell-empty">+</span>
          ${fert && fert.icon ? `<img class="farm-cell-fert pixel-icon" src="${fert.icon}" alt="${fert.name}" width="14" height="14">` : ''}`;
      }

      div.addEventListener('click', () => handleCellClick(r, c));

      // Allow dragging crops OUT of grid cells
      if (crop) {
        div.draggable = true;
        div.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'remove', row: r, col: c }));
          e.dataTransfer.effectAllowed = 'move';
        });
      }

      // Drop target
      div.addEventListener('dragover', (e) => {
        e.preventDefault();
        div.classList.add('drag-over');
      });
      div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over');
      });
      div.addEventListener('drop', (e) => {
        e.preventDefault();
        div.classList.remove('drag-over');
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (!grid[currentSeason][r]) grid[currentSeason][r] = [];
          if (!grid[currentSeason][r][c]) grid[currentSeason][r][c] = { crop: null, fert: null };
          const cell = grid[currentSeason][r][c];
          if (data.type === 'crop') cell.crop = data.id;
          else if (data.type === 'fert') cell.fert = data.id;
          else if (data.type === 'remove') {
            // Move crop from source cell to this cell
            const src = grid[currentSeason]?.[data.row]?.[data.col];
            if (src) {
              cell.crop = src.crop;
              cell.fert = src.fert;
              src.crop = null;
              src.fert = null;
            }
          }
          render();
        } catch (err) { /* ignore */ }
      });

      farmGrid.appendChild(div);
    }
  }
}

function handleCellClick(row, col) {
  if (!grid[currentSeason][row]) grid[currentSeason][row] = [];
  if (!grid[currentSeason][row][col]) grid[currentSeason][row][col] = { crop: null, fert: null };

  if (!selectedTool) return;

  const cell = grid[currentSeason][row][col];
  if (selectedTool.type === 'crop') {
    cell.crop = cell.crop === selectedTool.id ? null : selectedTool.id;
  } else if (selectedTool.type === 'fert') {
    cell.fert = cell.fert === selectedTool.id ? null : selectedTool.id;
  } else if (selectedTool.type === 'eraser') {
    cell.crop = null;
    cell.fert = null;
  }
  render();
}

function renderPalette() {
  const cropList = document.getElementById('cropList');
  const fertList = document.getElementById('fertList');
  cropList.innerHTML = '';
  fertList.innerHTML = '';

  // Eraser
  const eraser = document.createElement('div');
  eraser.className = `palette-eraser${selectedTool?.type === 'eraser' ? ' active' : ''}`;
  eraser.textContent = 'Eraser';
  eraser.addEventListener('click', () => {
    selectedTool = selectedTool?.type === 'eraser' ? null : { type: 'eraser' };
    renderPalette();
  });
  cropList.appendChild(eraser);

  for (const crop of CROPS) {
    const item = document.createElement('div');
    item.className = `crop-item${selectedTool?.type === 'crop' && selectedTool.id === crop.id ? ' active' : ''}`;
    item.draggable = true;
    const nSign = crop.n < 0 ? '+' : '-';
    item.innerHTML = `
      <img class="pixel-icon" src="${crop.icon}" alt="" width="20" height="20">
      <span class="crop-item-name">${crop.name}</span>
      <span class="crop-item-npk">${nSign}${Math.abs(crop.n)}N</span>
    `;
    item.addEventListener('click', () => {
      selectedTool = (selectedTool?.type === 'crop' && selectedTool.id === crop.id)
        ? null
        : { type: 'crop', id: crop.id };
      renderPalette();
    });
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'crop', id: crop.id }));
      e.dataTransfer.effectAllowed = 'copy';
    });
    cropList.appendChild(item);
  }

  for (const fert of FERTILIZERS.filter(f => f.id !== 'none')) {
    const item = document.createElement('div');
    item.className = `fert-item${selectedTool?.type === 'fert' && selectedTool.id === fert.id ? ' active' : ''}`;
    item.draggable = true;
    const parts = [];
    if (fert.n) parts.push(`+${fert.n}N`);
    if (fert.p) parts.push(`+${fert.p}P`);
    if (fert.k) parts.push(`+${fert.k}K`);
    item.innerHTML = `
      <img class="pixel-icon" src="${fert.icon}" alt="" width="20" height="20">
      <span class="fert-item-name">${fert.name}</span>
      <span class="crop-item-npk">${parts.join(' ')}</span>
    `;
    item.addEventListener('click', () => {
      selectedTool = (selectedTool?.type === 'fert' && selectedTool.id === fert.id)
        ? null
        : { type: 'fert', id: fert.id };
      renderPalette();
    });
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'fert', id: fert.id }));
      e.dataTransfer.effectAllowed = 'copy';
    });
    fertList.appendChild(item);
  }

  // Make palette a drop target for removing crops (drag back to list)
  const palette = document.querySelector('.crop-palette');
  palette.addEventListener('dragover', (e) => {
    const data = e.dataTransfer.types.includes('text/plain');
    if (data) {
      e.preventDefault();
      palette.classList.add('drag-over-remove');
    }
  });
  palette.addEventListener('dragleave', (e) => {
    if (!palette.contains(e.relatedTarget)) {
      palette.classList.remove('drag-over-remove');
    }
  });
  palette.addEventListener('drop', (e) => {
    e.preventDefault();
    palette.classList.remove('drag-over-remove');
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'remove') {
        const src = grid[currentSeason]?.[data.row]?.[data.col];
        if (src) {
          src.crop = null;
          src.fert = null;
        }
        render();
      }
    } catch (err) { /* ignore */ }
  });
}

function renderNutrients() {
  const nutrients = calcNutrients();
  const nutrientGrid = document.getElementById('nutrientGrid');
  nutrientGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  nutrientGrid.innerHTML = '';

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const { n, p, k } = nutrients[r][c];
      const minVal = Math.min(n, p, k);

      const cell = document.createElement('div');
      cell.className = `nutrient-cell${minVal <= 20 ? ' depleted' : minVal <= 50 ? ' low' : ''}`;

      // Show crop name from season 1 as label
      const s1crop = grid[1]?.[r]?.[c]?.crop;
      const cropName = s1crop ? CROPS.find(cr => cr.id === s1crop)?.name || '' : `(${r+1},${c+1})`;

      cell.innerHTML = `
        <div class="nutrient-cell-label">${cropName}</div>
        ${renderNutrientBar('N', 'n', n)}
        ${renderNutrientBar('P', 'p', p)}
        ${renderNutrientBar('K', 'k', k)}
      `;
      nutrientGrid.appendChild(cell);
    }
  }
}

function renderNutrientBar(letter, cls, value) {
  return `
    <div class="nutrient-bar-row">
      <span class="nutrient-bar-letter ${cls}">${letter}</span>
      <div class="nutrient-mini-bar">
        <div class="nutrient-mini-fill ${cls}" style="width:${value}%"></div>
      </div>
      <span class="nutrient-bar-value">${value}%</span>
    </div>
  `;
}

// === Init ===
loadState();
initGrid();

document.getElementById('gridSize').value = gridSize;
document.getElementById('gridSize').addEventListener('change', (e) => {
  gridSize = parseInt(e.target.value) || 4;
  initGrid();
  render();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  grid = {};
  initGrid();
  selectedTool = null;
  render();
});

document.getElementById('autoBtn').addEventListener('click', autoSuggest);

render();
