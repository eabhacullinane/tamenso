(function () {
  'use strict';

  // ---------- language toggle ----------
  var html = document.documentElement;
  var toggleBtn = document.getElementById('langToggle');

  function applyLang(lang) {
    html.lang = lang;
    var other = lang === 'fr' ? 'en' : 'fr';
    document.querySelectorAll('[lang="' + lang + '"]').forEach(function (el) {
      el.hidden = false;
    });
    document.querySelectorAll('[lang="' + other + '"]').forEach(function (el) {
      el.hidden = true;
    });
  }

  function initialLang() {
    try {
      var saved = localStorage.getItem('tamenso-lang');
      if (saved === 'en' || saved === 'fr') return saved;
    } catch (e) {}
    return navigator.language && navigator.language.toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  }

  applyLang(initialLang());

  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var next = html.lang === 'fr' ? 'en' : 'fr';
      applyLang(next);
      try { localStorage.setItem('tamenso-lang', next); } catch (e) {}
    });
  }

  // ---------- splash / curtain reveal ----------
  var splash = document.getElementById('splash');
  var main = document.getElementById('main');
  var btn = document.getElementById('enterBtn');
  var flourish = document.getElementById('archFlourish');

  if (!splash || !btn) return;

  var alreadyEntered = false;
  try { alreadyEntered = sessionStorage.getItem('tamenso-entered') === '1'; } catch (e) {}

  if (alreadyEntered) return;

  splash.hidden = false;
  if ('inert' in HTMLElement.prototype) { main.inert = true; }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var done = false;

  function finish() {
    if (done) return;
    done = true;
    splash.hidden = true;
    if (flourish) flourish.style.display = 'none';
    if ('inert' in HTMLElement.prototype) { main.inert = false; }
    var heading = document.getElementById('main-heading');
    if (heading) heading.focus();
    try { sessionStorage.setItem('tamenso-entered', '1'); } catch (e) {}
  }

  function reveal() {
    var rect = btn.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;

    if (reduceMotion) {
      splash.classList.add('closing');
      setTimeout(finish, 420);
      return;
    }

    if (flourish) {
      flourish.style.left = x + 'px';
      flourish.style.top = y + 'px';
      flourish.classList.add('run');
    }

    splash.style.clipPath = 'circle(150% at ' + x + 'px ' + y + 'px)';
    void splash.offsetWidth;
    splash.classList.add('closing');
    splash.style.clipPath = 'circle(0% at ' + x + 'px ' + y + 'px)';

    setTimeout(finish, 1200);
  }

  btn.addEventListener('click', reveal, { once: true });
})();
