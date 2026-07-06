// ---- Header background on scroll ----
  const header = document.getElementById('siteHeader');
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

  // ---- Landmark story: stable, responsive scroll activation ----
  gsap.registerPlugin(ScrollTrigger);

  const landmarkSteps = gsap.utils.toArray('.landmark-step');
  const landmarkImages = gsap.utils.toArray('.landmark-img');
  const landmarkTag = document.getElementById('mediaTag');
  const landmarkSection = document.getElementById('projects');
  const landmarkTags = ['01 — PRIMARY LANDMARK', '02 — SPIRITUAL SYMBOL', '03 — MASTER CAMPUS'];
  let activeLandmarkIndex = 0;

  function setActiveLandmark(index) {
    if (!landmarkSteps.length || !landmarkImages.length) return;
    const i = Math.max(0, Math.min(index, landmarkSteps.length - 1));
    const currentImage = document.querySelector('.landmark-img.active');
    const currentImageIndex = currentImage ? Number(currentImage.getAttribute('data-index')) : -1;
    if (
      i === activeLandmarkIndex &&
      landmarkSteps[i].classList.contains('active') &&
      currentImageIndex === i
    ) {
      return;
    }

    landmarkSteps.forEach((step) => step.classList.remove('active'));
    landmarkImages.forEach((image) => image.classList.remove('active'));

    const nextStep = landmarkSteps[i];
    const nextImage = document.querySelector(`.landmark-img[data-index="${i}"]`) || landmarkImages[i];

    if (!nextStep || !nextImage) return;

    nextStep.classList.add('active');
    nextImage.classList.add('active');
    activeLandmarkIndex = i;

    if (landmarkTag) {
      landmarkTag.textContent = landmarkTags[i] || landmarkTags[0];
    }

    gsap.fromTo(nextImage, { scale: 1.08, opacity: 0.12 }, {
      scale: 1,
      opacity: 1,
      duration: 0.58,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.fromTo(nextStep, { y: 14, opacity: 0.45 }, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  if (landmarkSteps.length) {
    setActiveLandmark(0);

    let landmarkTicking = false;
    const updateLandmarkByViewportCenter = () => {
      if (!landmarkSection) {
        landmarkTicking = false;
        return;
      }

      const sectionRect = landmarkSection.getBoundingClientRect();
      const sectionInView = sectionRect.bottom > 0 && sectionRect.top < window.innerHeight;
      if (!sectionInView) {
        landmarkTicking = false;
        return;
      }

      // Clamp to boundaries so reverse scroll cannot leave the media in stale state.
      if (sectionRect.top >= 0) {
        setActiveLandmark(0);
        landmarkTicking = false;
        return;
      }
      if (sectionRect.bottom <= window.innerHeight) {
        setActiveLandmark(landmarkSteps.length - 1);
        landmarkTicking = false;
        return;
      }

      const targetY = window.innerHeight * 0.55;
      let closestIndex = activeLandmarkIndex;
      let closestDistance = Number.POSITIVE_INFINITY;

      landmarkSteps.forEach((step, i) => {
        const r = step.getBoundingClientRect();
        const centerY = r.top + (r.height * 0.5);
        const distance = Math.abs(centerY - targetY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      setActiveLandmark(closestIndex);
      landmarkTicking = false;
    };

    const requestLandmarkSync = () => {
      if (landmarkTicking) return;
      landmarkTicking = true;
      requestAnimationFrame(updateLandmarkByViewportCenter);
    };

    window.addEventListener('scroll', requestLandmarkSync, { passive: true });
    window.addEventListener('resize', requestLandmarkSync, { passive: true });
    window.addEventListener('load', requestLandmarkSync, { passive: true });
    requestLandmarkSync();
  }

  // ---- River cards: stable vertical interaction for all devices ----
  const riverSection = document.getElementById('rivers');
  const riverCards = Array.from(document.querySelectorAll('.river-card'));

  if (riverSection && riverCards.length) {
    riverCards[0].classList.add('is-active');

    const riverCardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          riverCards.forEach((card) => card.classList.remove('is-active'));
          entry.target.classList.add('is-active');
        }
      });
    }, {
      threshold: [0.45, 0.65],
      rootMargin: '-10% 0px -20% 0px'
    });

    riverCards.forEach((card) => riverCardObserver.observe(card));
  }
