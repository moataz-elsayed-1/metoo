/* ================================================================
   CASE STUDIES PAGE — case-studies.html only
   Keyboard-accessible image lightbox for the campaign screenshot
   galleries. Reveal animation and blob parallax are shared and
   live in script.js.

   openLightbox / closeLightbox are called directly from onclick=""
   attributes in case-studies.html, so they're declared as plain
   global functions (not wrapped in a closure) on purpose.
   ================================================================ */

function openLightbox(el) {
  const img = el.querySelector('img');
  const src = el.dataset.src || (img ? img.src : '');
  const alt = img ? img.alt : '';
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  if (!lb || !lbImg) return;
  lbImg.src = src;
  lbImg.alt = alt;
  lb.classList.add('active');
  lb.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('active');
  lb.setAttribute('aria-hidden', 'true');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  /* Keyboard support: Enter opens the lightbox for a focused thumbnail */
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('cs-sub-img')) {
    openLightbox(e.target);
  }
});
