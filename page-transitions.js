/* ════════════════════════════════════════════════════════════════
   PAGE TRANSITIONS — Unique Touch
   Subtle recede-on-exit + fade-and-rise-on-enter between pages.
   Reuses the site's motion vocabulary (GSAP power2.out).
   Self-contained: no dependencies beyond the already-loaded GSAP.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion → never hide, never animate. Bail early.
  if (REDUCED) {
    document.documentElement.classList.remove('pt-hide');
    return;
  }

  var EXIT_DUR   = 0.25;   // seconds — recede before navigating
  var EXIT_FAIL  = 350;    // ms — navigate anyway if onComplete is starved
  var ENTER_DUR  = 0.5;    // seconds — fade + rise on arrival
  var STAGGER    = 0.07;   // seconds between hero elements (70ms)
  var navigating = false;

  var hasGSAP = function () { return typeof window.gsap !== 'undefined'; };

  // ── Eligibility ──────────────────────────────────────────────────
  // Same-origin *.html links, primary click, no modifiers / new tab.
  function isEligible(a, e) {
    if (!a) return false;
    if (e) {
      if (e.defaultPrevented) return false;
      if (e.button !== 0) return false;               // left-click only
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    }
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;

    var href = a.getAttribute('href');
    if (!href) return false;
    if (href.charAt(0) === '#') return false;          // same-page anchor
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

    // Resolve against current origin; must stay on this site.
    var url;
    try { url = new URL(a.href, window.location.href); }
    catch (err) { return false; }
    if (url.origin !== window.location.origin) return false;

    // Only real page navigations (*.html), not asset links.
    if (!/\.html($|[?#])/i.test(url.pathname + url.search)) return false;

    // Don't transition to the exact same URL.
    if (url.href === window.location.href) return false;

    return true;
  }

  function closestAnchor(node) {
    while (node && node !== document) {
      if (node.tagName === 'A') return node;
      node = node.parentNode;
    }
    return null;
  }

  // ── Exit ─────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var a = closestAnchor(e.target);
    if (!isEligible(a, e)) return;

    e.preventDefault();
    if (navigating) return;
    navigating = true;

    var dest = a.href;
    var go = function () { window.location.href = dest; };

    if (hasGSAP()) {
      window.gsap.to(document.body, {
        opacity: 0.9,
        scale: 0.995,
        y: -12,
        duration: EXIT_DUR,
        ease: 'power2.out',
        transformOrigin: 'center top',
        onComplete: go
      });
      // Failsafe: navigate even if the tween never completes.
      setTimeout(go, EXIT_FAIL);
    } else {
      go();
    }
  }, false);

  // ── Enter ────────────────────────────────────────────────────────
  // Opt-in per page: only pages that tag their hero with [data-pt] get
  // the fade-and-rise entrance. Pages with their own native entrance
  // (the homepage preloader, the service reel's runEntrance) simply
  // don't tag anything, so they reveal instantly and keep their own
  // choreography untouched.
  function runEnter() {
    var reveal = function () {
      document.documentElement.classList.remove('pt-hide');
      document.body.style.opacity = '';
    };

    var heroEls = document.querySelectorAll('[data-pt]');
    if (!heroEls.length || document.getElementById('preloader')) { reveal(); return; }

    if (!hasGSAP()) { reveal(); return; }

    // Base fade — opacity only on <body> (no transform) so ScrollTrigger
    // pin math stays intact.
    window.gsap.set(document.body, { opacity: 0 });
    document.documentElement.classList.remove('pt-hide');

    window.gsap.to(document.body, {
      opacity: 1,
      duration: ENTER_DUR,
      ease: 'power2.out'
    });

    // Hero stagger — eyebrow → heading → description → CTA → media,
    // ordered by DOM position of [data-pt] elements.
    window.gsap.fromTo(heroEls,
      { y: 20 },
      { y: 0, duration: ENTER_DUR, ease: 'power2.out', stagger: STAGGER }
    );

    // Failsafe: guarantee visibility even if a tween is dropped.
    setTimeout(reveal, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runEnter, false);
  } else {
    runEnter();
  }

  // ── Prefetch on hover / touch ────────────────────────────────────
  // Warm the next page so the post-recede load is near-instant.
  var prefetched = {};
  function prefetch(a) {
    if (!isEligible(a, null)) return;
    var href = a.href;
    if (prefetched[href]) return;
    prefetched[href] = true;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
  function onHover(e) {
    var a = closestAnchor(e.target);
    if (a) prefetch(a);
  }
  document.addEventListener('pointerenter', onHover, true);
  document.addEventListener('touchstart', onHover, { capture: true, passive: true });
})();
