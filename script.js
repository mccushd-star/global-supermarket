const departments = [
  { name: 'Fresh food', icon: '🥬', categories: ['Fruit & vegetables', 'Meat & poultry', 'Fish & seafood', 'Bakery'] },
  { name: 'Grocery', icon: '🛒', categories: ['Pantry', 'Breakfast', 'Snacks & sweets', 'Drinks'] },
  { name: 'Dairy & chilled', icon: '🥛', categories: ['Dairy & eggs', 'Frozen'] },
  { name: 'Home', icon: '🏠', categories: ['Home & cleaning', 'Personal care'] },
  { name: 'Baby & kids', icon: '🧸', categories: ['Baby & kids'] },
  { name: 'Beauty & health', icon: '🧴', categories: ['Personal care'] },
  { name: 'Electronics', icon: '🎧', categories: ['Electronics'] },
  { name: 'Offers', icon: '🏷️', categories: [] }
];

const products = [
  { id: 1, name: 'Hass Avocado', category: 'Fruit & vegetables', price: 6.50, emoji: '🥑', rating: 4.8, badge: 'Fresh pick', description: 'Creamy ripe avocados, great for salads and toast.', brand: 'Green Basket', deal: false },
  { id: 2, name: 'Red Apples', category: 'Fruit & vegetables', price: 8.95, emoji: '🍎', rating: 4.7, badge: '', description: 'Crisp, sweet apples for lunchboxes and snacking.', brand: 'Orchard Select', deal: true, oldPrice: 10.50 },
  { id: 3, name: 'Sweet Bananas', category: 'Fruit & vegetables', price: 5.25, emoji: '🍌', rating: 4.9, badge: 'Popular', description: 'Naturally sweet bananas, sold by the bunch.', brand: 'Green Basket', deal: false },
  { id: 4, name: 'Baby Spinach', category: 'Fruit & vegetables', price: 7.75, emoji: '🥬', rating: 4.6, badge: '', description: 'Tender washed leaves for salads and smoothies.', brand: 'Green Basket', deal: false },
  { id: 5, name: 'Cherry Tomatoes', category: 'Fruit & vegetables', price: 9.50, emoji: '🍅', rating: 4.7, badge: 'Local favorite', description: 'Juicy tomatoes, perfect for a fresh salad.', brand: 'Farm Table', deal: true, oldPrice: 11.00 },
  { id: 6, name: 'Fresh Chicken Breast', category: 'Meat & poultry', price: 24.95, emoji: '🍗', rating: 4.8, badge: 'Fresh', description: 'Boneless chicken breast, chilled and ready to cook.', brand: 'Daily Farm', deal: false },
  { id: 7, name: 'Lean Beef Mince', category: 'Meat & poultry', price: 29.50, emoji: '🥩', rating: 4.5, badge: '', description: 'Versatile lean mince for weeknight family meals.', brand: 'Daily Farm', deal: true, oldPrice: 33.00 },
  { id: 8, name: 'Fresh Salmon Fillet', category: 'Fish & seafood', price: 38.00, emoji: '🐟', rating: 4.8, badge: 'Fresh catch', description: 'Rich, flaky salmon portions for an easy dinner.', brand: 'Coastal Choice', deal: false },
  { id: 9, name: 'White Prawns', category: 'Fish & seafood', price: 32.95, emoji: '🦐', rating: 4.6, badge: '', description: 'Succulent prawns for curries, grills and pasta.', brand: 'Coastal Choice', deal: false },
  { id: 10, name: 'Sourdough Loaf', category: 'Bakery', price: 12.00, emoji: '🍞', rating: 4.9, badge: 'Baked today', description: 'Crusty artisan loaf with a soft, airy centre.', brand: 'Oven & Grain', deal: false },
  { id: 11, name: 'Butter Croissants', category: 'Bakery', price: 9.75, emoji: '🥐', rating: 4.7, badge: '', description: 'Golden flaky pastries for a slower morning.', brand: 'Oven & Grain', deal: true, oldPrice: 11.50 },
  { id: 12, name: 'Whole Milk 1L', category: 'Dairy & eggs', price: 6.25, emoji: '🥛', rating: 4.7, badge: '', description: 'Chilled whole milk for tea, cereal and cooking.', brand: 'Meadow Dairy', deal: false },
  { id: 13, name: 'Free Range Eggs 12 pack', category: 'Dairy & eggs', price: 14.50, emoji: '🥚', rating: 4.8, badge: 'Farm fresh', description: 'A dozen free-range eggs for breakfast and baking.', brand: 'Meadow Dairy', deal: false },
  { id: 14, name: 'Greek Style Yoghurt', category: 'Dairy & eggs', price: 11.95, emoji: '🥣', rating: 4.6, badge: '', description: 'Thick, creamy yoghurt for breakfast or a snack.', brand: 'Meadow Dairy', deal: true, oldPrice: 13.50 },
  { id: 15, name: 'Basmati Rice 2kg', category: 'Pantry', price: 22.00, emoji: '🍚', rating: 4.8, badge: 'Pantry staple', description: 'Long-grain aromatic rice for everyday meals.', brand: 'Golden Grain', deal: false },
  { id: 16, name: 'Extra Virgin Olive Oil', category: 'Pantry', price: 34.95, emoji: '🫒', rating: 4.8, badge: '', description: 'Smooth olive oil for cooking and dressings.', brand: 'Olive Grove', deal: true, oldPrice: 39.00 },
  { id: 17, name: 'Chickpeas 400g', category: 'Pantry', price: 4.25, emoji: '🥫', rating: 4.5, badge: '', description: 'A handy cupboard staple for salads, stews and hummus.', brand: 'Golden Grain', deal: false },
  { id: 18, name: 'Rolled Oats 1kg', category: 'Breakfast', price: 13.75, emoji: '🥣', rating: 4.7, badge: 'Good start', description: 'Hearty oats for porridge, baking and overnight oats.', brand: 'Morning Mill', deal: false },
  { id: 19, name: 'Honey Granola', category: 'Breakfast', price: 18.50, emoji: '🥜', rating: 4.6, badge: '', description: 'Crunchy toasted clusters with a touch of honey.', brand: 'Morning Mill', deal: true, oldPrice: 21.00 },
  { id: 20, name: 'Date & Nut Bar', category: 'Snacks & sweets', price: 8.00, emoji: '🍫', rating: 4.4, badge: '', description: 'A chewy little pick-me-up made with dates and nuts.', brand: 'Daybreak', deal: false },
  { id: 21, name: 'Sea Salt Crisps', category: 'Snacks & sweets', price: 6.75, emoji: '🥔', rating: 4.5, badge: 'Snack time', description: 'Lightly salted, satisfyingly crunchy potato crisps.', brand: 'Crisp Co.', deal: true, oldPrice: 8.00 },
  { id: 22, name: 'Sparkling Water 6 pack', category: 'Drinks', price: 12.50, emoji: '🫧', rating: 4.6, badge: '', description: 'Refreshing sparkling water for the whole table.', brand: 'Clear Spring', deal: false },
  { id: 23, name: 'Orange Juice 1L', category: 'Drinks', price: 10.25, emoji: '🧃', rating: 4.7, badge: 'Chilled', description: 'Bright citrus juice for breakfast and beyond.', brand: 'Sun Press', deal: true, oldPrice: 12.00 },
  { id: 24, name: 'Vanilla Ice Cream', category: 'Frozen', price: 19.95, emoji: '🍨', rating: 4.8, badge: '', description: 'Classic creamy vanilla dessert for the freezer.', brand: 'Cool Spoon', deal: false },
  { id: 25, name: 'Mixed Vegetables', category: 'Frozen', price: 9.50, emoji: '🫛', rating: 4.5, badge: 'Easy meals', description: 'A colorful frozen vegetable mix, ready when you are.', brand: 'Cool Spoon', deal: false },
  { id: 26, name: 'Laundry Detergent', category: 'Home & cleaning', price: 28.00, emoji: '🧺', rating: 4.6, badge: '', description: 'Everyday laundry care for a fresh clean wash.', brand: 'Home Day', deal: true, oldPrice: 32.00 },
  { id: 27, name: 'Dishwashing Liquid', category: 'Home & cleaning', price: 11.50, emoji: '🧽', rating: 4.5, badge: '', description: 'A reliable kitchen essential for daily dishwashing.', brand: 'Home Day', deal: false },
  { id: 28, name: 'Gentle Hand Wash', category: 'Personal care', price: 13.95, emoji: '🧴', rating: 4.4, badge: '', description: 'A gentle everyday hand wash for the whole family.', brand: 'Kind Skin', deal: false },
  { id: 29, name: 'Baby Soft Wipes', category: 'Baby & kids', price: 16.00, emoji: '🧸', rating: 4.7, badge: 'Family pick', description: 'Soft fragrance-free wipes for little everyday messes.', brand: 'Little Steps', deal: true, oldPrice: 18.00 },
  { id: 30, name: 'Building Blocks Set', category: 'Baby & kids', price: 49.00, emoji: '🧩', rating: 4.6, badge: 'Play time', description: 'A colorful starter set for creative play at home.', brand: 'Play Corner', deal: false },
  { id: 31, name: 'Wireless Earbuds', category: 'Electronics', price: 89.00, emoji: '🎧', rating: 4.5, badge: 'New find', description: 'Compact wireless earbuds for music and calls.', brand: 'Sound Grove', deal: true, oldPrice: 109.00 },
  { id: 32, name: 'USB-C Wall Charger', category: 'Electronics', price: 39.00, emoji: '🔌', rating: 4.4, badge: '', description: 'A compact charger for compatible everyday devices.', brand: 'Bright Tech', deal: false }
];

const productPhotos = {
  1: 'photo-1523049673857-eb18f1d7b578',
  2: 'photo-1560806887-1e4cd0b6cbd6',
  3: 'photo-1571771894821-ce9b6c11b08e',
  4: 'photo-1576045057995-568f588f82fb',
  5: 'photo-1546094096-0df4bcaaa337',
  6: 'photo-1604503468506-a8da13d82791',
  7: 'photo-1607623814075-e51df1bdc82f',
  8: 'photo-1519708227418-c8fd9a32b7a2',
  9: 'photo-1565680018434-b513d5e5fd47',
  10: 'photo-1509440159596-0249088772ff',
  11: 'photo-1555507036-ab1f4038808a',
  12: 'photo-1550583724-b2692b85b150',
  13: 'photo-1518569656558-1f25e69d93d7',
  14: 'photo-1488477181946-6428a0291777',
  15: 'photo-1586201375761-83865001e31c',
  16: 'photo-1474979266404-7eaacbcd87c5',
  17: 'photo-1515543904379-3d757afe72e4',
  18: 'photo-1574323347407-f5e1ad6d020b',
  19: 'photo-1517093157656-b9eccef91cb1',
  20: 'photo-1606313564200-e75d5e30476c',
  21: 'photo-1573080496219-bb080dd4f877',
  22: 'photo-1527960471264-932f39eb5846',
  23: 'photo-1600271886742-f049cd451bba',
  24: 'photo-1563805042-7684c019e1cb',
  25: 'photo-1587049633312-d628ae50a8ae',
  26: 'photo-1602143407151-7111542de6e8',
  27: 'photo-1585421514738-01798e348b17',
  28: 'photo-1608248543803-ba4f8c70ae0b',
  29: 'photo-1604917877934-07d8d248d396',
  30: 'photo-1599623560574-39d485900c95',
  31: 'photo-1606220945770-b5b6c2c55bf1',
  32: 'photo-1609091839311-d5365f9ff1c5'
};

const STORAGE_KEYS = { cart: 'global-supermarket-cart', favorites: 'global-supermarket-favorites', country: 'global-supermarket-country' };
const DELIVERY_FEE = 10;
const FREE_DELIVERY_THRESHOLD = 100;
const countries = window.GLOBAL_COUNTRIES;
const countriesByCode = new Map(countries.map((country) => [country.code, country]));
const currencyRates = { AED: 1 };
let exchangeRateDate = '';
let exchangeRateLoading = true;
const state = {
  category: 'All',
  search: '',
  offersOnly: false,
  favoritesOnly: false,
  maxPrice: 100,
  sort: 'featured',
  cart: readStorage(STORAGE_KEYS.cart, []),
  favorites: readStorage(STORAGE_KEYS.favorites, []),
  countryCode: readCountryCode()
};

const $ = (selector) => document.querySelector(selector);
const productsGrid = $('#productsGrid');
const cartCount = $('#headerCartCount');
const categoryNames = [...new Set(products.map((product) => product.category))];
const currencyFormatters = new Map();

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(`Unable to read saved shop data (${key}).`, error);
    return fallback;
  }
}

function readCountryCode() {
  const savedCountry = readStorage(STORAGE_KEYS.country, null);
  if (countriesByCode.has(savedCountry)) return savedCountry;
  return countriesByCode.has('AE') ? 'AE' : countries[0].code;
}

function getCountry(code = state.countryCode) {
  return countriesByCode.get(code) || countriesByCode.get('AE') || countries[0];
}

function getCountryCurrency(country = getCountry()) {
  return country.currency || 'AED';
}

function getDisplayCurrency() {
  const country = getCountry();
  const currencyCode = getCountryCurrency(country);
  return currencyRates[currencyCode] ? currencyCode : 'AED';
}

function formatCurrency(value, currencyCode, countryCode) {
  const locale = `en-${countryCode}`;
  const key = `${locale}:${currencyCode}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode });
    } catch {
      formatter = new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode });
    }
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(value);
}

function renderCurrencyNotice() {
  const country = getCountry();
  const countryCurrency = getCountryCurrency(country);
  if (countryCurrency !== 'AED' && !currencyRates[countryCurrency]) {
    $('#currencyNotice').textContent = exchangeRateLoading
      ? `Loading ${countryCurrency} rate for ${country.name}; prices are temporarily in AED.`
      : `No current ${countryCurrency} rate for ${country.name}; prices remain in AED.`;
    return;
  }
  if (exchangeRateLoading) {
    $('#currencyNotice').textContent = `Loading daily exchange rates; prices are temporarily shown in AED for ${country.name}.`;
    return;
  }
  if (!exchangeRateDate && countryCurrency === 'AED') {
    $('#currencyNotice').textContent = 'Daily exchange rates unavailable; prices remain in AED.';
    return;
  }
  const dateText = exchangeRateDate ? ` · daily rate ${exchangeRateDate}` : '';
  $('#currencyNotice').textContent = `Prices in ${getDisplayCurrency()} for ${country.name}${dateText}. Indicative rates; no worldwide delivery.`;
}

function normalizeExchangeRateEntries(payload) {
  if (Array.isArray(payload)) {
    return payload.filter((entry) => entry && typeof entry.quote === 'string' && Number.isFinite(entry.rate) && entry.rate > 0)
      .map((entry) => ({ quote: entry.quote, rate: entry.rate, date: entry.date || '' }));
  }

  if (payload && typeof payload === 'object' && payload.rates && typeof payload.rates === 'object') {
    return Object.entries(payload.rates)
      .filter(([, rate]) => Number.isFinite(rate) && rate > 0)
      .map(([quote, rate]) => ({ quote, rate, date: payload.date || '' }));
  }

  return [];
}

async function loadExchangeRates() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://api.frankfurter.dev/v2/rates?base=AED', { signal: controller.signal });
    if (!response.ok) throw new Error(`Exchange rate service returned ${response.status}.`);
    const payload = await response.json();
    const entries = normalizeExchangeRateEntries(payload);
    if (!entries.length) throw new Error('Exchange rate service returned an invalid response.');

    const rates = Object.fromEntries(entries.map((entry) => [entry.quote, Number(entry.rate)]));
    if (rates.AED !== 1) throw new Error('Exchange rate service did not return AED as the base currency.');
    Object.assign(currencyRates, rates);
    exchangeRateDate = entries[0]?.date || '';
  } catch (error) {
    console.error('Unable to load daily exchange rates.', error);
  } finally {
    clearTimeout(timeout);
  }
  exchangeRateLoading = false;
  renderCurrencyNotice();
  syncFilterControls();
  renderProducts();
}

function renderCountryOptions(searchTerm = '') {
  const term = searchTerm.trim().toLocaleLowerCase();
  const matchingCountries = countries
    .filter((country) => {
      const currencyCode = getCountryCurrency(country);
      const searchable = `${country.name} ${country.code} ${currencyCode}`.toLocaleLowerCase();
      return searchable.includes(term);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const results = $('#countryResults');
  if (!matchingCountries.length) {
    results.innerHTML = '<p class="country-empty">No countries match your search.</p>';
    return;
  }
  results.innerHTML = matchingCountries.map((country) => {
    const currencyCode = getCountryCurrency(country);
    const localeDisplayNames = typeof Intl !== 'undefined' && Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'currency' }) : null;
    const currencyName = localeDisplayNames ? localeDisplayNames.of(currencyCode) : currencyCode;
    const rateStatus = exchangeRateLoading
      ? `${currencyCode} · loading rate`
      : currencyRates[currencyCode]
        ? `${currencyCode} · ${currencyName}`
        : `${currencyCode} · rate unavailable`;
    return `<button type="button" class="country-option ${country.code === state.countryCode ? 'selected' : ''}" data-country-code="${country.code}"><span>${country.name}</span><small>${rateStatus}</small></button>`;
  }).join('');
  results.querySelectorAll('[data-country-code]').forEach((button) => button.addEventListener('click', () => {
    state.countryCode = button.dataset.countryCode;
    saveStorage(STORAGE_KEYS.country, state.countryCode);
    $('#selectedLocation').textContent = getCountry().name;
    renderCurrencyNotice();
    closeModal();
    syncFilterControls();
    renderProducts();
    const selectedCurrency = getCountryCurrency();
    showToast(currencyRates[selectedCurrency]
      ? `Shopping country set to ${getCountry().name}`
      : `No ${selectedCurrency} exchange rate available; prices remain in AED.`);
  }));
}

function getDeliverySlots() {
  const nowParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const nowValues = Object.fromEntries(nowParts.map(({ type, value }) => [type, value]));
  const now = new Date(Date.UTC(
    Number(nowValues.year),
    Number(nowValues.month) - 1,
    Number(nowValues.day),
    Number(nowValues.hour),
    Number(nowValues.minute),
    Number(nowValues.second)
  ));
  const earliestSlot = new Date(now.getTime() + 60 * 60 * 1000);
  const windows = [
    { startHour: 9, label: '9 am – 12 pm' },
    { startHour: 12, label: '12 pm – 3 pm' },
    { startHour: 18, label: '6 pm – 9 pm' }
  ];
  const dateFormatter = new Intl.DateTimeFormat('en-AE', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return Array.from({ length: 3 }, (_, dayOffset) => {
    const slotDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset, 12));
    const dateLabel = dayOffset === 0
      ? 'Today'
      : dateFormatter.format(slotDay);
    return windows
      .filter(({ startHour }) => {
        const start = new Date(slotDay);
        start.setUTCHours(startHour, 0, 0, 0);
        return start >= earliestSlot;
      })
      .map(({ label }) => `${dateLabel}, ${label}`);
  }).flat();
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save shop data (${key}).`, error);
    showToast('Changes could not be saved in this browser.');
  }
}

function money(value) {
  const country = getCountry();
  const currencyCode = getDisplayCurrency();
  const rate = currencyRates[currencyCode] || 1;
  return formatCurrency(value * rate, currencyCode, country.code);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function renderDepartments() {
  $('#departmentNav').innerHTML = departments.map((department) => `
    <button type="button" data-department="${department.name}"><span>${department.icon}</span>${department.name}</button>
  `).join('');

  $('#categoryTiles').innerHTML = departments.filter((department) => department.name !== 'Offers').map((department) => `
    <button class="category-tile" type="button" data-tile-department="${department.name}">
      <span class="tile-icon">${department.icon}</span><b>${department.name}</b><span class="tile-arrow">→</span>
    </button>
  `).join('');

  $('#categoryFilter').innerHTML = ['All', ...categoryNames].map((category) => `
    <label class="check-row"><input type="checkbox" value="${category}" ${state.category === category ? 'checked' : ''} />${category}</label>
  `).join('');
  syncFilterControls();
}

function syncFilterControls() {
  $('#clearSearch').classList.toggle('visible', Boolean(state.search.trim()));
  $('#offersOnly').checked = state.offersOnly;
  $('#priceLimit').value = String(state.maxPrice);
  $('#priceLimitLabel').textContent = money(state.maxPrice);
  $('#sortSelect').value = state.sort;

  const categoryInputs = $('#categoryFilter').querySelectorAll('input');
  categoryInputs.forEach((input) => {
    const checked = state.category === 'All' ? input.value === 'All' : input.value === state.category;
    input.checked = checked;
  });
}

function getFilteredProducts() {
  const term = state.search.trim().toLocaleLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory = state.category === 'All' || product.category === state.category;
    const searchable = `${product.name} ${product.category} ${product.brand} ${product.description}`.toLocaleLowerCase();
    const matchesSearch = !term || searchable.includes(term);
    const matchesOffers = !state.offersOnly || product.deal;
    const matchesPrice = product.price <= state.maxPrice;
    const matchesFavorites = !state.favoritesOnly || state.favorites.includes(product.id);
    return matchesCategory && matchesSearch && matchesOffers && matchesPrice && matchesFavorites;
  });

  const sorters = {
    featured: (a, b) => Number(b.deal) - Number(a.deal) || b.rating - a.rating,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    name: (a, b) => a.name.localeCompare(b.name)
  };
  return filtered.sort(sorters[state.sort] || sorters.featured);
}

function renderProducts() {
  const filtered = getFilteredProducts();
  $('#resultsCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`;
  const activeFilter = $('#activeFilter');
  const filterLabel = state.favoritesOnly ? 'Your favorites' : state.offersOnly ? 'Offers' : state.category !== 'All' ? state.category : '';
  activeFilter.hidden = !filterLabel;
  activeFilter.textContent = filterLabel ? `${filterLabel} ×` : '';

  if (!filtered.length) {
    productsGrid.innerHTML = `<div class="no-results"><span>🔎</span><h3>No products found</h3><p>Try a different search or clear some filters.</p><button type="button" data-empty-reset>Clear filters</button></div>`;
    productsGrid.querySelector('[data-empty-reset]').addEventListener('click', resetFilters);
    return;
  }

  productsGrid.innerHTML = filtered.map((product) => `
    <article class="product-card">
      <div class="product-visual">
        ${product.deal ? '<span class="product-badge">OFFER</span>' : product.badge ? `<span class="product-badge neutral-badge">${product.badge}</span>` : ''}
        <button class="favorite-button ${state.favorites.includes(product.id) ? 'is-favorite' : ''}" type="button" data-favorite="${product.id}" aria-label="${state.favorites.includes(product.id) ? 'Remove from' : 'Add to'} favorites">${state.favorites.includes(product.id) ? '♥' : '♡'}</button>
        <img class="product-image" src="https://images.unsplash.com/${productPhotos[product.id]}?auto=format&fit=crop&w=720&q=82" alt="Photo of ${product.name}" loading="lazy" decoding="async" />
        <span class="product-emoji" aria-hidden="true" hidden>${product.emoji}</span>
      </div>
      <div class="product-body">
        <div class="product-meta"><span>${product.category}</span><span class="product-rating">★ ${product.rating.toFixed(1)}</span></div>
        <p class="product-brand">${product.brand}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer"><div class="price-stack"><strong>${money(product.price)}</strong>${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : ''}</div><button class="add-btn" type="button" data-add="${product.id}">Add <span>+</span></button></div>
      </div>
    </article>
  `).join('');

  productsGrid.querySelectorAll('.product-image').forEach((image) => image.addEventListener('error', () => {
    image.hidden = true;
    image.nextElementSibling.hidden = false;
  }, { once: true }));
  productsGrid.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => addToCart(Number(button.dataset.add))));
  productsGrid.querySelectorAll('[data-favorite]').forEach((button) => button.addEventListener('click', () => toggleFavorite(Number(button.dataset.favorite))));
}

function addToCart(id) {
  const line = state.cart.find((entry) => entry.id === id);
  if (line) line.quantity += 1;
  else state.cart.push({ id, quantity: 1 });
  saveStorage(STORAGE_KEYS.cart, state.cart);
  updateCartCount();
  showToast(`${products.find((product) => product.id === id).name} added to your basket`);
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id];
  saveStorage(STORAGE_KEYS.favorites, state.favorites);
  renderProducts();
  if (state.favoritesOnly && !state.favorites.includes(id)) renderProducts();
}

function updateCartCount() {
  cartCount.textContent = state.cart.reduce((total, item) => total + item.quantity, 0);
}

function cartSubtotal() {
  return state.cart.reduce((total, line) => {
    const product = products.find((item) => item.id === line.id);
    return product ? total + product.price * line.quantity : total;
  }, 0);
}

function closeModal() {
  $('#modalRoot').innerHTML = '';
  document.body.classList.remove('modal-open');
}

function openModal(title, content, wide = false) {
  $('#modalRoot').innerHTML = `
    <div class="modal-backdrop" data-close-modal>
      <section class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button class="modal-close" type="button" aria-label="Close dialog" data-close-modal>×</button>
        <h2 id="modalTitle">${title}</h2>${content}
      </section>
    </div>`;
  document.body.classList.add('modal-open');
  $('#modalRoot').querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', (event) => {
    if (event.target === element) closeModal();
  }));
  $('#modalRoot').querySelector('.modal-close').addEventListener('click', closeModal);
  $('#modalRoot').querySelector('input, button, select')?.focus();
}

function renderCart() {
  const lines = state.cart.map((line) => {
    const product = products.find((item) => item.id === line.id);
    if (!product) return '';
    return `<div class="cart-line"><span class="cart-product-icon">${product.emoji}</span><div class="cart-line-info"><b>${product.name}</b><small>${money(product.price)} each</small><div class="quantity-control"><button type="button" data-qty="${product.id}" data-delta="-1" aria-label="Decrease ${product.name} quantity">−</button><span>${line.quantity}</span><button type="button" data-qty="${product.id}" data-delta="1" aria-label="Increase ${product.name} quantity">+</button></div></div><strong>${money(product.price * line.quantity)}</strong><button class="remove-line" type="button" data-remove="${product.id}" aria-label="Remove ${product.name}">×</button></div>`;
  }).join('');
  const subtotal = cartSubtotal();
  const freeDeliveryReached = subtotal >= FREE_DELIVERY_THRESHOLD;
  const delivery = subtotal === 0 || freeDeliveryReached ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const deliveryMessage = freeDeliveryReached
    ? 'You’ve unlocked free delivery.'
    : subtotal > 0
      ? `Add ${money(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.`
      : `Free delivery on orders over ${money(FREE_DELIVERY_THRESHOLD)}.`;
  openModal('Your basket', `
    <div class="cart-modal-content">
      <div class="delivery-progress">
        <div class="delivery-progress-copy"><span>Shopping country: <b>${getCountry().name}</b></span><b>${deliveryMessage}</b></div>
        <div class="delivery-progress-track" role="progressbar" aria-label="Free delivery progress" aria-valuemin="0" aria-valuemax="${money(FREE_DELIVERY_THRESHOLD)}" aria-valuenow="${money(Math.min(subtotal, FREE_DELIVERY_THRESHOLD))}" aria-valuetext="${money(Math.min(subtotal, FREE_DELIVERY_THRESHOLD))} of ${money(FREE_DELIVERY_THRESHOLD)}"><span style="width: ${progress}%"></span></div>
      </div>
      ${lines || '<div class="cart-empty"><span>🛍️</span><b>Your basket is waiting</b><p>Add a few everyday favorites to get started.</p></div>'}
      <div class="cart-summary"><p><span>Subtotal</span><b>${money(subtotal)}</b></p><p><span>Delivery</span><b>${freeDeliveryReached ? 'FREE' : subtotal ? money(delivery) : money(0)}</b></p><p class="summary-total"><span>Total</span><b>${money(total)}</b></p></div>
      <button class="modal-primary" type="button" id="checkoutStart" ${subtotal ? '' : 'disabled'}>Checkout as guest <span>→</span></button>
      <small class="demo-note">No account needed. Delivery totals are illustrative; worldwide shipping, real orders, and payment are not connected.</small>
    </div>`, true);
  $('#modalRoot').querySelectorAll('[data-qty]').forEach((button) => button.addEventListener('click', () => changeQuantity(Number(button.dataset.qty), Number(button.dataset.delta))));
  $('#modalRoot').querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
    state.cart = state.cart.filter((line) => line.id !== Number(button.dataset.remove));
    saveStorage(STORAGE_KEYS.cart, state.cart);
    updateCartCount();
    renderCart();
  }));
  $('#checkoutStart').addEventListener('click', renderCheckout);
}

function changeQuantity(id, delta) {
  const line = state.cart.find((entry) => entry.id === id);
  if (!line) return;
  line.quantity += delta;
  if (line.quantity <= 0) state.cart = state.cart.filter((entry) => entry.id !== id);
  saveStorage(STORAGE_KEYS.cart, state.cart);
  updateCartCount();
  renderCart();
}

function renderCheckout() {
  const subtotal = cartSubtotal();
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;
  const deliverySlots = getDeliverySlots();
  const orderLines = state.cart.map((line) => {
    const product = products.find((item) => item.id === line.id);
    return product ? `<p><span>${product.name} × ${line.quantity}</span><b>${money(product.price * line.quantity)}</b></p>` : '';
  }).join('');
  openModal('Delivery details', `
    <form id="checkoutForm" class="checkout-form">
      <p class="modal-intro">Checking out as a guest — no account is required. This demo accepts a destination for preview only; worldwide delivery is not connected.</p>
      <label>Full name<input name="name" required autocomplete="name" placeholder="Your name" /></label>
      <label>Mobile number<input name="phone" required type="tel" minlength="7" maxlength="20" autocomplete="tel" placeholder="+971 5X XXX XXXX" /></label>
      <label>Destination country<select name="country" required>${countries.slice().sort((a, b) => a.name.localeCompare(b.name)).map((country) => `<option value="${country.code}"${country.code === state.countryCode ? ' selected' : ''}>${country.name}</option>`).join('')}</select></label>
      <label>Building, street and apartment<textarea name="address" required rows="2" placeholder="Enter your delivery address"></textarea></label>
      <label>Demo delivery time<select name="slot" required><option value="">Choose a time slot</option>${deliverySlots.map((slot) => `<option>${slot}</option>`).join('')}</select></label>
      <label>Payment method<select name="payment"><option>Cash on delivery (demo)</option><option>Card on delivery (demo)</option></select></label>
      <div class="checkout-review"><b>Order summary</b>${orderLines}<p><span>Subtotal</span><b>${money(subtotal)}</b></p><p><span>Delivery</span><b>${delivery ? money(delivery) : 'FREE'}</b></p><p class="checkout-total"><span>Order total</span><b>${money(total)}</b></p></div>
      <button class="modal-primary" type="submit">Place demo order <span>→</span></button>
      <small class="demo-note">Demo only — no payment will be taken and no real order is sent.</small>
    </form>`, true);
  $('#checkoutForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const formData = new FormData(event.currentTarget);
    const orderNumber = `GS-${Math.floor(100000 + Math.random() * 900000)}`;
    const countryCode = formData.get('country');
    const country = getCountry(countryCode);
    const slot = formData.get('slot');
    state.cart = [];
    state.countryCode = countryCode;
    saveStorage(STORAGE_KEYS.cart, state.cart);
    saveStorage(STORAGE_KEYS.country, state.countryCode);
    $('#selectedLocation').textContent = country.name;
    renderCurrencyNotice();
    updateCartCount();
    openModal('Order received!', `<div class="success-state"><span>✓</span><p>Your demo order <b>${orderNumber}</b> is recorded for <b>${country.name}</b>.</p><p class="order-confirmation-detail">Chosen demo time: ${slot}<br />Order total: ${money(total)}</p><small class="demo-note">This is a local preview only. No order was sent and worldwide delivery is not available.</small><button class="modal-primary" type="button" data-finish>Continue shopping</button></div>`);
    $('#modalRoot').querySelector('[data-finish]').addEventListener('click', closeModal);
  });
}

function renderAccount() {
  openModal('Welcome to GLOBAL SUPERMARKET', `
    <div class="account-panel"><p class="modal-intro">An account is optional. You can browse, shop, and check out as a guest. Sign-in here is a preview and needs a connected authentication service.</p><form id="accountForm"><label>Email address<input type="email" placeholder="you@example.com" required autocomplete="email" /></label><button class="modal-primary" type="submit">Continue with email <span>→</span></button></form><button class="guest-button" type="button" data-guest>Continue as guest</button><div class="account-benefits"><b>With an account, you could</b><span>♡ Save products for later</span><span>▤ Keep track of your orders</span><span>⌖ Manage delivery addresses</span></div></div>`);
  $('#accountForm').addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Account sign-in needs a connected authentication service.');
  });
  $('#modalRoot').querySelector('[data-guest]').addEventListener('click', closeModal);
}

function renderLocation() {
  openModal('Choose your country', `
    <div class="country-picker">
      <p class="modal-intro">Search by country to see prices in its currency. Exchange rates are indicative; worldwide delivery is not available in this demo.</p>
      <label class="country-search-label" for="countrySearch">Country or currency</label>
      <input id="countrySearch" class="country-search" type="search" placeholder="Search countries or currency codes" autocomplete="off" />
      <div id="countryResults" class="country-results" role="list"></div>
    </div>`, true);
  renderCountryOptions();
  $('#countrySearch').addEventListener('input', (event) => renderCountryOptions(event.target.value));
}

function renderInfo(title, text, details = []) {
  openModal(title, `<div class="info-modal"><p>${text}</p>${details.map((detail) => `<div class="info-row"><b>${detail[0]}</b><span>${detail[1]}</span></div>`).join('')}<button class="modal-primary" type="button" data-info-close>Got it</button></div>`);
  $('#modalRoot').querySelector('[data-info-close]').addEventListener('click', closeModal);
}

function setCategory(category) {
  state.category = categoryNames.includes(category) ? category : 'All';
  state.favoritesOnly = false;
  state.offersOnly = false;
  $('#catalogueTitle').textContent = state.category === 'All' ? 'Popular right now' : state.category;
  syncFilterControls();
  renderProducts();
  $('#catalogue').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetFilters() {
  state.category = 'All';
  state.search = '';
  state.offersOnly = false;
  state.favoritesOnly = false;
  state.maxPrice = 100;
  state.sort = 'featured';
  $('#searchInput').value = '';
  $('#catalogueTitle').textContent = 'Popular right now';
  syncFilterControls();
  renderDepartments();
  renderProducts();
}

function showFavorites() {
  state.favoritesOnly = true;
  state.category = 'All';
  state.offersOnly = false;
  $('#catalogueTitle').textContent = 'Your favorites';
  syncFilterControls();
  $('#catalogue').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderProducts();
}

function showDeals() {
  state.favoritesOnly = false;
  state.category = 'All';
  state.offersOnly = true;
  $('#catalogueTitle').textContent = "Today's offers";
  syncFilterControls();
  $('#catalogue').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderProducts();
}

function bindEvents() {
  $('#searchInput').addEventListener('input', (event) => {
    state.search = event.target.value;
    $('#clearSearch').classList.toggle('visible', Boolean(state.search));
    renderProducts();
  });
  $('#clearSearch').addEventListener('click', () => {
    $('#searchInput').value = '';
    state.search = '';
    $('#clearSearch').classList.remove('visible');
    renderProducts();
    $('#searchInput').focus();
  });
  $('#sortSelect').addEventListener('change', (event) => { state.sort = event.target.value; renderProducts(); });
  $('#offersOnly').addEventListener('change', (event) => { state.offersOnly = event.target.checked; state.favoritesOnly = false; renderProducts(); });
  $('#priceLimit').addEventListener('input', (event) => {
    state.maxPrice = Number(event.target.value);
    $('#priceLimitLabel').textContent = money(state.maxPrice);
    renderProducts();
  });
  $('#categoryFilter').addEventListener('change', (event) => {
    if (event.target.matches('input')) {
      const value = event.target.value;
      const allInputs = $('#categoryFilter').querySelectorAll('input');
      if (value === 'All') {
        state.category = 'All';
        allInputs.forEach((input) => { input.checked = input.value === 'All'; });
      } else {
        state.category = event.target.checked ? value : 'All';
        allInputs.forEach((input) => {
          if (input.value === 'All') input.checked = false;
          else input.checked = input.value === state.category;
        });
        if (!event.target.checked) {
          state.category = 'All';
          $('#categoryFilter').querySelector('input[value="All"]').checked = true;
        }
      }
      state.favoritesOnly = false;
      state.offersOnly = false;
      $('#catalogueTitle').textContent = state.category === 'All' ? 'Popular right now' : state.category;
      renderProducts();
    }
  });
  $('#clearFilters').addEventListener('click', resetFilters);
  $('#resetCatalogue').addEventListener('click', resetFilters);
  $('#activeFilter').addEventListener('click', () => {
    if (state.favoritesOnly) state.favoritesOnly = false;
    else if (state.offersOnly) { state.offersOnly = false; }
    else state.category = 'All';
    $('#catalogueTitle').textContent = 'Popular right now';
    syncFilterControls();
    renderProducts();
  });
  $('#departmentNav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-department]');
    if (!button) return;
    const department = departments.find((item) => item.name === button.dataset.department);
    if (department?.name === 'Offers') showDeals();
    else if (department?.categories.length) setCategory(department.categories[0]);
  });
  $('#categoryTiles').addEventListener('click', (event) => {
    const button = event.target.closest('[data-tile-department]');
    if (!button) return;
    const department = departments.find((item) => item.name === button.dataset.tileDepartment);
    if (department?.categories.length) setCategory(department.categories[0]);
  });
  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'location') renderLocation();
    else if (action === 'cart') renderCart();
    else if (action === 'account') renderAccount();
    else if (action === 'favorites') showFavorites();
    else if (action === 'deals') showDeals();
    else if (action === 'all-departments') {
      document.querySelector('.category-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }     else if (action === 'delivery-info') renderInfo('Delivery information', 'Choose any country to preview prices in its local currency. Global shipping, live inventory, and real delivery charges are not connected in this demo.', [['Currency conversion', 'Indicative daily exchange rates; some currencies may not be available'], ['Delivery fee', `${money(DELIVERY_FEE)} in this preview; waived on baskets of ${money(FREE_DELIVERY_THRESHOLD)} or more`], ['Delivery slots', 'Illustrative demo times only']]);
    else if (action === 'pickup') renderInfo('Click & collect', 'Choose your shopping online and collect it from a convenient store. Store selection and collection availability need a connected store service.', [['Store availability', 'Not connected in this demo'], ['Collection time', 'Shown after choosing a store']]);
    else if (action === 'help') renderInfo('How can we help?', 'This preview includes the main shopping experience. Live order support requires a connected support team.', [['Orders', 'Place a demo order from your basket'], ['Products', 'Search or browse the departments'], ['Delivery', 'Choose an area and time at checkout']]);
    else if (action === 'contact') renderInfo('Contact GLOBAL SUPERMARKET', 'This demo has no live customer-service channel. Add your preferred support email or phone when connecting a real service.');
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
}

const welcomeScreen = $('#welcomeScreen');
const enterStore = $('#enterStore');

if (enterStore) {
  enterStore.addEventListener('click', () => {
    document.body.classList.remove('welcome-mode');
    document.body.classList.add('store-mode');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
  });
}

renderDepartments();
bindEvents();
$('#selectedLocation').textContent = getCountry().name;
renderCurrencyNotice();
updateCartCount();
renderProducts();
loadExchangeRates();
