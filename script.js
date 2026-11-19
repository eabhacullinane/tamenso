(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  // Footer year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Remember the language a visitor picks (English is the default site).
  try {
    document.querySelectorAll('.langs a').forEach(function (a) {
      a.addEventListener('click', function () {
        localStorage.setItem('tamenso-lang', a.getAttribute('hreflang'));
      });
    });
  } catch (e) {}

  // Hairline under the sticky header once the page scrolls
  var bar = document.querySelector('.site-nav');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Fade sections in as they scroll into view
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
