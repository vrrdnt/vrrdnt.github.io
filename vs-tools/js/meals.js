// === Meal Planner Data ===

const FOOD_CATEGORIES = ['Fruit', 'Vegetable', 'Grain', 'Protein', 'Dairy'];

const CATEGORY_COLORS = {
  Fruit: '#fbbf24',
  Vegetable: '#4ade80',
  Grain: '#eab308',
  Protein: '#f87171',
  Dairy: '#93c5fd',
};

const MEAL_TYPES = [
  {
    id: 'meat-stew',
    name: 'Meat Stew',
    icon: '\u{1F356}',
    desc: 'Protein + veggies',
    requires: ['Protein'],
    optional: ['Vegetable', 'Fruit', 'Grain'],
    maxSlots: 6,
  },
  {
    id: 'vegetable-stew',
    name: 'Veggie Stew',
    icon: '\u{1F957}',
    desc: 'Vegetables only',
    requires: ['Vegetable'],
    optional: ['Vegetable', 'Fruit'],
    maxSlots: 6,
  },
  {
    id: 'porridge',
    name: 'Porridge',
    icon: '\u{1F35A}',
    desc: 'Grain-based meal',
    requires: ['Grain'],
    optional: ['Fruit', 'Vegetable', 'Dairy'],
    maxSlots: 6,
  },
  {
    id: 'soup',
    name: 'Soup',
    icon: '\u{1F372}',
    desc: 'Light broth meal',
    requires: ['Vegetable'],
    optional: ['Protein', 'Grain', 'Vegetable'],
    maxSlots: 6,
  },
  {
    id: 'jam',
    name: 'Jam',
    icon: '\u{1F353}',
    desc: 'Fruit preserve',
    requires: ['Fruit'],
    optional: ['Fruit'],
    maxSlots: 4,
  },
  {
    id: 'potpie',
    name: 'Pot Pie',
    icon: '\u{1F967}',
    desc: 'Grain crust + meat/veg filling (1.22)',
    requires: ['Grain'],
    optional: ['Protein', 'Vegetable', 'Fruit'],
    maxSlots: 4,
  },
];

// Food items with their nutrition data from game JSON
const FOODS = [
  // Vegetables
  { id: 'cabbage',     name: 'Cabbage',      category: 'Vegetable', satiety: 300, inMeal: 450, icon: 'img/food/cabbage.png' },
  { id: 'pumpkin',     name: 'Pumpkin',       category: 'Vegetable', satiety: 120, inMeal: 180, icon: 'img/food/pumpkin.png' },
  { id: 'bellpepper',  name: 'Bell Pepper',   category: 'Vegetable', satiety: 100, inMeal: 150, icon: 'img/food/bellpepper.png' },
  { id: 'onion',       name: 'Onion',         category: 'Vegetable', satiety: 100, inMeal: 150, icon: 'img/food/onion.png' },
  { id: 'carrot',      name: 'Carrot',        category: 'Vegetable', satiety: 100, inMeal: 150, icon: 'img/food/carrot.png' },
  { id: 'turnip',      name: 'Turnip',        category: 'Vegetable', satiety: 100, inMeal: 150, icon: 'img/food/turnip.png' },
  { id: 'parsnip',     name: 'Parsnip',       category: 'Vegetable', satiety: 100, inMeal: 150, icon: 'img/food/parsnip.png' },
  { id: 'cassava',     name: 'Cassava',       category: 'Vegetable', satiety: 80,  inMeal: 120, icon: 'img/food/cassava.png' },
  { id: 'olive',       name: 'Olive',         category: 'Vegetable', satiety: 80,  inMeal: 100, icon: 'img/food/olive.png' },

  // Fruits
  { id: 'breadfruit',  name: 'Breadfruit',    category: 'Fruit', satiety: 170, inMeal: 250, icon: 'img/food/breadfruit.png' },
  { id: 'blueberry',   name: 'Blueberry',     category: 'Fruit', satiety: 80,  inMeal: 120, icon: 'img/food/blueberry.png' },
  { id: 'cranberry',   name: 'Cranberry',     category: 'Fruit', satiety: 60,  inMeal: 90,  icon: 'img/food/cranberry.png' },
  { id: 'cherry',      name: 'Cherry',        category: 'Fruit', satiety: 40,  inMeal: 60,  icon: 'img/food/cherry.png' },
  { id: 'peach',       name: 'Peach',         category: 'Fruit', satiety: 80,  inMeal: 120, icon: 'img/food/peach.png' },
  { id: 'pear',        name: 'Pear',          category: 'Fruit', satiety: 80,  inMeal: 120, icon: 'img/food/pear.png' },
  { id: 'mango',       name: 'Mango',         category: 'Fruit', satiety: 80,  inMeal: 120, icon: 'img/food/mango.png' },
  { id: 'pineapple',   name: 'Pineapple',     category: 'Fruit', satiety: 80,  inMeal: 120, icon: 'img/food/pineapple.png' },
  { id: 'saguaro',     name: 'Saguaro Fruit', category: 'Fruit', satiety: 60,  inMeal: 90,  icon: 'img/food/saguaro.png' },
  { id: 'currant',     name: 'Currant',        category: 'Fruit', satiety: 80,  inMeal: 120, icon: 'img/food/currant.png' },

  // Grains
  { id: 'spelt',       name: 'Spelt Flour',   category: 'Grain', satiety: 160, inMeal: 240, icon: 'img/food/spelt.png' },
  { id: 'rye',         name: 'Rye Flour',     category: 'Grain', satiety: 160, inMeal: 240, icon: 'img/food/rye.png' },
  { id: 'rice',        name: 'Rice',          category: 'Grain', satiety: 190, inMeal: 280, icon: 'img/food/rice.png' },
  { id: 'amaranth',    name: 'Amaranth Flour',category: 'Grain', satiety: 160, inMeal: 240, icon: 'img/food/amaranth.png' },
  { id: 'flax',        name: 'Flax Seeds',    category: 'Grain', satiety: 80,  inMeal: 120, icon: 'img/food/flax.png' },
  { id: 'sunflower',   name: 'Sunflower Seeds',category:'Grain', satiety: 160, inMeal: 240, icon: 'img/food/sunflower.png' },
  { id: 'cassavaflour',name: 'Cassava Flour', category: 'Grain', satiety: 130, inMeal: 190, icon: 'img/food/cassava-flour.png' },
  { id: 'peanutflour', name: 'Peanut Flour',  category: 'Grain', satiety: 130, inMeal: 190, icon: 'img/food/peanut-flour.png' },

  // Protein
  { id: 'redmeat',     name: 'Red Meat',      category: 'Protein', satiety: 280, inMeal: 420, icon: 'img/food/redmeat.png' },
  { id: 'poultry',     name: 'Poultry',       category: 'Protein', satiety: 250, inMeal: 375, icon: 'img/food/poultry.png' },
  { id: 'bushmeat',    name: 'Bushmeat',      category: 'Protein', satiety: 120, inMeal: 180, icon: 'img/food/bushmeat.png' },
  { id: 'fish',        name: 'Fish',          category: 'Protein', satiety: 250, inMeal: 375, icon: 'img/food/fish.png' },
  { id: 'egg',         name: 'Egg',           category: 'Protein', satiety: 130, inMeal: 200, icon: 'img/food/egg.png' },
  { id: 'peanut',      name: 'Peanut',        category: 'Protein', satiety: 120, inMeal: 180, icon: 'img/food/peanut.png' },
  { id: 'soybean',     name: 'Soybean',       category: 'Protein', satiety: 120, inMeal: 180, icon: 'img/food/soybean.png' },

  // Dairy
  { id: 'cheddar',     name: 'Cheddar',       category: 'Dairy', satiety: 240, inMeal: 360, icon: 'img/food/cheese.png' },
  { id: 'bluecheese',  name: 'Blue Cheese',   category: 'Dairy', satiety: 200, inMeal: 300, icon: 'img/food/cheese.png' },
  { id: 'cheese',      name: 'Raw Cheese',    category: 'Dairy', satiety: 160, inMeal: 240, icon: 'img/food/cheese.png' },
];

// === Expanded Foods Mod Items ===
const EXPANDED_FOODS = [
  // Grain
  { id: 'ef-pasta',       name: 'Pasta (cooked)',     category: 'Grain',   satiety: 120, inMeal: 180, icon: 'img/food/expanded/pasta.png' },
  { id: 'ef-dumpling',    name: 'Dumpling (cooked)',   category: 'Grain',   satiety: 200, inMeal: 300, icon: 'img/food/expanded/dumpling.png' },
  { id: 'ef-hardtack',    name: 'Hardtack',           category: 'Grain',   satiety: 150, inMeal: 220, icon: 'img/food/expanded/hardtack.png' },
  { id: 'ef-muffin',      name: 'Muffin',             category: 'Grain',   satiety: 160, inMeal: 240, icon: 'img/food/expanded/muffin.png' },

  // Protein
  { id: 'ef-pemmican',    name: 'Pemmican (cooked)',   category: 'Protein', satiety: 100, inMeal: 100, icon: 'img/food/expanded/pemmican.png' },
  { id: 'ef-sausage',     name: 'Sausage (cooked)',    category: 'Protein', satiety: 100, inMeal: 100, icon: 'img/food/expanded/sausage.png' },
  { id: 'ef-meatnugget',  name: 'Meat Nugget (cooked)',category: 'Protein', satiety: 210, inMeal: 310, icon: 'img/food/expanded/fishnugget.png' },
  { id: 'ef-fishnugget',  name: 'Fish Nugget (cooked)',category: 'Protein', satiety: 150, inMeal: 220, icon: 'img/food/expanded/fishnugget.png' },
  { id: 'ef-roastedacorn',name: 'Roasted Acorn',       category: 'Protein', satiety: 70,  inMeal: 70,  icon: 'img/food/expanded/roastedacorn.png' },
  { id: 'ef-boiledegg',   name: 'Boiled Egg',          category: 'Protein', satiety: 150, inMeal: 220, icon: 'img/food/expanded/boiledegg.png' },

  // Fruit
  { id: 'ef-candiedfruit',name: 'Candied Fruit',       category: 'Fruit',   satiety: 130, inMeal: 200, icon: 'img/food/expanded/candiedfruit.png' },
  { id: 'ef-driedfruit',  name: 'Dried Fruit',         category: 'Fruit',   satiety: 80,  inMeal: 120, icon: 'img/food/expanded/dryfruit.png' },
  { id: 'ef-trailmixf',   name: 'Trail Mix (fruity)',  category: 'Fruit',   satiety: 100, inMeal: 150, icon: 'img/food/expanded/trailmix.png' },

  // Vegetable
  { id: 'ef-stuffedpepper',name:'Stuffed Pepper',       category: 'Vegetable',satiety: 120, inMeal: 180, icon: 'img/food/expanded/stuffedpepper.png' },

  // Dairy
  { id: 'ef-trailmixc',   name: 'Trail Mix (cheesy)',  category: 'Dairy',   satiety: 100, inMeal: 150, icon: 'img/food/expanded/trailmix.png' },
];

// === Primitive Survival Mod Items ===
const PRIMITIVE_SURVIVAL_FOODS = [
  // Protein — unique PS items
  { id: 'ps-crabmeat',     name: 'Crab Meat',        category: 'Protein', satiety: 116, inMeal: 164, icon: 'img/food/primitivesurvival/crabmeat.png' },
  { id: 'ps-snakemeat',    name: 'Snake Meat',       category: 'Protein', satiety: 136, inMeal: 186, icon: 'img/food/primitivesurvival/snakemeat.png' },
  { id: 'ps-fishfillet',   name: 'Fish Fillet',      category: 'Protein', satiety: 96,  inMeal: 144, icon: 'img/food/primitivesurvival/fishfillet.png' },
  { id: 'ps-fish-small',   name: 'Small Fish (Bass)',category: 'Protein', satiety: 120, inMeal: 180, icon: 'img/food/primitivesurvival/fish-bass.png' },
  { id: 'ps-fish-med',     name: 'Med. Fish (Trout)',category: 'Protein', satiety: 240, inMeal: 320, icon: 'img/food/primitivesurvival/fish-trout.png' },
  { id: 'ps-fish-large',   name: 'Large Fish (Catfish)',category:'Protein',satiety: 480, inMeal: 600, icon: 'img/food/primitivesurvival/fish-catfish.png' },
  { id: 'ps-smoked-red',   name: 'Smoked Red Meat',  category: 'Protein', satiety: 220, inMeal: 330, icon: 'img/food/primitivesurvival/smoked-redmeat.png' },
];

// === Butchering Mod Items ===
const BUTCHERING_FOODS = [
  // Protein
  { id: 'bt-primemeat',    name: 'Prime Meat',       category: 'Protein', satiety: 400, inMeal: 520, icon: 'img/food/butchering/primemeat.png' },
  { id: 'bt-smk-prime',    name: 'Smoked Prime Meat',category: 'Protein', satiety: 300, inMeal: 360, icon: 'img/food/butchering/smoked-primemeat.png' },
  { id: 'bt-smk-red',      name: 'Smoked Red Meat',  category: 'Protein', satiety: 220, inMeal: 300, icon: 'img/food/butchering/smoked-redmeat.png' },
  { id: 'bt-smk-fish',     name: 'Smoked Fish',      category: 'Protein', satiety: 160, inMeal: 190, icon: 'img/food/butchering/smoked-fish.png' },
  { id: 'bt-blood',        name: 'Blood',            category: 'Protein', satiety: 80,  inMeal: 160, icon: 'img/food/butchering/blood.png' },
  { id: 'bt-offal',        name: 'Clean Offal',      category: 'Protein', satiety: 80,  inMeal: 180, icon: 'img/food/butchering/offal.png' },
  { id: 'bt-bloodsausage', name: 'Blood Sausage',    category: 'Protein', satiety: 740, inMeal: 740, icon: 'img/food/butchering/bloodsausage.png' },
  { id: 'bt-blackpudding', name: 'Black Pudding',    category: 'Protein', satiety: 520, inMeal: 520, icon: 'img/food/butchering/blackpudding.png' },
];

// === State ===
let selectedMealType = 'meat-stew';
let selectedIngredients = [];
let servings = 4;
let activeCategory = 'All';
let showExpandedFoods = false;
let showPrimitiveSurvival = false;
let showButchering = false;

// === Get all active foods ===
function getActiveFoods() {
  let foods = [...FOODS];
  if (showExpandedFoods) foods = [...foods, ...EXPANDED_FOODS];
  if (showPrimitiveSurvival) foods = [...foods, ...PRIMITIVE_SURVIVAL_FOODS];
  if (showButchering) foods = [...foods, ...BUTCHERING_FOODS];
  return foods;
}

// === Load state from URL hash ===
function loadState() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const parts = {};
  for (const segment of hash.split(':')) {
    const [k, v] = segment.split('=');
    if (k && v) parts[k] = v;
  }
  if (parts.meal) selectedMealType = parts.meal;
  if (parts.ef === '1') showExpandedFoods = true;
  if (parts.ps === '1') showPrimitiveSurvival = true;
  if (parts.bt === '1') showButchering = true;
  const allFoods = getActiveFoods();
  if (parts.items) selectedIngredients = parts.items.split(',').filter(id => allFoods.find(f => f.id === id));
  if (parts.servings) servings = Math.max(1, Math.min(6, parseInt(parts.servings) || 4));
}

function saveState() {
  let hash = `meal=${selectedMealType}:items=${selectedIngredients.join(',')}:servings=${servings}`;
  if (showExpandedFoods) hash += ':ef=1';
  if (showPrimitiveSurvival) hash += ':ps=1';
  if (showButchering) hash += ':bt=1';
  history.replaceState(null, '', '#' + hash);
}

// === Get current meal type ===
function getMealType() {
  return MEAL_TYPES.find(m => m.id === selectedMealType) || MEAL_TYPES[0];
}

// === Check if a food can be added to current meal ===
function canAddFood(food) {
  const meal = getMealType();
  const allowed = [...meal.requires, ...meal.optional];
  return allowed.includes(food.category);
}

// === Render ===
function render() {
  renderMealTypes();
  renderCategoryTabs();
  renderIngredients();
  renderSelected();
  renderResults();
  saveState();
}

function renderMealTypes() {
  const grid = document.getElementById('mealTypeGrid');
  grid.innerHTML = '';
  for (const meal of MEAL_TYPES) {
    const card = document.createElement('div');
    card.className = `meal-type-card${meal.id === selectedMealType ? ' active' : ''}`;
    card.innerHTML = `
      <div class="meal-type-icon">${meal.icon}</div>
      <div class="meal-type-name">${meal.name}</div>
      <div class="meal-type-desc">${meal.desc}</div>
    `;
    card.addEventListener('click', () => {
      selectedMealType = meal.id;
      // Remove ingredients that don't fit the new meal type
      const allFoods = getActiveFoods();
      selectedIngredients = selectedIngredients.filter(id => {
        const food = allFoods.find(f => f.id === id);
        return food && canAddFood(food);
      });
      render();
    });
    grid.appendChild(card);
  }
}

function renderCategoryTabs() {
  const tabs = document.getElementById('categoryTabs');
  tabs.innerHTML = '';
  const categories = ['All', ...FOOD_CATEGORIES];
  for (const cat of categories) {
    const btn = document.createElement('button');
    btn.className = `category-tab${cat === activeCategory ? ' active' : ''}`;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      renderCategoryTabs();
      renderIngredients();
    });
    tabs.appendChild(btn);
  }
}

function renderIngredients() {
  const grid = document.getElementById('ingredientGrid');
  grid.innerHTML = '';
  const meal = getMealType();

  const allFoods = getActiveFoods();
  const filtered = allFoods.filter(f => activeCategory === 'All' || f.category === activeCategory);

  for (const food of filtered) {
    const allowed = canAddFood(food);
    const isSelected = selectedIngredients.includes(food.id);
    const isFull = selectedIngredients.length >= meal.maxSlots;

    const item = document.createElement('div');
    item.className = `ingredient-item${!allowed || (isFull && !isSelected) ? ' disabled' : ''}${isSelected ? ' selected' : ''}`;

    item.innerHTML = `
      <img class="pixel-icon" src="${food.icon}" alt="" width="24" height="24">
      <span class="ingredient-item-name">${food.name}</span>
      <span class="ingredient-item-sat">${food.inMeal}</span>
    `;

    if (allowed && !(isFull && !isSelected)) {
      item.addEventListener('click', () => {
        if (isSelected) {
          selectedIngredients = selectedIngredients.filter(id => id !== food.id);
        } else if (selectedIngredients.length < meal.maxSlots) {
          selectedIngredients.push(food.id);
        }
        render();
      });
    }

    grid.appendChild(item);
  }
}

function renderSelected() {
  const list = document.getElementById('selectedList');
  const meal = getMealType();
  list.innerHTML = '';

  document.getElementById('slotCount').textContent = `(${selectedIngredients.length}/${meal.maxSlots})`;

  if (selectedIngredients.length === 0) {
    list.innerHTML = '<div class="empty-state">Click ingredients to add them</div>';
    return;
  }

  for (const id of selectedIngredients) {
    const allFoods = getActiveFoods();
    const food = allFoods.find(f => f.id === id);
    if (!food) continue;

    const item = document.createElement('div');
    item.className = 'selected-item';
    item.innerHTML = `
      <img class="pixel-icon" src="${food.icon}" alt="" width="20" height="20">
      <span class="selected-item-name">${food.name}</span>
      <span class="selected-item-cat cat-${food.category.toLowerCase()}">${food.category}</span>
      <button class="selected-item-remove" data-id="${food.id}">&times;</button>
    `;

    item.querySelector('.selected-item-remove').addEventListener('click', () => {
      selectedIngredients = selectedIngredients.filter(i => i !== food.id);
      render();
    });

    list.appendChild(item);
  }
}

function renderResults() {
  const content = document.getElementById('resultsContent');

  if (selectedIngredients.length === 0) {
    content.innerHTML = '<div class="empty-state">Add ingredients to see results</div>';
    return;
  }

  const meal = getMealType();
  const allFoods = getActiveFoods();
  const foods = selectedIngredients.map(id => allFoods.find(f => f.id === id)).filter(Boolean);

  // Calculate satiety per category
  const catSatiety = {};
  for (const cat of FOOD_CATEGORIES) catSatiety[cat] = 0;
  let totalRawSatiety = 0;
  for (const food of foods) {
    catSatiety[food.category] += food.inMeal;
    totalRawSatiety += food.inMeal;
  }

  // Cooking bonus (1.5x for cooked meals)
  const cookingMultiplier = 1.5;
  const totalCooked = totalRawSatiety * cookingMultiplier;
  const perServing = Math.round(totalCooked / servings);

  // Max satiety for bar scaling
  const maxCatSatiety = Math.max(...Object.values(catSatiety), 1);

  // Validate meal requirements
  const warnings = [];
  const presentCategories = new Set(foods.map(f => f.category));
  for (const req of meal.requires) {
    if (!presentCategories.has(req)) {
      warnings.push({ text: `Missing required: ${req}`, type: 'error' });
    }
  }
  if (warnings.length === 0) {
    warnings.push({ text: 'Valid meal composition', type: 'ok' });
  }

  // Build nutrition bars
  let barsHtml = '';
  for (const cat of FOOD_CATEGORIES) {
    const val = catSatiety[cat];
    if (val === 0 && !meal.requires.includes(cat) && !meal.optional.includes(cat)) continue;
    const pct = Math.min((val / maxCatSatiety) * 100, 100);
    barsHtml += `
      <div class="nutrition-row">
        <span class="nutrition-label">${cat}</span>
        <div class="nutrition-bar">
          <div class="nutrition-bar-fill cat-${cat.toLowerCase()}-bar" style="width:${pct}%"></div>
        </div>
        <span class="nutrition-value">${val}</span>
      </div>
    `;
  }

  // Build warnings
  let warningsHtml = '';
  for (const w of warnings) {
    warningsHtml += `<div class="meal-warning ${w.type}">${w.text}</div>`;
  }

  content.innerHTML = `
    <div class="result-satiety">
      <div class="result-satiety-value">${perServing}</div>
      <div class="result-satiety-label">Satiety per serving</div>
      <div class="result-satiety-sub">${totalCooked.toFixed(0)} total (${servings} servings)</div>
    </div>
    <div class="cooking-bonus">1.5x cooking bonus applied</div>
    <div class="nutrition-bars">${barsHtml}</div>
    <div class="meal-warnings">${warningsHtml}</div>
  `;
}

// === Init ===
loadState();

document.getElementById('servingsSlider').value = servings;
document.getElementById('servingsValue').textContent = servings;
document.getElementById('servingsSlider').addEventListener('input', (e) => {
  servings = parseInt(e.target.value);
  document.getElementById('servingsValue').textContent = servings;
  renderResults();
  saveState();
});

// Mod toggles
function setupModToggle(elementId, getter, setter, modFoods) {
  const toggle = document.getElementById(elementId);
  toggle.checked = getter();
  toggle.addEventListener('change', () => {
    setter(toggle.checked);
    if (!toggle.checked) {
      const modIds = new Set(modFoods.map(f => f.id));
      selectedIngredients = selectedIngredients.filter(id => !modIds.has(id));
    }
    render();
  });
}

setupModToggle('efToggle',
  () => showExpandedFoods,
  (v) => { showExpandedFoods = v; },
  EXPANDED_FOODS
);
setupModToggle('psToggle',
  () => showPrimitiveSurvival,
  (v) => { showPrimitiveSurvival = v; },
  PRIMITIVE_SURVIVAL_FOODS
);
setupModToggle('btToggle',
  () => showButchering,
  (v) => { showButchering = v; },
  BUTCHERING_FOODS
);

render();
