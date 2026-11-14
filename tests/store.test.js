const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function storefront(stored = null, storageUnavailable = false, checkout = false, savedNote = '') {
  const elements = new Map();
  const storage = new Map(stored === null ? [] : [['sanjh-cart-v2', stored]]);
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      value: '', hidden: false, textContent: '', innerHTML: '', href: '', handlers: {}, attributes: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, fn) { this.handlers[name] = fn; },
      setAttribute(name, value) { this.attributes[name] = value; },
      focus() {}, showModal() { this.open = true; }, close() { this.open = false; }
    });
    return elements.get(selector);
  }
  const context = vm.createContext({
    document: {
      body: { dataset: { page: checkout ? 'checkout' : 'home' } },
      querySelector: selector => checkout && ['#product-grid', '#product-count', '#cart-dialog', '#open-cart', '#close-cart', '#hero-order', '#quick-order'].includes(selector) ? null : element(selector),
      querySelectorAll: () => []
    },
    sessionStorage: { getItem: () => savedNote, setItem(key, value) { savedNote = value; } },
    localStorage: {
      getItem(key) { if (storageUnavailable) throw Error('Unavailable'); return storage.get(key) || null; },
      setItem(key, value) { if (storageUnavailable) throw Error('Unavailable'); storage.set(key, value); }
    },
    window: { addEventListener() {} }, Intl, Map, setTimeout: () => 1, clearTimeout() {}
  });
  vm.runInContext(source, context);
  return {
    context, element, storage,
    evaluate: code => vm.runInContext(code, context),
    add(id, variant) { vm.runInContext(`addToCart(${JSON.stringify(id)}, ${JSON.stringify(variant) || 'undefined'})`, context); },
    quantity(id, delta) {
      const button = { dataset: { quantity: id, delta: String(delta) }, getAttribute: () => 'quantity button' };
      element('#cart-items').handlers.click({ target: { closest: selector => selector === '[data-quantity]' ? button : null } });
    },
    remove(id) { element('#cart-items').handlers.click({ target: { closest: selector => selector === '[data-remove]' ? { dataset: { remove: id } } : null } }); },
    message() { return new URL(element('#whatsapp-order').href).searchParams.get('text'); }
  };
}

test('the catalog has the approved five products, prices, photos, and pair unit', () => {
  const shop = storefront();
  assert.equal(shop.evaluate('PRODUCTS.length'), 5);
  assert.equal(shop.evaluate('PRODUCTS.map(p=>p.price).join(",")'), '150,140,125,80,199');
  assert.equal(shop.evaluate('findProduct("bubble-boba").unit'), 'Set of 2');
  assert.equal(shop.evaluate('findProduct("sundae").image'), 'chocolate-sundae.png');
  for (const file of shop.evaluate('PRODUCTS.flatMap(p=>p.variants?p.variants.map(v=>v.image):[p.image])')) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', file)));
  }
});
test('empty cart hides checkout summary and links remain a general chat', () => {
  const shop = storefront();
  assert.equal(shop.element('#cart-summary').hidden, true);
  assert.equal(shop.element('#hero-order').href, 'https://wa.me/918792517450');
});

test('free delivery applies only above 499 and updates after cart changes', () => {
  const shop = storefront();
  shop.evaluate("cart = [{id:'sundae',variant:'chocolate',quantity:1},{id:'sunset-crush',quantity:2}]; renderCart()");
  assert.equal(shop.element('#cart-total').textContent, '₹499');
  assert.doesNotMatch(shop.message(), /Delivery: Free/);
  shop.add('cupids-bubblegum');
  assert.match(shop.message(), /Delivery: Free/);
  assert.match(shop.element('#delivery-status').textContent, /qualifies/);
  shop.remove('cupids-bubblegum');
  assert.doesNotMatch(shop.message(), /Delivery: Free/);
  assert.doesNotMatch(shop.element('#delivery-status').textContent, /qualifies/);
});
test('adding all five products calculates the real prices', () => {
  const shop = storefront();
  ['sunset-crush','cupids-bubblegum','lavender-love-letter','bubble-boba'].forEach(id=>shop.add(id));
  shop.add('sundae','chocolate');
  assert.equal(shop.element('#cart-total').textContent, '₹694');
  assert.equal(shop.element('#cart-count').textContent, 5);
  assert.match(shop.message(), /Bubble boba \(Set of 2\) × 1 — ₹80/);
  assert.doesNotMatch(shop.message(), /180 g|sample storefront/);
});
test('sundae flavors remain separate, merge by flavor, and use the right photos', () => {
  const shop = storefront();
  shop.add('sundae','chocolate');shop.add('sundae','mango');shop.add('sundae','mango');
  assert.equal(shop.evaluate('cart.length'), 2);
  assert.equal(shop.element('#cart-total').textContent, '₹597');
  assert.match(shop.message(), /Chocolate Sundae \(1 candle\) × 1 — ₹199/);
  assert.match(shop.message(), /Mango Sunshine Sundae \(1 candle\) × 2 — ₹398/);
  assert.match(shop.element('#cart-items').innerHTML, /mango-sundae.png/);
  shop.quantity('sundae:mango',-1);
  shop.remove('sundae:chocolate');
  assert.equal(shop.element('#cart-total').textContent, '₹199');
  assert.doesNotMatch(shop.message(), /Chocolate Sundae/);
});
test('checkout preserves both variants and optional notes after reload', () => {
  const shop = storefront();shop.add('sundae','mango');shop.add('sunset-crush');
  const checkout = storefront(shop.storage.get('sanjh-cart-v2'),false,true,'Gift for A & B 🎁');
  assert.equal(checkout.element('#cart-total').textContent,'₹349');
  assert.match(checkout.message(),/Mango Sunshine Sundae/);
  assert.match(checkout.message(),/Gift for A & B 🎁/);
  assert.equal(checkout.element('#order-preview').textContent, checkout.evaluate('buildOrderMessage()'));
  const url = new URL(checkout.element('#whatsapp-order').href);
  assert.equal(url.pathname,'/918792517450');
});
test('storage rejects unknown products and invalid flavors, caps duplicates, and recalculates prices', () => {
  const shop = storefront('[{"id":"sundae","variant":"mango","quantity":90,"price":1},{"id":"sundae","variant":"mango","quantity":90},{"id":"sundae","variant":"fake","quantity":1},{"id":"sunset-crush","quantity":-1},{"id":"amber-hour","quantity":1}]');
  assert.equal(shop.element('#cart-count').textContent,99);
  assert.equal(shop.element('#cart-total').textContent,'₹19,701');
  shop.add('sundae','mango');shop.add('sundae','invalid');shop.add('sundae');
  assert.equal(shop.element('#cart-count').textContent,99);
  assert.equal(storefront('{bad').element('#cart-count').textContent,0);
});
test('direct order buttons stay synchronized when the note or cart changes', () => {
  const shop = storefront();shop.add('cupids-bubblegum');
  shop.element('#order-note').value = '<hello> & नमस्ते';shop.element('#order-note').handlers.input();
  assert.match(shop.message(),/<hello> & नमस्ते/);
  for(const id of ['#hero-order','#quick-order'])assert.equal(shop.element(id).href,shop.element('#whatsapp-order').href);
  shop.remove('cupids-bubblegum');
  assert.equal(shop.element('#cart-summary').hidden,true);
});
test('format filters show the right products and unavailable storage still permits ordering', () => {
  const shop=storefront(null,true);shop.add('bubble-boba');
  assert.equal(shop.element('#cart-total').textContent,'₹80');
  shop.evaluate("renderProducts('dessert')");
  assert.match(shop.element('#product-grid').innerHTML,/Choose flavor/);
  assert.doesNotMatch(shop.element('#product-grid').innerHTML,/Sunset Crush/);
  assert.equal(shop.element('#product-count').textContent,'1 candle design');
});


test('every catalog product links to a real detail page with unconfirmed specifications', () => {
  const shop = storefront();
  for (const product of shop.evaluate('PRODUCTS')) {
    const html = fs.readFileSync(path.join(__dirname, '..', product.id + '.html'), 'utf8');
    assert.match(html, new RegExp('data-product-id="' + product.id + '"'));
    assert.match(html, /<dt>Size \/ weight<\/dt><dd>To be confirmed/);
    assert.match(html, /<dt>Wax type<\/dt><dd>To be confirmed/);
    assert.match(html, /src="product.js"/);
    assert.ok(shop.element('#product-grid').innerHTML.includes(`href="${product.id}.html"`));
  }
  assert.doesNotMatch(shop.element('#product-grid').innerHTML, /data-choose|flavor-box/);
});
test('detail quantities add in one operation and reject invalid or excessive amounts', () => {
  const shop = storefront();
  assert.equal(shop.evaluate('addToCart("sundae", "mango", 3)'), true);
  assert.equal(shop.element('#cart-total').textContent, '₹597');
  assert.equal(shop.evaluate('addToCart("sundae", "mango", 97)'), false);
  assert.equal(shop.evaluate('addToCart("bubble-boba", undefined, 0)'), false);
  assert.equal(shop.evaluate('addToCart("bubble-boba", undefined, 1.5)'), false);
  assert.equal(shop.evaluate('addToCart("bubble-boba", undefined, 2)'), true);
  assert.match(shop.message(), /Bubble boba \(Set of 2\) × 2 — ₹160/);
  assert.equal(shop.element('#cart-total').textContent, '₹757');
});
