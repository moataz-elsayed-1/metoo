/* ================================================================
   GLOBAL SCRIPT — shared across every page (index.html, case-studies.html)
   Handles: nav scroll state, mobile hamburger menu, scroll-reveal
   animations, smooth in-page anchor scrolling, ambient blob parallax.

   Safe to load on any page: every block checks that its target
   element(s) actually exist before wiring up behavior, so a page
   that's missing a hamburger menu (for example) simply skips that
   part instead of throwing an error.
   ================================================================ */
(function () {
  'use strict';

  /* ── Shared capability checks ─────────────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ── Nav scroll state ─────────────────────────────────────────
     Adds/removes a "scrolled" class once the user scrolls past the
     top, letting the floating nav pill's background intensify (see
     nav.scrolled in Style.css). Selects the site's own top-level
     <nav> structurally so it works the same on every page, whether
     or not that page happens to give it an id. */
  const navbar = document.querySelector('body > nav');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ── Mobile hamburger menu ────────────────────────────────────
     Only runs if the page has both #hamburger and #navLinks. */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
      });
    });
  }

  /* ── Sliding nav-pill indicator ───────────────────────────────
     A small pill glides behind whichever nav link the mouse is
     over, snapping back to the current section link on mouse-out.
     Desktop only — the mobile menu is a full-screen list instead. */
  if (navLinks && isFinePointer) {
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    navLinks.appendChild(indicator);

    const moveIndicatorTo = (link) => {
      if (!link) { indicator.style.opacity = '0'; return; }
      const navRect = navLinks.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      indicator.style.width = linkRect.width + 'px';
      indicator.style.transform = `translate(${linkRect.left - navRect.left}px, -50%)`;
    };

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('mouseenter', () => moveIndicatorTo(link));
    });
    navLinks.addEventListener('mouseleave', () => moveIndicatorTo(null));
  }

  /* ── Scroll-reveal animation ──────────────────────────────────
     Fades/slides in any element with class="reveal" as it enters
     the viewport, staggering siblings slightly. Elements added to
     the page later (e.g. project cards rendered by projects.js)
     are handled by their own observer in that file, not here. */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = [...(entry.target.parentElement?.querySelectorAll('.reveal') || [])];
          const delay = Math.min(siblings.indexOf(entry.target) * 0.09, 0.5);
          entry.target.style.transitionDelay = delay + 's';
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ── Smooth scroll for in-page anchors ────────────────────────
     Applies to any <a href="#..."> on the page (nav links, CTA
     buttons, etc.). */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const targetId = a.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Live experience counter ────────────────────────────────────
     Counts up in years + months from the date of the first-ever ad
     campaign to whatever "today" is when the page loads — so the
     homepage stat always stays accurate without manual updates.
     START_DATE is read from the first campaign's Meta Ads Manager
     performance chart (estimated from the chart's date axis) —
     update this single line if the exact date is known precisely. */
  const expEl = document.getElementById('expCounter');
  if (expEl) {
    const START_DATE = new Date(2025, 3, 30); // April 30, 2025
    const now = new Date();
    let years = now.getFullYear() - START_DATE.getFullYear();
    let months = now.getMonth() - START_DATE.getMonth();
    if (now.getDate() < START_DATE.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    months = Math.max(months, 0);

    let label;
    if (years < 1) {
      label = `${Math.max(months, 1)}m`;
    } else if (months === 0) {
      label = `${years}y`;
    } else {
      label = `${years}y ${months}m`;
    }
    expEl.textContent = label;
  }

  /* ── Ambient blob parallax ─────────────────────────────────────
     Moves the decorative ".blob" background shapes slightly with
     the mouse. Only does anything on pages that actually have
     .blob elements. Skipped entirely if the user prefers reduced
     motion — the blobs still get their slow CSS "breathing" glow,
     they just won't chase the cursor. */
  const blobs = document.querySelectorAll('.blob');
  if (blobs.length && !prefersReducedMotion) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      blobs.forEach((b, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        b.style.transform = `translate(${x * dir * 0.35}px, ${y * dir * 0.35}px)`;
      });
    });
  }

  /* ── Split-word heading reveal ─────────────────────────────────
     Wraps each word of a heading in its own <span> and reveals them
     with a short stagger as the heading scrolls into view. Existing
     child elements (an accent <span class="grad">, a <br>) are left
     intact — an accent span reveals as a single unit, a <br> is
     just passed through untouched. Skipped entirely under reduced
     motion: headings just show immediately, no wrapping needed. */
  function prepareSplitWords(el) {
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((chunk) => {
          if (chunk === '') return;
          if (/^\s+$/.test(chunk)) {
            frag.appendChild(document.createTextNode(chunk));
          } else {
            const span = document.createElement('span');
            span.className = 'split-word';
            span.textContent = chunk;
            frag.appendChild(span);
          }
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
        node.classList.add('split-word');
      }
    });
  }

  const splitTargets = document.querySelectorAll('.hero-name, .hero-tagline, .section-title, .cs-title, .page-hero h1');
  if (splitTargets.length && !prefersReducedMotion) {
    splitTargets.forEach(prepareSplitWords);
    const words = document.querySelectorAll('.split-word');
    const splitObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = [...entry.target.parentElement.querySelectorAll('.split-word')];
          const i = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = Math.min(i * 0.045, 0.6) + 's';
          entry.target.classList.add('visible');
          splitObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    words.forEach((w) => splitObserver.observe(w));
  }

  /* ── Image wipe reveal ──────────────────────────────────────────
     A curtain-style clip-path wipe for photos/screenshots as they
     scroll into view — a more "designed" moment than a plain fade,
     reserved for actual images so it reads as a deliberate reveal
     rather than noise. */
  const wipeTargets = document.querySelectorAll('.pj-thumb, .cs-main-img, .cs-sub-img, .hero-photo');
  if (wipeTargets.length && !prefersReducedMotion) {
    wipeTargets.forEach((el) => el.classList.add('img-wipe'));
    const wipeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          wipeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01 });
    wipeTargets.forEach((el) => wipeObserver.observe(el));
  }

  /* ── Reveal safety net ────────────────────────────────────────
     Belt-and-suspenders: whatever the reason an element might not
     have been picked up by its observer yet (a slow device, a
     viewport quirk, anything) — nothing stays invisible forever.
     A couple of seconds after load, anything still hidden just
     shows itself, no animation needed at that point. */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible), .split-word:not(.visible), .img-wipe:not(.visible)')
        .forEach((el) => el.classList.add('visible'));
    }, 2500);
  });

  /* ── Count-up numbers ─────────────────────────────────────────
     Animates a stat's digits counting up from 0 the first time it
     scrolls into view, preserving whatever prefix/suffix text sits
     around the number ("$", "+", "×", "k", etc.). Anything that
     isn't a simple number-with-decoration pattern (like the live
     "1y 4m" experience counter) is left completely alone. */
  function animateCountUp(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return; // not a countable pattern — leave as-is
    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(target)) return;
    const hasComma = numStr.includes(',');
    const decimals = (numStr.split('.')[1] || '').length;
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = target * eased;
      const formatted = decimals
        ? current.toFixed(decimals)
        : Math.round(current).toLocaleString('en-US', { useGrouping: hasComma });
      el.textContent = prefix + formatted + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    }
    requestAnimationFrame(tick);
  }

  const countTargets = document.querySelectorAll('.s-num, .hero-stat-num, .cs-s-num');
  if (countTargets.length && !prefersReducedMotion) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id !== 'expCounter') {
          animateCountUp(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    countTargets.forEach((el) => countObserver.observe(el));
  }

  /* ── Scroll progress bar ──────────────────────────────────────
     Thin line at the very top of the viewport tracking how far
     down the page the reader is. Purely visual, purely optional —
     only runs if the page includes the bar element. */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    let ticking = false;
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = pct + '%';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
    }, { passive: true });
    updateProgress();
  }

  /* ── Custom cursor ────────────────────────────────────────────
     A small glowing dot that trails the pointer and grows over
     interactive elements. Fine-pointer devices only (real mice /
     trackpads) and skipped under reduced motion — on touch devices
     it's simply never created, so nothing extra ships to mobile. */
  if (isFinePointer && !prefersReducedMotion) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    document.body.classList.add('custom-cursor-active');

    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let dx = cx, dy = cy;
    window.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; });

    function followCursor() {
      dx += (cx - dx) * 0.18;
      dy += (cy - dy) * 0.18;
      dot.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(followCursor);
    }
    requestAnimationFrame(followCursor);

    const hoverables = 'a, button, .btn, .pj-card, .service-card, .why-card, .social-link, input, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) dot.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) dot.classList.remove('cursor-hover');
    });
    document.addEventListener('mousedown', () => dot.classList.add('cursor-active'));
    document.addEventListener('mouseup', () => dot.classList.remove('cursor-active'));
  }

  /* ── Magnetic buttons ─────────────────────────────────────────
     Primary/secondary buttons drift a few pixels toward the cursor
     while it's within their bounds, and ease back to rest on
     mouse-leave. Fine-pointer only; skipped under reduced motion. */
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width / 2;
        const relY = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ── Tilt cards ───────────────────────────────────────────────
     A gentle 3D tilt that follows the cursor across a card's
     surface — subtle amplitude, kept calm on purpose. Fine-pointer
     only; skipped under reduced motion. */
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.pj-card, .service-card, .why-card, .cs-stat').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-4px) perspective(900px) rotateX(${py * -5}deg) rotateY(${px * 5}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
})();
