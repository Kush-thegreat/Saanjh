'use strict';

(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let paused = false;
  try { paused = sessionStorage.getItem('saanjh-motion-paused') === 'true'; } catch { /* Motion controls work without storage. */ }
  root.classList.toggle('motion-paused', paused);
  if (paused || preference.matches) document.getAnimations().forEach(animation => animation.cancel());
  const motionAllowed = () => !preference.matches && !paused;
  const syncFlame = () => {
    const image = document.querySelector('.hero-visual>img');
    if (image) image.src = motionAllowed() ? 'assets/hero.svg' : 'assets/hero-still.svg';
  };
  syncFlame();
  const button = document.createElement('button');
  button.className = 'motion-toggle';
  button.type = 'button';
  const refreshButton = () => {
    button.hidden = preference.matches;
    button.textContent = paused ? '✦ Resume motion' : '✦ Pause motion';
    button.setAttribute('aria-pressed', String(paused));
  };
  refreshButton();
  button.addEventListener('click', () => {
    paused = !paused;
    root.classList.toggle('motion-paused', paused);
    try { sessionStorage.setItem('saanjh-motion-paused', String(paused)); } catch { /* Keep the choice for this page. */ }
    document.getAnimations().forEach(animation => {
      if (paused) animation.pause();
      else animation.play();
    });
    refreshButton();
    syncFlame();
  });
  preference.addEventListener('change', () => {
    if (preference.matches) document.getAnimations().forEach(animation => animation.cancel());
    refreshButton();
    syncFlame();
  });
  const motionHome = document.querySelector('.hero-signature, .catalog-intro, .checkout-intro');
  const detailDescription = document.querySelector('.detail-description');
  if (motionHome) motionHome.append(button);
  else if (detailDescription) detailDescription.after(button);
  else document.querySelector('footer')?.append(button);

  const progress = document.createElement('div');
  progress.className = 'scroll-gold';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let frame;
  const updateProgress = () => {
    frame = undefined;
    const distance = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
  };
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateProgress); }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const hero = document.querySelector('.hero-band');
  if (hero) {
    const stars = document.createElement('div');
    stars.className = 'hero-sparkles';
    stars.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 16; index++) {
      const star = document.createElement('i');
      star.style.cssText = `--spark-x:${5 + (index * 29) % 91}%;--spark-y:${6 + (index * 19) % 87}%;--spark-size:${4 + index % 4 * 3}px;--spark-time:${4 + index % 5}s;--spark-delay:-${index * .7}s`;
      stars.append(star);
    }
    hero.prepend(stars);
  }

  // Small, bounded bursts acknowledge an actual add-to-bag action.
  document.querySelector('#product-purchase')?.addEventListener('submit', event => {
    const feedback = document.querySelector('#purchase-feedback');
    if (!event.defaultPrevented || !motionAllowed() || !feedback?.textContent.includes('added to your bag')) return;
    const bounds = document.querySelector('.detail-add').getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    for (let index = 0; index < 12; index++) {
      const spark = document.createElement('i');
      spark.className = 'joy-spark';
      spark.setAttribute('aria-hidden', 'true');
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      document.body.append(spark);
      const angle = index / 12 * Math.PI * 2;
      const distance = 35 + index % 3 * 15;
      const animation = spark.animate([
        { opacity: 1, transform: 'translate(0,0) rotate(0) scale(1)' },
        { opacity: 0, transform: `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance - 18}px) rotate(150deg) scale(.2)` }
      ], { duration: 750, easing: 'cubic-bezier(.15,.6,.3,1)' });
      animation.onfinish = () => spark.remove();
      animation.oncancel = () => spark.remove();
    }
  });

  // Freeze decorative loops outside the viewport to reduce idle rendering work.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('motion-outside', !entry.isIntersecting)));
    document.querySelectorAll('.hero-band, .glow-ribbon, .closing').forEach(element => observer.observe(element));
  }
  document.addEventListener('visibilitychange', () => root.classList.toggle('page-asleep', document.hidden));
})();
