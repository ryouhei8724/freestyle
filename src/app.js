(function () {
  var root = document.documentElement;
  var labels = { auto: '自動', light: 'ライト', dark: 'ダーク' };
  var order = ['auto', 'light', 'dark'];
  var labelEl = document.getElementById('theme-label');
  function current() { return root.dataset.theme === 'light' || root.dataset.theme === 'dark' ? root.dataset.theme : 'auto'; }
  function apply(mode) {
    if (mode === 'auto') delete root.dataset.theme; else root.dataset.theme = mode;
    if (labelEl) labelEl.textContent = labels[mode];
    try { if (mode === 'auto') localStorage.removeItem('otf-theme'); else localStorage.setItem('otf-theme', mode); } catch (e) {}
  }
  if (labelEl) labelEl.textContent = labels[current()];
  var toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', function () { apply(order[(order.indexOf(current()) + 1) % order.length]); });

  var toc = document.getElementById('toc');
  var narrow = window.matchMedia('(max-width: 900px)');
  function syncToc() { if (toc) toc.open = !narrow.matches; }
  syncToc();
  if (narrow.addEventListener) narrow.addEventListener('change', syncToc);
  if (toc) toc.addEventListener('click', function (e) {
    if (narrow.matches && e.target.closest && e.target.closest('nav a')) toc.open = false;
  });

  var bar = document.getElementById('progress-bar');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var links = Array.prototype.slice.call(document.querySelectorAll('.toc nav a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  function updateActive() {
    var y = window.scrollY + 120;
    var active = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].getBoundingClientRect().top + window.scrollY <= y) active = targets[i]; else break;
    }
    links.forEach(function (a) { a.classList.remove('active'); });
    if (active && byId[active.id]) {
      var link = byId[active.id];
      link.classList.add('active');
      var chapter = link.dataset.chapter && byId[link.dataset.chapter];
      if (chapter) chapter.classList.add('active');
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { updateActive(); ticking = false; }); }
  }, { passive: true });
  updateActive();

  function markScrollable() {
    document.querySelectorAll('.fig-scroll').forEach(function (el) {
      var hint = el.parentNode.querySelector('.scroll-hint');
      if (hint) hint.classList.toggle('on', el.scrollWidth > el.clientWidth + 4);
    });
  }
  window.addEventListener('resize', markScrollable);
  markScrollable();
})();
