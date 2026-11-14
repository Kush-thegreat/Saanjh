'use strict';

const PRODUCTS = Object.freeze([
  { id: 'sunset-crush', name: 'Sunset Crush', notes: 'A golden jar candle with a blush of pink hearts.', category: 'jars', price: 150, image: 'sunset-crush.png', unit: '1 candle', tag: 'READY TO GLOW' },
  { id: 'cupids-bubblegum', name: "Cupid's bubblegum", notes: 'Pink and green, with a little love at the centre.', category: 'jars', price: 120, image: 'cupids-bubblegum.png', unit: '1 candle', tag: '' },
  { id: 'lavender-love-letter', name: 'Lavender Love Letter', notes: 'A lavender-coloured candle, finished with a golden heart.', category: 'jars', price: 125, image: 'lavender-love-letter.png', unit: '1 candle', tag: '' },
  { id: 'bubble-boba', name: 'Bubble boba', notes: 'A playful pair in green and golden yellow.', category: 'sculptural', price: 80, image: 'bubble-boba.png', unit: 'Set of 2', tag: 'A LITTLE DUO' },
  { id: 'sundae', name: 'Chocolate Sundae', scented: true, notes: 'Scented dessert candles. Both Chocolate Sundae and Mango Sunshine Sundae are scented.', category: 'dessert', price: 199, image: 'chocolate-sundae.png', unit: '1 candle', tag: 'SCENTED · 2 FLAVORS', variants: [
    { id: 'chocolate', short: 'Chocolate', name: 'Chocolate Sundae', image: 'chocolate-sundae.png' },
    { id: 'mango', short: 'Mango', name: 'Mango Sunshine Sundae', image: 'mango-sundae.png' }
  ] }
]);
const WHATSAPP_NUMBER = '918792517450';
const STORAGE_KEY = 'sanjh-cart-v2';
const currency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const findProduct = id => PRODUCTS.find(product => product.id === id);

const variantFor = (product, variant) => product.variants?.find(option => option.id === variant);
const itemKey = item => item.id + (item.variant ? ':' + item.variant : '');
const itemName = item => variantFor(findProduct(item.id), item.variant)?.name || findProduct(item.id).name;
const itemImage = item => variantFor(findProduct(item.id), item.variant)?.image || findProduct(item.id).image;

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    const normalized = new Map();
    stored.forEach(item => {
      if (!item || !Number.isInteger(item.quantity) || item.quantity < 1) return;
      const product = findProduct(item.id);
      if (!product || (product.variants ? !variantFor(product, item.variant) : item.variant != null)) return;
      const key = itemKey(item);
      const previous = normalized.get(key);
      normalized.set(key, { id: item.id, ...(item.variant ? { variant: item.variant } : {}), quantity: Math.min(99, (previous?.quantity || 0) + item.quantity) });
    });
    return Array.from(normalized.values());
  } catch { return []; }
}

let cart = readCart();
let toastTimer;
const dialog = document.querySelector('#cart-dialog');
const note = document.querySelector('#order-note');
const isCheckout = document.body?.dataset.page === 'checkout';
const NOTE_KEY = 'sanjh-order-note';
try { note.value = sessionStorage.getItem(NOTE_KEY) || ''; } catch { /* Notes remain usable without storage. */ }

function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function renderProducts(filter = 'all') {
  const products = PRODUCTS.filter(product => filter === 'all' || product.category === filter);
  document.querySelector('#product-count').textContent = `${products.length} ${products.length === 1 ? 'candle design' : 'candle designs'}`;
  document.querySelector('#product-grid').innerHTML = products.map(product => `
    <article class="product-card" data-product="${product.id}">
      <div class="product-picture"><a class="product-photo-button" href="${product.id}.html" aria-label="View ${product.name}"><img src="assets/${product.image}" alt="${product.name}${product.id === 'bubble-boba' ? ', set of two candles' : ' candle'}" loading="lazy" width="600" height="750"></a>${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}</div>
      <div class="product-meta"><h3><a href="${product.id}.html">${product.name}</a></h3><span class="price">${currency(product.price)}</span></div>
      <p class="scent-notes">${product.notes}</p>
      <div class="product-bottom"><span class="product-unit">${product.unit}${product.scented ? '<span class="unit-scented">Scented</span>' : ''}</span><a class="add-button" href="${product.id}.html">${product.variants ? 'Choose flavor' : 'View candle'} <span aria-hidden="true">↗</span></a></div>
    </article>`).join('');
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.product-card').forEach((card, index) => {
      card.animate?.([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 480, delay: index * 55, easing: 'ease-out', fill: 'backwards' });
    });
  }
}

function addToCart(id, variant, quantity = 1) {
  const product = findProduct(id);
  if (!product || (product.variants ? !variantFor(product, variant) : variant != null)) return;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return false;
  const entry = { id, ...(variant ? { variant } : {}), quantity };
  const item = cart.find(existing => itemKey(existing) === itemKey(entry));
  if ((item?.quantity || 0) + quantity > 99) { notify('You can add up to 99 of each candle or flavor.'); return false; }
  if (item) item.quantity += quantity;
  else cart.push(entry);
  saveCart();
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    document.querySelector('#open-cart')?.animate?.([{ transform: 'translateY(0)' }, { transform: 'translateY(-5px)', offset: .4 }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
    document.querySelector('#cart-count')?.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.22)', offset: .4 }, { transform: 'scale(1)' }], { duration: 420 });
  }
  notify(`${quantity > 1 ? quantity + ' × ' : ''}${itemName(entry)} added to your bag`);
  return true;
}

function buildOrderMessage() {
  if (!cart.length) return '';
  const lines = cart.map(item => {
    const product = findProduct(item.id);
    return `• ${itemName(item)} (${product.unit}) × ${item.quantity} — ${currency(product.price * item.quantity)}`;
  });
  const total = cart.reduce((sum, item) => sum + findProduct(item.id).price * item.quantity, 0);
  const message = ["Hi! I'd like to enquire about ordering these candles:", '', ...lines, '', `Product subtotal: ${currency(total)}`, 'Please confirm product availability, delivery charges, and payment details.'];
  if (note.value.trim()) message.push('', `Note: ${note.value.trim()}`);
  message.push('', 'Sent from the Saanjh: एक लौ.');
  return message.join('\n');
}

function buildOrderUrl() {
  const message = buildOrderMessage();
  return `https://wa.me/${WHATSAPP_NUMBER}${message ? '?text=' + encodeURIComponent(message) : ''}`;
}

function updateOrderLink() {
  const url = buildOrderUrl();
  ['#whatsapp-order', '#hero-order', '#quick-order'].forEach(selector => {
    const link = document.querySelector(selector);
    if (link) link.href = url;
  });
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + findProduct(item.id).price * item.quantity, 0);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#drawer-count').textContent = count ? `(${count})` : '';
  document.querySelector('#open-cart')?.setAttribute('aria-label', `Open shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  document.querySelector('#cart-summary').hidden = cart.length === 0;
  document.querySelector('#cart-total').textContent = currency(total);
  document.querySelector('#cart-items').innerHTML = cart.length ? cart.map(item => {
    const product = findProduct(item.id);
    return `<article class="cart-item"><img src="assets/${itemImage(item)}" alt="${itemName(item)}"><div class="cart-item-detail"><h3>${itemName(item)}</h3><p>${product.unit}${product.scented ? ' · Scented' : ''} · ${currency(product.price)} each</p><div class="item-controls"><div class="quantity"><button data-quantity="${itemKey(item)}" data-delta="-1" aria-label="Decrease ${itemName(item)} quantity">−</button><span aria-label="Quantity ${item.quantity}">${item.quantity}</span><button data-quantity="${itemKey(item)}" data-delta="1" aria-label="Increase ${itemName(item)} quantity" ${item.quantity >= 99 ? 'disabled' : ''}>+</button></div><button class="remove-item" data-remove="${itemKey(item)}" aria-label="Remove ${itemName(item)}">Remove</button><span class="item-price">${currency(product.price * item.quantity)}</span></div></div></article>`;
  }).join('') : `<div class="empty-cart"><span aria-hidden="true">✳</span><h3>A little room for warmth.</h3><p>Your bag is empty. Find a candle that feels like you.</p>${isCheckout ? '<a class="button dark" href="collection.html">Explore the collection <span aria-hidden="true">↗</span></a>' : '<button class="button dark" id="continue-shopping">Explore the collection <span aria-hidden="true">↗</span></button>'}</div>`;
  const preview = document.querySelector('#order-preview');
  if (preview) preview.textContent = buildOrderMessage();
  updateOrderLink();
}

function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* Shopping continues when browser storage is unavailable. */ }
  renderCart();
}

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(filter => {
    const active = button === filter;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  renderProducts(button.dataset.filter);
}));

document.querySelector('#open-cart')?.addEventListener('click', () => dialog.showModal());
document.querySelector('#close-cart')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
document.querySelector('#cart-items').addEventListener('click', event => {
  if (event.target.closest('#continue-shopping')) {
    if (!document.querySelector('#product-grid')) { window.location.href = 'collection.html'; return; }
    dialog.close(); document.querySelector('#collection').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); return; }
  const quantityButton = event.target.closest('[data-quantity]');
  const removeButton = event.target.closest('[data-remove]');
  if (!quantityButton && !removeButton) return;
  const id = quantityButton ? quantityButton.dataset.quantity : removeButton.dataset.remove;
  const item = cart.find(entry => itemKey(entry) === id);
  if (!item) return;
  const label = quantityButton ? quantityButton.getAttribute('aria-label') : '';
  if (removeButton) cart = cart.filter(entry => itemKey(entry) !== id);
  else {
    item.quantity = Math.min(99, item.quantity + Number(quantityButton.dataset.delta));
    if (item.quantity <= 0) cart = cart.filter(entry => itemKey(entry) !== id);
  }
  saveCart();
  // Restore keyboard focus after rebuilding the quantity controls.
  const nextFocus = label && Array.from(document.querySelectorAll('[data-quantity]')).find(button => button.getAttribute('aria-label') === label && !button.disabled);
  (nextFocus || document.querySelector(isCheckout ? '#cart-title' : '#close-cart'))?.focus();
});
note.addEventListener('input', () => {
  try { sessionStorage.setItem(NOTE_KEY, note.value); } catch { /* Keep the current note in memory. */ }
  updateOrderLink();
  const preview = document.querySelector('#order-preview');
  if (preview) preview.textContent = buildOrderMessage();
});
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) { cart = readCart(); renderCart(); } });
document.querySelector('#year').textContent = new Date().getFullYear();
if (document.querySelector('#product-grid')) renderProducts();
renderCart();
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    cart = readCart();
    try { note.value = sessionStorage.getItem(NOTE_KEY) || ''; } catch { /* Keep the current note. */ }
    renderCart();
  }
});


// A disclosure menu keeps mobile navigation in the normal keyboard/tab order.
const mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
const mobileMenuPanel = document.querySelector('#mobile-nav-panel');
function closeMobileMenu(restoreFocus = false) {
  if (!mobileMenuToggle || !mobileMenuPanel) return;
  mobileMenuPanel.hidden = true;
  mobileMenuToggle.setAttribute('aria-expanded', 'false');
  mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
  if (restoreFocus) mobileMenuToggle.focus();
}
mobileMenuToggle?.addEventListener('click', () => {
  const opening = mobileMenuPanel.hidden;
  mobileMenuPanel.hidden = !opening;
  mobileMenuToggle.setAttribute('aria-expanded', String(opening));
  mobileMenuToggle.setAttribute('aria-label', opening ? 'Close navigation menu' : 'Open navigation menu');
});
mobileMenuPanel?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMobileMenu();
});
document.addEventListener?.('keydown', event => {
  if (event.key === 'Escape' && mobileMenuPanel && !mobileMenuPanel.hidden) closeMobileMenu(true);
});
document.addEventListener?.('pointerdown', event => {
  if (mobileMenuPanel && !mobileMenuPanel.hidden && !mobileMenuPanel.contains(event.target) && !mobileMenuToggle.contains(event.target)) closeMobileMenu();
});
window.matchMedia?.('(min-width: 651px)').addEventListener('change', event => {
  if (event.matches) closeMobileMenu();
});
window.addEventListener('pageshow', () => closeMobileMenu());

// Reveal each section once; content stays visible without animation support.
if (window.IntersectionObserver && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate?.([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.65,.3,1)' });
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll('.hero-copy, .hero-visual, .section-heading, .collection-invitation, .ritual-art, .ritual-copy, .steps article, .closing, .catalog-intro, .catalog-help, .detail-gallery, .detail-content, .checkout-intro').forEach(element => revealObserver.observe(element));
}
