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

const STORAGE_KEYS = { cart: 'global-supermarket-cart', favorites: 'global-supermarket-favorites', location: 'global-supermarket-location' };
const state = {
  category: 'All',
  search: '',
  offersOnly: false,
  favoritesOnly: false,
  maxPrice: 100,
  sort: 'featured',
  cart: readStorage(STORAGE_KEYS.cart, []),
  favorites: readStorage(STORAGE_KEYS.favorites, []),
  location: readStorage(STORAGE_KEYS.location, 'Dubai')
};

const $ = (selector) => document.querySelector(selector);
const productsGrid = $('#productsGrid');
const cartCount = $('#headerCartCount');
const categoryNames = [...new Set(products.map((product) => product.category))];
const currency = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' });

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(`Unable to read saved shop data (${key}).`, error);
    return fallback;
  }
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
  return currency.format(value);
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
        <span class="product-emoji" aria-hidden="true">${product.emoji}</span>
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
  const delivery = subtotal === 0 || subtotal >= 100 ? 0 : 10;
  const total = subtotal + delivery;
  openModal('Your basket', `
    <div class="cart-modal-content">
      ${lines || '<div class="cart-empty"><span>🛍️</span><b>Your basket is waiting</b><p>Add a few everyday favorites to get started.</p></div>'}
      <div class="cart-summary"><p><span>Subtotal</span><b>${money(subtotal)}</b></p><p><span>Delivery</span><b>${subtotal >= 100 ? 'FREE' : subtotal ? money(delivery) : money(0)}</b></p><p class="summary-total"><span>Total</span><b>${money(total)}</b></p><small>${subtotal > 0 && subtotal < 100 ? `Add ${money(100 - subtotal)} more for free delivery.` : 'Free delivery on orders over AED 100.'}</small></div>
      <button class="modal-primary" type="button" id="checkoutStart" ${subtotal ? '' : 'disabled'}>Continue to checkout <span>→</span></button>
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
  const total = cartSubtotal() + (cartSubtotal() >= 100 ? 0 : 10);
  openModal('Delivery details', `
    <form id="checkoutForm" class="checkout-form">
      <p class="modal-intro">Choose where and when your order should arrive. This demo does not collect payment.</p>
      <label>Full name<input name="name" required autocomplete="name" placeholder="Your name" /></label>
      <label>Mobile number<input name="phone" required type="tel" minlength="7" maxlength="20" autocomplete="tel" placeholder="+971 5X XXX XXXX" /></label>
      <label>Delivery area<select name="area" required><option value="${state.location}">${state.location}</option><option>Abu Dhabi</option><option>Sharjah</option><option>Ajman</option><option>Al Ain</option><option>Ras Al Khaimah</option><option>Fujairah</option></select></label>
      <label>Building, street and apartment<textarea name="address" required rows="2" placeholder="Enter your delivery address"></textarea></label>
      <label>Delivery time<select name="slot" required><option value="">Choose a time slot</option><option>Today, 6 pm – 9 pm</option><option>Tomorrow, 9 am – 12 pm</option><option>Tomorrow, 12 pm – 3 pm</option><option>Tomorrow, 6 pm – 9 pm</option></select></label>
      <label>Payment method<select name="payment"><option>Cash on delivery (demo)</option><option>Card on delivery (demo)</option></select></label>
      <div class="checkout-total"><span>Order total</span><b>${money(total)}</b></div>
      <button class="modal-primary" type="submit">Place demo order <span>→</span></button>
      <small class="demo-note">Demo only — no payment will be taken and no real order is sent.</small>
    </form>`, true);
  $('#checkoutForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const orderNumber = `GS-${Math.floor(100000 + Math.random() * 900000)}`;
    state.cart = [];
    saveStorage(STORAGE_KEYS.cart, state.cart);
    updateCartCount();
    openModal('Order received!', `<div class="success-state"><span>✓</span><p>Thanks for trying GLOBAL SUPERMARKET. Your demo order <b>${orderNumber}</b> is confirmed locally.</p><button class="modal-primary" type="button" data-finish>Continue shopping</button></div>`);
    $('#modalRoot').querySelector('[data-finish]').addEventListener('click', closeModal);
  });
}

function renderAccount() {
  openModal('Welcome to GLOBAL SUPERMARKET', `
    <div class="account-panel"><p class="modal-intro">Sign-in is a UI preview in this demo. Account registration and authentication need a secure server.</p><form id="accountForm"><label>Email address<input type="email" placeholder="you@example.com" required autocomplete="email" /></label><button class="modal-primary" type="submit">Continue with email <span>→</span></button></form><div class="account-benefits"><b>Your account, your way</b><span>♡ Save products for later</span><span>▤ Keep track of your orders</span><span>⌖ Manage delivery addresses</span></div></div>`);
  $('#accountForm').addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Account sign-in needs a connected authentication service.');
  });
}

function renderLocation() {
  openModal('Choose your delivery area', `<p class="modal-intro">We’ll tailor your shopping experience to your location.</p><div class="location-options">${['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah', 'Fujairah'].map((city) => `<button type="button" class="${city === state.location ? 'selected' : ''}" data-city="${city}"><span>⌖</span>${city}<span>${city === state.location ? '✓' : '→'}</span></button>`).join('')}</div>`);
  $('#modalRoot').querySelectorAll('[data-city]').forEach((button) => button.addEventListener('click', () => {
    state.location = button.dataset.city;
    $('#selectedLocation').textContent = state.location;
    saveStorage(STORAGE_KEYS.location, state.location);
    closeModal();
    showToast(`Delivery area set to ${state.location}`);
  }));
}

function renderInfo(title, text, details = []) {
  openModal(title, `<div class="info-modal"><p>${text}</p>${details.map((detail) => `<div class="info-row"><b>${detail[0]}</b><span>${detail[1]}</span></div>`).join('')}<button class="modal-primary" type="button" data-info-close>Got it</button></div>`);
  $('#modalRoot').querySelector('[data-info-close]').addEventListener('click', closeModal);
}

function setCategory(category) {
  state.category = categoryNames.includes(category) ? category : 'All';
  state.favoritesOnly = false;
  $('#catalogueTitle').textContent = state.category === 'All' ? 'Popular right now' : state.category;
  $('#categoryFilter').querySelectorAll('input').forEach((input) => { input.checked = input.value === state.category; });
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
  $('#offersOnly').checked = false;
  $('#priceLimit').value = '100';
  $('#priceLimitLabel').textContent = 'AED 100';
  $('#sortSelect').value = 'featured';
  $('#catalogueTitle').textContent = 'Popular right now';
  renderDepartments();
  renderProducts();
}

function showFavorites() {
  state.favoritesOnly = true;
  state.category = 'All';
  state.offersOnly = false;
  $('#catalogueTitle').textContent = 'Your favorites';
  $('#catalogue').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderProducts();
}

function showDeals() {
  state.favoritesOnly = false;
  state.category = 'All';
  state.offersOnly = true;
  $('#offersOnly').checked = true;
  $('#catalogueTitle').textContent = "Today's offers";
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
    $('#priceLimitLabel').textContent = `AED ${state.maxPrice}`;
    renderProducts();
  });
  $('#categoryFilter').addEventListener('change', (event) => {
    if (event.target.matches('input')) {
      state.category = event.target.checked ? event.target.value : 'All';
      state.favoritesOnly = false;
      $('#catalogueTitle').textContent = state.category === 'All' ? 'Popular right now' : state.category;
      renderProducts();
    }
  });
  $('#clearFilters').addEventListener('click', resetFilters);
  $('#resetCatalogue').addEventListener('click', resetFilters);
  $('#activeFilter').addEventListener('click', () => {
    if (state.favoritesOnly) state.favoritesOnly = false;
    else if (state.offersOnly) { state.offersOnly = false; $('#offersOnly').checked = false; }
    else state.category = 'All';
    $('#catalogueTitle').textContent = 'Popular right now';
    $('#categoryFilter').querySelectorAll('input').forEach((input) => { input.checked = input.value === 'All'; });
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
    } else if (action === 'delivery-info') renderInfo('Delivery information', 'Choose a delivery area to see available service options. Delivery charges in this demo are AED 10, waived on baskets of AED 100 or more.', [['Coverage', 'Selected UAE cities (illustrative)'], ['Delivery slots', 'Choose a preferred slot at demo checkout'], ['Order tracking', 'Requires a connected order service']]);
    else if (action === 'pickup') renderInfo('Click & collect', 'Choose your shopping online and collect it from a convenient store. Store selection and collection availability need a connected store service.', [['Store availability', 'Not connected in this demo'], ['Collection time', 'Shown after choosing a store']]);
    else if (action === 'help') renderInfo('How can we help?', 'This preview includes the main shopping experience. Live order support requires a connected support team.', [['Orders', 'Place a demo order from your basket'], ['Products', 'Search or browse the departments'], ['Delivery', 'Choose an area and time at checkout']]);
    else if (action === 'contact') renderInfo('Contact GLOBAL SUPERMARKET', 'This demo has no live customer-service channel. Add your preferred support email or phone when connecting a real service.');
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
}

renderDepartments();
bindEvents();
$('#selectedLocation').textContent = state.location;
updateCartCount();
renderProducts();
