/* ================================================================
   PROJECTS GRID — index.html only
   Reads projects.json and renders the filterable bento grid in the
   "My Work" section (#projectsGrid / #csFilters). Safe to include
   on other pages too: if those elements aren't present, it simply
   does nothing.
   ================================================================ */
(function () {
  'use strict';

  const GRID = document.getElementById('projectsGrid');
  const FILTERS = document.getElementById('csFilters');
  if (!GRID) return; // this page doesn't have a projects grid

  let ALL = [];
  let active = 'All';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

  const TEMPLATE_MOCKUP = `
    <div class="tmpl-preview">
      <div class="tmpl-window">
        <div class="tmpl-bar">
          <span class="tmpl-dot tmpl-dot-r"></span>
          <span class="tmpl-dot tmpl-dot-y"></span>
          <span class="tmpl-dot tmpl-dot-g"></span>
          <div class="tmpl-url"><span class="tmpl-lock">🔒</span>yoursite.com</div>
        </div>
        <div class="tmpl-body">
          <div class="tmpl-nav">
            <span class="tmpl-logo"></span>
            <span class="tmpl-navline"></span>
            <span class="tmpl-navline"></span>
            <span class="tmpl-navline tmpl-navline-btn"></span>
          </div>
          <div class="tmpl-hero">
            <div class="tmpl-hero-text">
              <span class="tmpl-line tmpl-line-lg"></span>
              <span class="tmpl-line tmpl-line-lg tmpl-line-short"></span>
              <span class="tmpl-line tmpl-line-sm"></span>
              <span class="tmpl-cta"></span>
            </div>
            <div class="tmpl-hero-visual"></div>
          </div>
        </div>
      </div>
      <div class="tmpl-lang-badge"><span>AR</span><i></i><span>EN</span></div>
    </div>`;

  function buildCard(item) {
    const thumb = item.id === 1
      ? TEMPLATE_MOCKUP
      : item.image
        ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"/>`
        : `<div class="pj-thumb-ph"><span class="ph-icon">🖼️</span><span class="ph-label">No image</span></div>`;

    const chips = (item.chips || []).map((c) => `<span class="pj-chip">${esc(c)}</span>`).join('');

    return `
      <div class="pj-card reveal">
        <div class="pj-thumb">
          ${thumb}
          ${item.badge ? `<span class="pj-badge">${esc(item.badge)}</span>` : ''}
        </div>
        <div class="pj-body">
          <h3 class="pj-title">${esc(item.title)}</h3>
          ${item.desc ? `<p class="pj-desc">${esc(item.desc)}</p>` : ''}
          ${chips ? `<div class="pj-chips">${chips}</div>` : ''}
        </div>
        <div class="pj-footer">
          <a href="${esc(item.link || '#')}" target="_blank" rel="noopener" class="pj-link">
            ${esc(item.btnText || 'View Project')}
            <span class="pj-link-arrow">${ARROW_SVG}</span>
          </a>
        </div>
      </div>`;
  }

  /* Dedicated reveal observer for cards rendered after the initial
     page load (the global observer in script.js only watches
     elements that already exist at page-load time). */
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = [...(entry.target.parentElement?.querySelectorAll('.reveal') || [])];
        entry.target.style.transitionDelay = Math.min(siblings.indexOf(entry.target) * 0.09, 0.5) + 's';
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  function render(list) {
    if (!list.length) {
      GRID.innerHTML = `<div class="cs-empty"><div class="cs-empty-icon">📂</div><p>No projects in this category yet.</p></div>`;
      return;
    }
    GRID.innerHTML = list.map(buildCard).join('');
    GRID.querySelectorAll('.reveal').forEach((el) => cardObserver.observe(el));
  }

  function buildFilters(data) {
    if (!FILTERS) return;
    const badges = ['All', ...new Set(data.map((p) => p.badge).filter(Boolean))];
    FILTERS.innerHTML = badges
      .map((b) => `<button class="cs-filter-btn${b === active ? ' active' : ''}" data-f="${esc(b)}">${esc(b)}</button>`)
      .join('');
    FILTERS.querySelectorAll('.cs-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        active = btn.dataset.f;
        FILTERS.querySelectorAll('.cs-filter-btn').forEach((b) => b.classList.toggle('active', b.dataset.f === active));
        render(active === 'All' ? ALL : ALL.filter((p) => p.badge === active));
      });
    });
  }

  async function load() {
    try {
      const res = await fetch('projects.json?v=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      ALL = await res.json();
      if (!Array.isArray(ALL) || !ALL.length) {
        GRID.innerHTML = `<div class="cs-empty"><div class="cs-empty-icon">📂</div><p>No projects yet.</p></div>`;
        return;
      }
      buildFilters(ALL);
      render(ALL);
    } catch (e) {
      console.error('projects.json error:', e);
      GRID.innerHTML = `<div class="cs-empty"><div class="cs-empty-icon">⚠️</div><p>Could not load projects. Make sure projects.json exists.</p></div>`;
    }
  }

  load();
})();
