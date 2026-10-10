// Eden Malka — header, mobile menu, portfolio filters, lightbox and scroll reveal.
(function () {
  var header = document.querySelector('.site-header');
  function onScroll() { header && header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- mobile menu ----------
  var nav = document.getElementById('site-nav');
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.nav-overlay');
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    overlay.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.querySelector('.nav-close').focus();
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(true); });
    nav.querySelector('.nav-close').addEventListener('click', function () { setMenu(false); toggle.focus(); });
    overlay.addEventListener('click', function () { setMenu(false); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); toggle.focus(); } });
  }

  // Services submenu: a dropdown on desktop (also opens on hover via CSS), an accordion in the mobile drawer.
  // In the drawer it starts open on the services page itself.
  var drawerMode = window.matchMedia('(max-width: 900px)');
  document.querySelectorAll('.sub-toggle').forEach(function (btn) {
    var item = btn.closest('.has-sub');
    var list = document.getElementById(btn.getAttribute('aria-controls'));
    function setSub(open) { btn.setAttribute('aria-expanded', open); list.hidden = !open; item.classList.toggle('open', open); }
    setSub(drawerMode.matches && !!item.querySelector('[aria-current="page"]'));
    btn.addEventListener('click', function () { setSub(list.hidden); });
    document.addEventListener('click', function (e) { if (!drawerMode.matches && !item.contains(e.target)) setSub(false); });
    item.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !list.hidden && !drawerMode.matches) { setSub(false); btn.focus(); } });
    drawerMode.addEventListener('change', function () { setSub(false); });
  });

  // ---------- portfolio filters ----------
  var items = Array.prototype.slice.call(document.querySelectorAll('.grid .item'));
  var filters = document.querySelectorAll('.filters button');
  var more = document.querySelector('.more');
  var PAGE = 12, cat = 'all', limit = PAGE;
  function render() {
    var shown = 0;
    items.forEach(function (i) {
      var match = cat === 'all' || i.dataset.cat === cat;
      i.hidden = !match || shown >= limit;
      if (match) shown++;
    });
    if (more) more.hidden = shown <= limit;
  }
  filters.forEach(function (b) {
    var c = b.dataset.filter;
    var n = c === 'all' ? items.length : items.filter(function (i) { return i.dataset.cat === c; }).length;
    b.insertAdjacentHTML('beforeend', ' <span class="n">(' + n + ')</span>');
    b.addEventListener('click', function () {
      filters.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cat = c; limit = PAGE; render();
    });
  });
  if (more) more.addEventListener('click', function () {
    var first = items.filter(function (i) { return i.hidden && (cat === 'all' || i.dataset.cat === cat); })[0];
    limit += PAGE; render();
    if (first) first.focus();
  });
  render();
  // Links like portfolio.html?cat=menus open the portfolio on that category
  var wanted = new URLSearchParams(location.search).get('cat');
  var wantedBtn = wanted && document.querySelector('.filters button[data-filter="' + wanted + '"]');
  if (wantedBtn) wantedBtn.click();

  // ---------- lightbox (portfolio grids and the work samples on the services page) ----------
  var lb = document.querySelector('.lightbox');
  var gallery = Array.prototype.slice.call(document.querySelectorAll('button.item'));
  if (lb && gallery.length) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), current = 0, opener = null;
    function visible() { return gallery.filter(function (i) { return !i.hidden; }); }
    function show(idx) {
      var list = visible();
      current = (idx + list.length) % list.length;
      var it = list[current], img = it.querySelector('img');
      lbImg.src = img.src; lbImg.alt = img.alt;
      lbCap.textContent = it.dataset.label + ' · ' + (current + 1) + ' / ' + list.length;
    }
    function open(it) {
      opener = it;
      show(visible().indexOf(it));
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    }
    function close() { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
    gallery.forEach(function (it) { it.addEventListener('click', function () { open(it); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      // RTL: right arrow goes to the previous image, left arrow to the next
      if (e.key === 'ArrowRight') show(current - 1);
      if (e.key === 'ArrowLeft') show(current + 1);
    });
  }

  // ---------- logo carousel ----------
  var track = document.querySelector('.car-track');
  if (track) {
    var slides = track.querySelectorAll('.car-slide');
    var prev = document.querySelector('.car-prev'), next = document.querySelector('.car-next');
    var dotsWrap = document.querySelector('.car-dots');
    var rtl = getComputedStyle(track).direction === 'rtl';
    var dots = [], timer = null, paused = false;

    function step() { return Math.abs(slides[1].offsetLeft - slides[0].offsetLeft); } // slide width + gap
    function pos() { return Math.abs(track.scrollLeft); } // RTL scrollLeft runs 0 → negative
    function lastIndex() { return Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / step())); }
    function index() { return Math.min(lastIndex(), Math.round(pos() / step())); }
    function go(i) {
      i = Math.max(0, Math.min(lastIndex(), i));
      track.scrollTo({ left: (rtl ? -1 : 1) * i * step() });
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      dots = [];
      for (var i = 0; i <= lastIndex(); i++) {
        var d = document.createElement('button');
        d.setAttribute('aria-label', 'מעבר ללוגו ' + (i + 1));
        d.addEventListener('click', (function (n) { return function () { go(n); restart(); }; })(i));
        dotsWrap.appendChild(d);
        dots.push(d);
      }
      sync();
    }
    function sync() {
      var i = index(), last = lastIndex();
      dots.forEach(function (d, n) { d.setAttribute('aria-current', n === i ? 'true' : 'false'); });
      prev.disabled = i <= 0;
      next.disabled = i >= last;
    }

    prev.addEventListener('click', function () { go(index() - 1); restart(); });
    next.addEventListener('click', function () { go(index() + 1); restart(); });
    var raf = null;
    track.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = null; sync(); }); }, { passive: true });
    var resizeT;
    window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(buildDots, 150); });

    // Autoplay: advances every few seconds, loops back to the start; pauses on hover, focus and touch,
    // and stays off when the visitor prefers reduced motion (system setting or the accessibility menu)
    function motionOff() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-pause');
    }
    function tick() {
      if (paused || motionOff() || document.hidden) return;
      var i = index();
      go(i >= lastIndex() ? 0 : i + 1);
    }
    function restart() { clearInterval(timer); timer = setInterval(tick, 3500); }
    var carousel = track.closest('.clients');
    carousel.addEventListener('mouseenter', function () { paused = true; });
    carousel.addEventListener('mouseleave', function () { paused = false; });
    carousel.addEventListener('focusin', function () { paused = true; });
    carousel.addEventListener('focusout', function () { paused = false; });
    track.addEventListener('touchstart', function () { paused = true; restart(); }, { passive: true });
    track.addEventListener('touchend', function () { paused = false; }, { passive: true });

    buildDots();
    restart();
  }

  // ---------- reveal on scroll ----------
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('in'); });

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
