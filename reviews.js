'use strict';

function buildReviewUrl({ product, rating, review, name = '', variant = '' }) {
  const score = Number(rating);
  if (!product || !Number.isInteger(score) || score < 1 || score > 5 || !review.trim() || review.length > 1000 || name.length > 60) return null;
  const message = ["Hi Saanjh! I'd like to share a candle review:", '', `Product: ${product}`, ...(variant ? [`Flavor: ${variant}`] : []), `Rating: ${score}/5`, ...(name.trim() ? [`Name: ${name.trim()}`] : []), '', review.trim()];
  return `https://wa.me/918792517450?text=${encodeURIComponent(message.join('\n'))}`;
}

if (typeof module !== 'undefined') module.exports = { buildReviewUrl };

if (typeof document !== 'undefined') {
  const reviewForm = document.querySelector('#review-form');
  reviewForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!reviewForm.reportValidity()) return;
    const values = new FormData(reviewForm);
    const url = buildReviewUrl({ product: document.body.dataset.reviewProduct, rating: values.get('rating'), review: values.get('review'), name: values.get('name'), variant: values.get('variant') || '' });
    if (url) window.location.assign(url);
  });
}
