const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildReviewUrl } = require('../reviews.js');

test('every product has a separate linked review page and no invented rating', () => {
  for (const id of ['sunset-crush', 'cupids-bubblegum', 'lavender-love-letter', 'bubble-boba', 'sundae']) {
    const page = fs.readFileSync(path.join(__dirname, '..', `${id}-reviews.html`), 'utf8');
    const product = fs.readFileSync(path.join(__dirname, '..', `${id}.html`), 'utf8');
    assert.ok(product.includes(`${id}-reviews.html`));
    assert.ok(page.includes('No published reviews yet.'));
    assert.ok(page.includes(`href="${id}.html"`));
    assert.ok(page.includes('id="review-form"'));
    assert.ok(!page.includes('src="product.js"'));
    assert.ok(!page.includes('aggregateRating'));
  }
});

test('review message retains product, selected flavor, rating and special characters', () => {
  const url = new URL(buildReviewUrl({ product: 'Sundae', variant: 'Mango Sunshine Sundae', rating: '4', name: 'A & B', review: 'Lovely! <3 एक लौ' }));
  assert.equal(url.hostname, 'wa.me');
  const message = url.searchParams.get('text');
  for (const value of ['Product: Sundae', 'Flavor: Mango Sunshine Sundae', 'Rating: 4/5', 'Name: A & B', 'Lovely! <3 एक लौ']) assert.ok(message.includes(value));
});

test('invalid ratings and blank or excessive reviews do not generate a message', () => {
  for (const rating of ['', '0', '6', '2.5', 'bad']) assert.equal(buildReviewUrl({ product: 'Bubble boba', rating, review: 'Nice candle' }), null);
  for (const review of [' ', 'x'.repeat(1001)]) assert.equal(buildReviewUrl({ product: 'Bubble boba', rating: '5', review }), null);
});
