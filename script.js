(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  // Footer year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Remember the language a visitor picks (English is the default site).
  try {
    document.querySelectorAll('.langs a').forEach(function (a) {
      a.addEventListener('click', function () { localStorage.setItem('tamenso-lang', a.getAttribute('hreflang')); });
    });
  } catch (e) {}

  // Header: light text over the dark hero, stone bar once past it
  var bar = document.querySelector('.site-nav');
  var hero = document.getElementById('hero');
  function onScroll() {
    if (!bar) return;
    var y = window.scrollY;
    bar.classList.toggle('scrolled', y > 8);
    if (hero) bar.classList.toggle('on-dark', y < hero.offsetHeight - 70);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Corridor: steer with the mouse (or the phone's tilt)
  var scene = document.querySelector('.scene');
  if (scene && !reduce) {
    var setView = function (nx, ny) { // -1..1
      scene.style.setProperty('--ry', (nx * 14).toFixed(2) + 'deg');
      scene.style.setProperty('--rx', (-ny * 8).toFixed(2) + 'deg');
    };
    if (finePointer) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        setView((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
      });
      hero.addEventListener('pointerleave', function () { setView(0, 0); });
    } else {
      window.addEventListener('deviceorientation', function (e) {
        if (e.gamma == null) return;
        setView(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
      });
    }
  }

  // Floating dust of light in the corridor
  var canvas = document.querySelector('.dust');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var motes = [];
    var W = 0, H = 0;
    var size = function () {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, W * H / 14000));
      motes = [];
      for (var i = 0; i < n; i++) {
        motes.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .3,
                     vx: (Math.random() - .5) * .15, vy: -Math.random() * .25 - .05, a: Math.random() * .6 + .15 });
      }
    };
    var visible = true;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(canvas);
    var tick = function () {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < motes.length; i++) {
          var m = motes[i];
          m.x += m.vx; m.y += m.vy;
          if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; }
          ctx.beginPath();
          ctx.fillStyle = 'rgba(242,203,142,' + m.a + ')';
          ctx.arc(m.x, m.y, m.r, 0, 6.283);
          ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    };
    size();
    window.addEventListener('resize', size);
    requestAnimationFrame(tick);
  }

  // 3D tilt + light on cards
  if (finePointer && !reduce) {
    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ty', ((px - .5) * 10).toFixed(2) + 'deg');
        el.style.setProperty('--tx', ((.5 - py) * 10).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        el.classList.add('tilting');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('tilting');
        el.style.removeProperty('--tx'); el.style.removeProperty('--ty');
      });
    });
  }

  // "Choose your door": pick options, doors open, the path builds itself
  var panel = document.querySelector('.path-panel');
  if (panel) {
    var opts = Array.prototype.slice.call(document.querySelectorAll('.opt'));
    var list = panel.querySelector('.path-list');
    var empty = panel.querySelector('.path-empty');
    var refresh = function () {
      var picked = opts.filter(function (o) { return o.getAttribute('aria-pressed') === 'true'; });
      document.querySelectorAll('.pdoor').forEach(function (d) {
        d.classList.toggle('open', !!d.querySelector('.opt[aria-pressed="true"]'));
      });
      list.innerHTML = '';
      picked.forEach(function (o) {
        var li = document.createElement('li');
        li.textContent = o.querySelector('.opt-label').textContent;
        list.appendChild(li);
      });
      empty.hidden = picked.length > 0;
    };
    opts.forEach(function (o) {
      o.addEventListener('click', function () {
        var on = o.getAttribute('aria-pressed') !== 'true';
        if (on && o.hasAttribute('data-single')) {
          opts.forEach(function (x) {
            if (x !== o && x.getAttribute('data-group') === o.getAttribute('data-group')) x.setAttribute('aria-pressed', 'false');
          });
        }
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
        refresh();
      });
    });
    refresh();
  }

  // Brief: the short conversation, sent as a ready-to-send email
  var brief = document.getElementById('brief');
  if (brief) {
    var errBox = brief.querySelector('.form-error');
    var thanks = brief.querySelector('.thanks');
    var labelOf = function (el) { return el.getAttribute('data-label') || el.name; };
    brief.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = brief.elements.name, email = brief.elements.email;
      if (!name.value.trim() || !email.value.trim() || !email.checkValidity()) {
        errBox.hidden = false;
        (name.value.trim() ? email : name).focus();
        return;
      }
      errBox.hidden = true;
      var lines = [];
      var picked = Array.prototype.map.call(document.querySelectorAll('.opt[aria-pressed="true"] .opt-label'),
        function (l) { return l.textContent; });
      lines.push(brief.getAttribute('data-path') + ': ' + (picked.length ? picked.join(' → ') : brief.getAttribute('data-none')));
      lines.push('');
      var done = {};
      Array.prototype.forEach.call(brief.elements, function (el) {
        if (!el.name || done[el.name]) return;
        var v;
        if (el.type === 'radio') {
          done[el.name] = true;
          var c = brief.querySelector('input[name="' + el.name + '"]:checked');
          v = c ? c.value : '';
        } else { v = el.value.trim(); }
        if (v) lines.push(labelOf(el) + ': ' + v);
      });
      var subject = brief.getAttribute('data-subject') + ' · ' + name.value.trim() +
        (brief.elements.company.value.trim() ? ' (' + brief.elements.company.value.trim() + ')' : '');
      location.href = 'mailto:eabha@tamenso.com?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      thanks.hidden = false;
    });
  }

  // Numbers count up when they come into view (keeps each language's format)
  function countUp(el) {
    var text = el.textContent;
    var parts = [];
    text.replace(/\d+(?:[.,]\d+)?/g, function (m, i) { parts.push({ s: m, i: i }); return m; });
    if (!parts.length || reduce) return;
    var t0 = null, dur = 1400;
    function frame(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3), out = '', last = 0;
      parts.forEach(function (p) {
        var sep = p.s.indexOf(',') > -1 ? ',' : '.';
        var dec = p.s.split(/[.,]/)[1];
        var v = (parseFloat(p.s.replace(',', '.')) * e).toFixed(dec ? dec.length : 0).replace('.', sep);
        out += text.slice(last, p.i) + v; last = p.i + p.s.length;
      });
      el.textContent = out + text.slice(last);
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal, [data-count]');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
