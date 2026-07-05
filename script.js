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

  /* ── Nav scroll state ─────────────────────────────────────────
     Adds/removes a "scrolled" class once the user scrolls past the
     top, letting the navbar fade in a background (see nav.scrolled
     in Style.css). Only runs if the page has a #navbar element. */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  /* ── Mobile hamburger menu ────────────────────────────────────
     Only runs if the page has both #hamburger and #navLinks. */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
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
          const delay = Math.min(siblings.indexOf(entry.target) * 0.07, 0.45);
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

  /* ── Ambient blob parallax ─────────────────────────────────────
     Moves the decorative ".blob" background shapes slightly with
     the mouse. Only does anything on pages that actually have
     .blob elements (querySelectorAll safely returns an empty list
     otherwise). */
  document.addEventListener('mousemove', (e) => {
    const blobs = document.querySelectorAll('.blob');
    if (!blobs.length) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    blobs.forEach((b, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      b.style.transform = `translate(${x * dir * 0.35}px, ${y * dir * 0.35}px)`;
    });
  });
})();
