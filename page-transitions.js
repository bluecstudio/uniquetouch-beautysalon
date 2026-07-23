/* ════════════════════════════════════════════════════════════════
   PAGE TRANSITIONS — Unique Touch
   Editorial chapter-change between pages, built on the site's own
   rotating nav graphic (brand_assets/buller-list.svg).

   Leaving page : four-panel iris closes black from the edges → center,
                  the page softly recedes, then we navigate.
   Arriving page: a sessionStorage baton + a pre-first-paint solid
                  overlay make the swap seamless; the nav SVG scales in
                  and spins, an editorial caption blur-staggers in, and
                  once the page is loaded the SVG fills the viewport and
                  dissolves into the destination's own entrance.

   No new graphics, no loading bar / % / spinner. GPU-only (transform,
   opacity, filter). Respects prefers-reduced-motion. Self-contained:
   the only dependency is the already-loaded GSAP.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var BG        = '#0A0906';   // --bg
  var BATON_KEY = 'ut:pt';
  var EXIT_DUR  = 0.4;         // s — iris close on the leaving page
  var EXIT_FAIL = 700;         // ms — navigate anyway if a tween is starved
  var ENTER_DUR = 0.6;         // s — destination hero fade + rise
  var STAGGER   = 0.09;        // s — between hero elements
  var MIN_HOLD  = 1500;        // ms — minimum loader choreography before reveal
  var HARD_CAP  = 4000;        // ms — reveal no matter what

  // Editorial caption per destination (by filename; query ignored).
  var CAPTIONS = {
    'service-experience.html': ['EXPERT', 'CARE'],
    'gallery.html':            ['REAL',  'RESULTS']
  };

  // The nav menu's rotating graphic, inlined so it scales crisply.
  var LOADER_SVG =
    '<svg viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<ellipse cx="4.62204" cy="4.5" rx="1.54733" ry="4.5" fill="#D4AF37"/>' +
    '<ellipse cx="4.64218" cy="4.55933" rx="1.5" ry="4.642" transform="rotate(90 4.64218 4.55933)" fill="#D4AF37"/>' +
    '</svg>';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion → never hide, never animate, native navigation.
  if (REDUCED) {
    document.documentElement.classList.remove('pt-hide');
    try { sessionStorage.removeItem(BATON_KEY); } catch (e) {}
    return;
  }

  var hasGSAP = function () { return typeof window.gsap !== 'undefined'; };
  var navigating = false;
  var enterFired = false;

  function fileOf(url) {
    try {
      var p = new URL(url, window.location.href).pathname;
      var base = p.split('/').pop();
      return base || 'index.html';
    } catch (e) { return ''; }
  }

  function dispatchEnter() {
    if (enterFired) return;
    enterFired = true;
    try { window.dispatchEvent(new Event('pt:enter')); } catch (e) {}
  }

  // ── Injected stylesheet (one self-contained <style>) ─────────────
  (function injectStyle() {
    var css =
    '.pt-iris,.pt-overlay{position:fixed;inset:0;z-index:2147483000;pointer-events:none}' +
    '.pt-panel{position:fixed;background:' + BG + ';will-change:transform;backface-visibility:hidden}' +
    '.pt-panel.pt-top{top:0;left:0;right:0;height:51%;transform-origin:top center;transform:scaleY(0)}' +
    '.pt-panel.pt-bottom{bottom:0;left:0;right:0;height:51%;transform-origin:bottom center;transform:scaleY(0)}' +
    '.pt-panel.pt-left{top:0;bottom:0;left:0;width:51%;transform-origin:left center;transform:scaleX(0)}' +
    '.pt-panel.pt-right{top:0;bottom:0;right:0;width:51%;transform-origin:right center;transform:scaleX(0)}' +
    '.pt-overlay{background:' + BG + ';display:flex;align-items:center;justify-content:center}' +
    '.pt-loader-wrap{display:flex;flex-direction:row;align-items:center;gap:clamp(12px,1.6vw,20px)}' +
    // SVG small; font ~3.2x its width so the caption reads ~2.5x its visual weight.
    // Matched clamp breakpoints (both hit floor/ceiling at the same viewport widths)
    // keep that ratio constant at every screen size.
    '.pt-loader{width:clamp(10px,2.2vw,22px);aspect-ratio:10/9;display:flex;transform:scale(0);will-change:transform,filter}' +
    '.pt-loader svg{width:100%;height:100%;display:block}' +
    '.pt-caption{display:flex;flex-direction:row;align-items:baseline;white-space:nowrap;gap:0.32em}' +
    '.pt-word{font-family:"Cinzel",serif;font-weight:500;text-transform:uppercase;white-space:nowrap;' +
      'font-size:clamp(2rem,7.04vw,4.4rem);line-height:1.02;letter-spacing:0.06em;' +
      'background:linear-gradient(180deg,#ffffff 0%,#d4b96a 42%,#6b4e1a 100%);' +
      '-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;' +
      'opacity:0;will-change:transform,opacity,filter}' +
    '@media (max-width:640px){.pt-loader-wrap{flex-direction:column-reverse;gap:clamp(14px,4vw,20px);text-align:center}.pt-caption{justify-content:center}}' +
    'html.pt-arriving::before{content:"";position:fixed;inset:0;background:' + BG + ';z-index:2147483000;pointer-events:none}';
    var s = document.createElement('style');
    s.id = 'pt-style';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  })();

  // ── Arrival baton (read synchronously, before first paint) ───────
  var arriving = null;
  try {
    var raw = sessionStorage.getItem(BATON_KEY);
    if (raw) { arriving = JSON.parse(raw); sessionStorage.removeItem(BATON_KEY); }
  } catch (e) { arriving = null; }
  if (arriving && (Date.now() - (arriving.t || 0) > 12000)) arriving = null; // stale

  var loaderMode = !!(arriving && arriving.words && arriving.words.length);
  if (arriving) {
    document.documentElement.classList.add('pt-arriving'); // paint solid black now
    if (loaderMode) window.__ptActive = true;              // destination defers its entrance
  }

  // ── Eligibility ──────────────────────────────────────────────────
  function isEligible(a, e) {
    if (!a) return false;
    if (e) {
      if (e.defaultPrevented) return false;
      if (e.button !== 0) return false;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    }
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;

    var href = a.getAttribute('href');
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

    var url;
    try { url = new URL(a.href, window.location.href); }
    catch (err) { return false; }
    if (url.origin !== window.location.origin) return false;
    if (!/\.html($|[?#])/i.test(url.pathname + url.search)) return false;
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

  // ── Exit: four-panel iris close, then navigate ───────────────────
  function buildIris() {
    var iris = document.createElement('div');
    iris.className = 'pt-iris';
    var names = ['top', 'bottom', 'left', 'right'];
    var panels = {};
    for (var i = 0; i < names.length; i++) {
      var p = document.createElement('div');
      p.className = 'pt-panel pt-' + names[i];
      iris.appendChild(p);
      panels[names[i]] = p;
    }
    document.documentElement.appendChild(iris); // on <html>, immune to body recede
    return panels;
  }

  document.addEventListener('click', function (e) {
    var a = closestAnchor(e.target);
    if (!isEligible(a, e)) return;

    e.preventDefault();
    if (navigating) return;
    navigating = true;

    var dest = a.href;
    var words = CAPTIONS[fileOf(dest)] || [];
    try {
      sessionStorage.setItem(BATON_KEY, JSON.stringify({ words: words, dest: dest, t: Date.now() }));
    } catch (err) {}

    prefetch(a);
    document.body.style.pointerEvents = 'none';

    var go = function () { window.location.href = dest; };

    if (hasGSAP()) {
      var p = buildIris();
      var tl = window.gsap.timeline({ onComplete: go });
      // Page softly recedes beneath the closing black.
      tl.to(document.body, {
        opacity: 0.9, scale: 0.995, y: -12,
        duration: EXIT_DUR, ease: 'power2.out', transformOrigin: 'center top'
      }, 0);
      // Black closes inward from all four edges.
      tl.to(p.top,    { scaleY: 1, duration: EXIT_DUR, ease: 'power2.out' }, 0);
      tl.to(p.bottom, { scaleY: 1, duration: EXIT_DUR, ease: 'power2.out' }, 0);
      tl.to(p.left,   { scaleX: 1, duration: EXIT_DUR, ease: 'power2.out' }, 0);
      tl.to(p.right,  { scaleX: 1, duration: EXIT_DUR, ease: 'power2.out' }, 0);
      setTimeout(go, EXIT_FAIL); // failsafe
    } else {
      go();
    }
  }, false);

  // ── Arrival: loader → caption → reveal ───────────────────────────
  function buildOverlay() {
    var ov = document.createElement('div');
    ov.className = 'pt-overlay';
    var wrap = document.createElement('div');
    wrap.className = 'pt-loader-wrap';

    var loader = document.createElement('div');
    loader.className = 'pt-loader';
    loader.innerHTML = LOADER_SVG;

    var cap = document.createElement('div');
    cap.className = 'pt-caption';
    var words = [];
    for (var i = 0; i < arriving.words.length; i++) {
      var w = document.createElement('span');
      w.className = 'pt-word';
      w.textContent = arriving.words[i];
      cap.appendChild(w);
      words.push(w);
    }

    wrap.appendChild(loader);
    wrap.appendChild(cap);
    ov.appendChild(wrap);
    document.documentElement.appendChild(ov);
    return { overlay: ov, loader: loader, words: words };
  }

  function runReveal(el, spin) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var box = el.loader.getBoundingClientRect();
    var size = box.width || 56;
    var target = (Math.max(vw, vh) / size) * 1.8; // buffer for off-center scaling

    var tl = window.gsap.timeline({
      onComplete: function () {
        if (spin) spin.kill();
        el.overlay.remove();
        window.__ptActive = false;
      }
    });

    // Caption blurs out and the two words drift apart (side by side → left/right).
    if (el.words[0]) tl.to(el.words[0], { opacity: 0, x: -13, filter: 'blur(8px)', duration: 0.5, ease: 'power2.in' }, 0);
    if (el.words[1]) tl.to(el.words[1], { opacity: 0, x: 13,  filter: 'blur(8px)', duration: 0.5, ease: 'power2.in' }, 0);

    // SVG fills the viewport with a slow→fast ease-in, keeps rotating, softens, dissolves.
    tl.to(el.loader, { scale: target, duration: 0.9, ease: 'power4.in' }, 0.1);
    tl.to(el.loader, { filter: 'blur(24px)', opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.4);

    // Overlay dissolves; the destination's own entrance begins as it clears.
    tl.add(dispatchEnter, 0.45);
    tl.to(el.overlay, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0.45);
  }

  function runLoader() {
    var el = buildOverlay();
    document.documentElement.classList.remove('pt-arriving'); // real overlay now covers

    var g = window.gsap;
    g.set(el.loader, { scale: 0, rotation: 0, transformOrigin: '50% 50%' });
    g.set(el.words, { opacity: 0, y: 8, filter: 'blur(10px)' });

    var spin = null;
    var intro = g.timeline();
    // Scale 0 → 1 with a full 360° turn…
    intro.to(el.loader, { scale: 1, rotation: 360, duration: 0.9, ease: 'power3.out' }, 0);
    // …then hand off to a slow, seamless infinite rotation.
    intro.add(function () {
      spin = g.to(el.loader, { rotation: '+=360', duration: 8, ease: 'none', repeat: -1 });
    });
    // Caption words settle into focus, staggered 120ms.
    intro.to(el.words, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', stagger: 0.12 }, 0.55);

    // Reveal once the page is loaded AND the choreography has had its beat.
    var ready = new Promise(function (res) {
      if (document.readyState === 'complete') res();
      else window.addEventListener('load', res, { once: true });
    });
    var minHold = new Promise(function (res) { setTimeout(res, MIN_HOLD); });
    var cap     = new Promise(function (res) { setTimeout(res, HARD_CAP); });

    Promise.race([Promise.all([ready, minHold]), cap]).then(function () {
      runReveal(el, spin);
    });
  }

  function initArrival() {
    if (!arriving) return;
    if (!loaderMode) {                              // Home: hand off to the preloader
      document.documentElement.classList.remove('pt-arriving');
      return;
    }
    if (!hasGSAP()) {                               // GSAP missing → reveal instantly
      document.documentElement.classList.remove('pt-arriving');
      dispatchEnter();
      return;
    }
    runLoader();
  }

  // ── Enter: destination reveal / [data-pt] fade-and-rise ──────────
  // Direct loads reveal as before. Under a transition overlay, the
  // hero rise waits for `pt:enter` so it plays as the overlay clears.
  function runEnter() {
    var reveal = function () {
      document.documentElement.classList.remove('pt-hide');
      document.body.style.opacity = '';
    };

    var heroEls = document.querySelectorAll('[data-pt]');
    var hasHero = heroEls.length && !document.getElementById('preloader') && hasGSAP();

    if (window.__ptActive) {
      // Overlay owns the page reveal; play the hero rise on pt:enter.
      reveal();
      if (hasHero) {
        window.gsap.set(heroEls, { y: 20, opacity: 0 });
        window.addEventListener('pt:enter', function () {
          window.gsap.to(heroEls, {
            y: 0, opacity: 1, duration: ENTER_DUR, ease: 'power2.out', stagger: STAGGER
          });
        }, { once: true });
      }
      return;
    }

    if (!hasHero) { reveal(); return; }

    window.gsap.set(document.body, { opacity: 0 });
    reveal();
    window.gsap.to(document.body, { opacity: 1, duration: ENTER_DUR, ease: 'power2.out' });
    window.gsap.fromTo(heroEls, { y: 20 }, {
      y: 0, duration: ENTER_DUR, ease: 'power2.out', stagger: STAGGER
    });
    setTimeout(reveal, 1200); // failsafe
  }

  function boot() { initArrival(); runEnter(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, false);
  } else {
    boot();
  }

  // ── bfcache: clear any stale overlay on back/forward restore ─────
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    document.documentElement.classList.remove('pt-arriving');
    var ov = document.querySelector('.pt-overlay'); if (ov) ov.remove();
    var ir = document.querySelector('.pt-iris');    if (ir) ir.remove();
    document.body.style.pointerEvents = '';
    if (hasGSAP()) window.gsap.set(document.body, { clearProps: 'opacity,transform' });
    navigating = false;
  });

  // ── Prefetch on hover / touch ────────────────────────────────────
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
