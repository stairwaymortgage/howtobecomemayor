/* =========================================================================
   components.js — Shared header and footer for every page.

   How it works:
   1. Every HTML page contains <div id="nav-placeholder"></div> in the
      header area and <div id="footer-placeholder"></div> in the footer area.
   2. On DOMContentLoaded this script injects the HTML below into those
      placeholders, then marks the active nav link based on the current path.

   To update site-wide navigation or footer copy, edit ONLY this file.
   ========================================================================= */

(function () {
  'use strict';

  /* ---------- HEADER MARKUP ---------- */
  const navHTML = `
    <header class="site-header" role="banner">
      <div class="header-inner">
        <a href="/" class="brand" aria-label="How to Become Mayor — home">
          <span class="brand-mark">HBM</span>
          <span class="brand-text">
            <span class="brand-line-1">How to Become</span>
            <span class="brand-line-2">Mayor</span>
          </span>
        </a>

        <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="primaryNav" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>

        <nav class="primary-nav" id="primaryNav" aria-label="Primary">
          <a href="/" data-nav="/">Home</a>
          <a href="/about" data-nav="/about">About</a>
          <a href="/blog" data-nav="/blog">Journal</a>
          <a href="/contact" data-nav="/contact">Contact</a>
          <a href="/apply" data-nav="/apply" class="nav-cta">Apply</a>
        </nav>
      </div>
    </header>
  `;

  /* ---------- FOOTER MARKUP ---------- */
  const footerHTML = `
    <footer class="site-footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-col footer-brand">
          <div class="footer-logo">HBM</div>
          <p class="footer-tag">A private cohort for the long path to local leadership.</p>
        </div>

        <div class="footer-col">
          <h4>Site</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/blog">Journal</a></li>
            <li><a href="/apply">Apply</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy">Privacy</a></li>
          </ul>
        </div>

        <div class="footer-col footer-note">
          <h4>Get in touch</h4>
          <p>The community is joined by <a href="/apply">application</a> — read by a Review Panel, decided on vision and character.</p>
        </div>
      </div>

      <div class="footer-baseline">
        <span>&copy; <span id="footerYear"></span> How to Become Mayor.</span>
        <span class="footer-handle">Built for the long civic walk.</span>
      </div>
    </footer>
  `;

  /* ---------- INJECT + WIRE UP ---------- */
  function init() {
    const navMount = document.getElementById('nav-placeholder');
    const footMount = document.getElementById('footer-placeholder');

    if (navMount) navMount.innerHTML = navHTML;
    if (footMount) footMount.innerHTML = footerHTML;

    // Mark current page in nav (strip trailing slash for matching).
    const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    document.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.getAttribute('data-nav') === path) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
    });

    // Mobile menu toggle.
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('primaryNav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
    }

    // Year stamp.
    const yr = document.getElementById('footerYear');
    if (yr) yr.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
