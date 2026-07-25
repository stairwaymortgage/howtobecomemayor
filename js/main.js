/* =========================================================================
   main.js — Page-level interactions.
   Loaded after components.js on every page.
   ========================================================================= */

(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(() => {
    /* --- Subtle scroll reveal for elements marked [data-reveal] --- */
    const revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && revealEls.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    /* --- Header shadow on scroll --- */
    function onScroll() {
      const y = window.scrollY || 0;
      const header = document.querySelector('.site-header');
      if (header) {
        if (y > 8) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* =====================================================================
       Real form submission — posts to /api/submit (Vercel serverless fn).
       ===================================================================== */

    function collectFields(form) {
      const data = {};
      form.querySelectorAll('input[name], select[name], textarea[name]').forEach((el) => {
        data[el.name] = el.value;
      });
      return data;
    }

    function wireForm(formId, statusId, formType, successMessage) {
      const form = document.getElementById(formId);
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const status = document.getElementById(statusId);
        const button = form.querySelector('button[type="submit"]');

        // Native validation first.
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const payload = collectFields(form);
        payload.formType = formType;

        if (status) {
          status.textContent = 'Sending\u2026';
          status.classList.remove('is-success', 'is-error');
        }
        if (button) button.disabled = true;

        try {
          const r = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const result = await r.json().catch(() => ({}));

          if (r.ok && result.ok) {
            if (status) {
              status.textContent = successMessage;
              status.classList.add('is-success');
            }
            form.reset();
            // Leave the button disabled after a successful application —
            // one application per sitting is the correct behavior.
            if (formType !== 'application' && button) button.disabled = false;
          } else {
            if (status) {
              status.textContent = result.error || 'Something went wrong. Please try again shortly.';
              status.classList.add('is-error');
            }
            if (button) button.disabled = false;
          }
        } catch (err) {
          if (status) {
            status.textContent = 'Network error. Please check your connection and try again.';
            status.classList.add('is-error');
          }
          if (button) button.disabled = false;
        }
      });
    }

    wireForm(
      'applyForm',
      'applyStatus',
      'application',
      'Received. The Review Panel reads every application in full. You will hear one of three outcomes within thirty days.'
    );

    wireForm(
      'contactForm',
      'contactStatus',
      'contact',
      'Message received. Thank you for writing.'
    );
  });
})();
