'use strict';

const detailProduct = findProduct(document.body.dataset.productId);
let selectedFlavor = detailProduct.variants?.[0].id;
const quantityInput = document.querySelector('#product-quantity');
const feedback = document.querySelector('#purchase-feedback');
function adjustQuantity(delta) {
  const current = Number(quantityInput.value);
  quantityInput.value = Math.max(1, Math.min(99, (Number.isInteger(current) ? current : 1) + delta));
  feedback.textContent = '';
}
document.querySelector('#quantity-less').addEventListener('click', () => adjustQuantity(-1));
document.querySelector('#quantity-more').addEventListener('click', () => adjustQuantity(1));
quantityInput.addEventListener('input', () => { feedback.textContent = ''; });
document.querySelectorAll('[data-variant]').forEach(button => button.addEventListener('click', () => {
  const variant = variantFor(detailProduct, button.dataset.variant);
  if (!variant) return;
  selectedFlavor = variant.id;
  document.querySelectorAll('[data-variant]').forEach(option => {
    const active = option === button;
    option.setAttribute('aria-pressed', String(active));
    option.classList.toggle('selected', active);
  });
  document.querySelector('#detail-photo').src = `assets/${variant.image}`;
  document.querySelector('#detail-photo').alt = `${variant.name} candle`;
  document.querySelector('#product-title').textContent = variant.name;
  document.querySelector('#selected-flavor').textContent = variant.name + (detailProduct.scented ? ' · Scented candle' : '');
  document.title = `${variant.name} — Saanjh: एक लौ`;
  feedback.textContent = '';
}));
document.querySelector('#product-purchase').addEventListener('submit', event => {
  event.preventDefault();
  if (!quantityInput.reportValidity()) return;
  const quantity = Number(quantityInput.value);
  const added = addToCart(detailProduct.id, selectedFlavor, quantity);
  feedback.textContent = added ? `${quantity} × ${variantFor(detailProduct, selectedFlavor)?.name || detailProduct.name} added to your bag.` : 'Please check the quantity. You can add up to 99 of each candle or flavor.';
});
