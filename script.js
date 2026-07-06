// ---- Header background on scroll ----
  const header = document.getElementById('siteHeader');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('nav a');

  if (header && navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (!header.classList.contains('nav-open')) return;
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, {passive:true});

  // ---- Generic reveal-on-scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  revealEls.forEach(el => revealObserver.observe(el));

  // ---- Warli divider draw-in ----
  const warli = document.getElementById('warliDivider');
  const warliObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        warli.classList.add('in');
        warliObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.25});
  warliObserver.observe(warli);

  // ---- Counters ----
  const counters = document.querySelectorAll('.impact-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = prefix + val.toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, {threshold:0.5});
  counters.forEach(c => counterObserver.observe(c));

  // ---- Landmark billboard: reveals handled by the generic .reveal observer above ----

  // ---- Rivers Showcase ----
  const rshowSection  = document.getElementById('rivers');
  const rshowTabs     = Array.from(document.querySelectorAll('.rshow-tab'));
  const rshowSlides   = Array.from(document.querySelectorAll('.rshow-slide'));
  const rshowBgLayers = Array.from(document.querySelectorAll('.rshow-bg-layer'));
  const rshowFill     = document.querySelector('.rshow-progress-fill');
  const rshowCur      = document.querySelector('.rshow-cur');
  const RSHOW_DURATION = 5500;

  let rshowIdx = 0;
  let rshowTimer = null;
  let rshowRAF = null;
  let rshowProgressStart = null;

  function rshowGoTo(idx, resetTimer = true) {
    const prev = rshowIdx;
    const total = rshowTabs.length;
    rshowIdx = ((idx % total) + total) % total;

    // tabs
    rshowTabs.forEach((t, i) => {
      t.classList.toggle('rshow-active', i === rshowIdx);
      t.setAttribute('aria-pressed', String(i === rshowIdx));
    });

    // slides
    rshowSlides.forEach((s, i) => {
      s.classList.remove('rshow-active', 'rshow-exit');
      if (i === prev && prev !== rshowIdx) s.classList.add('rshow-exit');
      if (i === rshowIdx) s.classList.add('rshow-active');
    });
    setTimeout(() => rshowSlides.forEach(s => s.classList.remove('rshow-exit')), 560);

    // backgrounds
    rshowBgLayers.forEach((b, i) => b.classList.toggle('rshow-active', i === rshowIdx));

    // counter
    if (rshowCur) rshowCur.textContent = String(rshowIdx + 1).padStart(2, '0');

    if (resetTimer) rshowStart();
  }

  function rshowStart() {
    cancelAnimationFrame(rshowRAF);
    clearTimeout(rshowTimer);

    // reset progress bar without transition
    if (rshowFill) {
      rshowFill.style.transition = 'none';
      rshowFill.style.width = '0%';
      // force reflow so the transition reset applies before we animate
      rshowFill.getBoundingClientRect();
    }
    rshowProgressStart = performance.now();

    function tick(now) {
      const pct = Math.min(((now - rshowProgressStart) / RSHOW_DURATION) * 100, 100);
      if (rshowFill) rshowFill.style.width = pct + '%';
      if (pct < 100) {
        rshowRAF = requestAnimationFrame(tick);
      }
    }
    rshowRAF = requestAnimationFrame(tick);
    rshowTimer = setTimeout(() => rshowGoTo(rshowIdx + 1), RSHOW_DURATION);
  }

  function rshowStop() {
    cancelAnimationFrame(rshowRAF);
    clearTimeout(rshowTimer);
  }

  if (rshowSection && rshowTabs.length) {
    // click tabs
    rshowTabs.forEach((tab, i) => tab.addEventListener('click', () => rshowGoTo(i)));

    // swipe / drag support (mouse + touch)
    let pointerStartX = 0;
    const onPointerDown = (e) => { pointerStartX = e.touches ? e.touches[0].clientX : e.clientX; };
    const onPointerUp   = (e) => {
      const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const dx = endX - pointerStartX;
      if (Math.abs(dx) > 52) rshowGoTo(dx < 0 ? rshowIdx + 1 : rshowIdx - 1);
    };
    rshowSection.addEventListener('touchstart', onPointerDown, { passive: true });
    rshowSection.addEventListener('touchend',   onPointerUp,   { passive: true });
    rshowSection.addEventListener('mousedown',  onPointerDown);
    rshowSection.addEventListener('mouseup',    onPointerUp);

    // prev / next arrow buttons
    const rshowPrevBtn = document.getElementById('rshowPrev');
    const rshowNextBtn = document.getElementById('rshowNext');
    if (rshowPrevBtn) rshowPrevBtn.addEventListener('click', () => rshowGoTo(rshowIdx - 1));
    if (rshowNextBtn) rshowNextBtn.addEventListener('click', () => rshowGoTo(rshowIdx + 1));

    // start only when section is visible
    const showcaseObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { rshowStart(); }
        else { rshowStop(); }
      });
    }, { threshold: 0.25 });
    showcaseObserver.observe(rshowSection);
  }
