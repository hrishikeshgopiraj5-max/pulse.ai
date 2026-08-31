/**
 * Pulse AI — Anime.js Scroll Animations
 *
 * Inspired by: Apple (scroll-triggered product reveals),
 * Linear (smooth section transitions), Stripe (gradient animations),
 * Notion (playful element entrances)
 *
 * Uses anime.js for:
 * - Staggered card reveals
 * - Counter animations
 * - Text word-by-word reveals
 * - SVG path drawing
 * - Parallax depth layers
 * - Elastic/bounce easing on interactive elements
 */
(function () {
  'use strict';

  if (typeof anime === 'undefined') return;

  // ─── Scroll Reveal Observer ──────────────────────────────
  function createScrollObserver(callback, options = {}) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px 0px -40px 0px' }
    );
    return observer;
  }

  // ─── 1. Hero Entrance Animation (Apple-style cascade) ────
  function animateHeroEntrance() {
    const tl = anime.timeline({ easing: 'easeOutExpo' });

    tl.add({
      targets: '.eyebrow',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      delay: 200,
    })
    .add({
      targets: '.hero h1',
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 1000,
    }, '-=400')
    .add({
      targets: '.hero .lead',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
    }, '-=600')
    .add({
      targets: '.hero-ctas .btn',
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.95, 1],
      duration: 600,
      delay: anime.stagger(100),
    }, '-=400')
    .add({
      targets: '.hero-note',
      opacity: [0, 1],
      duration: 600,
    }, '-=300');
  }

  // ─── 2. Staggered Card Reveals (Linear-style) ────────────
  function animateCardReveals() {
    const observer = createScrollObserver((el) => {
      anime({
        targets: el.children,
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.95, 1],
        duration: 700,
        delay: anime.stagger(120, { start: 100 }),
        easing: 'easeOutCubic',
      });
    });

    document.querySelectorAll('.problem-grid, .feat-grid, .roadmap, .team-grid, .steps').forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── 3. Section Headings (Word-by-word reveal) ───────────
  function animateSectionHeadings() {
    const observer = createScrollObserver((el) => {
      // Split text into words
      const text = el.textContent;
      const words = text.split(' ');
      el.innerHTML = words.map((w) => `<span class="word-reveal" style="display:inline-block;opacity:0">${w}</span>`).join(' ');

      anime({
        targets: el.querySelectorAll('.word-reveal'),
        opacity: [0, 1],
        translateY: [20, 0],
        rotateX: [-30, 0],
        duration: 600,
        delay: anime.stagger(50),
        easing: 'easeOutCubic',
      });
    });

    document.querySelectorAll('.section-head h2, #vision h2').forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── 4. Counter Animations (Number counting) ─────────────
  function animateCounters() {
    const observer = createScrollObserver((el) => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      const obj = { value: 0 };
      anime({
        targets: obj,
        value: target,
        duration: 2000,
        easing: 'easeOutExpo',
        update: () => {
          el.textContent = Math.round(obj.value);
        },
      });
    });

    document.querySelectorAll('[data-counter]').forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── 5. SVG Heartbeat Line Drawing (Pulse animation) ─────
  function animateSVGPaths() {
    const observer = createScrollObserver((el) => {
      const length = el.getTotalLength ? el.getTotalLength() : 600;
      el.style.strokeDasharray = length;
      el.style.strokeDashoffset = length;

      anime({
        targets: el,
        strokeDashoffset: [length, 0],
        duration: 2500,
        easing: 'easeInOutSine',
      });
    });

    document.querySelectorAll('.pg-path, .pulse-rule path').forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── 6. Flow Steps (Sequential reveal with bounce) ───────
  function animateFlowSteps() {
    const observer = createScrollObserver((el) => {
      const steps = el.querySelectorAll('.flow-step');
      const nodes = el.querySelectorAll('.flow-node');

      // Animate nodes with elastic bounce
      anime({
        targets: nodes,
        scale: [0, 1],
        rotate: ['-180deg', '0deg'],
        duration: 800,
        delay: anime.stagger(200, { start: 300 }),
        easing: 'easeOutElastic(1, 0.5)',
      });

      // Animate step content
      anime({
        targets: steps,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(200, { start: 500 }),
        easing: 'easeOutCubic',
      });
    });

    document.querySelectorAll('.flow').forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── 7. Why List Items (Slide-in with accent) ────────────
  function animateWhyList() {
    const observer = createScrollObserver((el) => {
      const items = el.querySelectorAll('.why-item');
      const marks = el.querySelectorAll('.why-mark');

      anime({
        targets: items,
        opacity: [0, 1],
        translateX: [-30, 0],
        duration: 600,
        delay: anime.stagger(100, { start: 200 }),
        easing: 'easeOutCubic',
      });

      // Marks pulse in
      anime({
        targets: marks,
        scale: [0, 1.2, 1],
        duration: 500,
        delay: anime.stagger(100, { start: 300 }),
        easing: 'easeOutElastic(1, 0.6)',
      });
    });

    document.querySelectorAll('.why-list, .why-grid > div:first-child').forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── 8. Vision Section (Dramatic scale + glow) ──────────
  function animateVision() {
    const observer = createScrollObserver((el) => {
      anime({
        targets: el,
        opacity: [0, 1],
        scale: [0.85, 1],
        translateY: [60, 0],
        duration: 1200,
        easing: 'easeOutExpo',
      });
    });

    document.querySelectorAll('.vision-inner').forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── 9. CTA Section (Elastic button entrance) ────────────
  function animateCTA() {
    const observer = createScrollObserver((el) => {
      anime({
        targets: el.querySelector('h2'),
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 800,
        easing: 'easeOutExpo',
      });

      anime({
        targets: el.querySelector('.early-access-form'),
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.98, 1],
        duration: 800,
        delay: 300,
        easing: 'easeOutCubic',
      });

      anime({
        targets: el.querySelectorAll('.btn'),
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 600,
        delay: anime.stagger(150, { start: 500 }),
        easing: 'easeOutElastic(1, 0.6)',
      });
    });

    document.querySelectorAll('.final-cta').forEach((el) => {
      observer.observe(el);
    });
  }

  // ─── 10. Parallax Depth on Scroll (Tesla-style) ──────────
  function setupParallaxDepth() {
    const layers = document.querySelectorAll('.hero-visual, .hero-copy');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const rate = scrollY * 0.3;

      layers.forEach((layer, i) => {
        const depth = (i + 1) * 0.15;
        layer.style.transform = `translateY(${rate * depth}px)`;
      });
    }, { passive: true });
  }

  // ─── 11. Logo Interaction (Elastic spin) ─────────────────
  function setupLogoInteraction() {
    document.querySelectorAll('.logo').forEach((logo) => {
      logo.addEventListener('mouseenter', () => {
        const mark = logo.querySelector('.logo-mark');
        if (mark) {
          anime({
            targets: mark,
            rotateY: 360,
            scale: [1, 1.1, 1],
            duration: 600,
            easing: 'easeOutElastic(1, 0.5)',
          });
        }
      });
    });
  }

  // ─── 12. Button Hover Effects (Magnetic + Scale) ─────────
  function setupButtonEffects() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        anime({
          targets: btn,
          scale: 1.05,
          duration: 300,
          easing: 'easeOutCubic',
        });
      });

      btn.addEventListener('mouseleave', () => {
        anime({
          targets: btn,
          scale: 1,
          duration: 400,
          easing: 'easeOutElastic(1, 0.6)',
        });
      });

      btn.addEventListener('mousedown', () => {
        anime({
          targets: btn,
          scale: 0.95,
          duration: 100,
          easing: 'easeOutCubic',
        });
      });

      btn.addEventListener('mouseup', () => {
        anime({
          targets: btn,
          scale: 1.05,
          duration: 200,
          easing: 'easeOutElastic(1, 0.5)',
        });
      });
    });
  }

  // ─── 13. Card Tilt on Hover (3D perspective) ─────────────
  function setupCardTilt() {
    document.querySelectorAll('.feat-card, .problem-card, .team-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        anime({
          targets: card,
          rotateY: x * 12,
          rotateX: -y * 12,
          translateZ: 10,
          duration: 200,
          easing: 'easeOutCubic',
        });
      });

      card.addEventListener('mouseleave', () => {
        anime({
          targets: card,
          rotateY: 0,
          rotateX: 0,
          translateZ: 0,
          duration: 500,
          easing: 'easeOutElastic(1, 0.6)',
        });
      });
    });
  }

  // ─── 14. Cursor Trail (Stripe-inspired) ──────────────────
  function setupCursorTrail() {
    if (window.matchMedia('(hover: none)').matches) return;

    const trail = document.createElement('div');
    trail.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1.5px solid rgba(220, 47, 61, 0.3);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%) scale(1);
      transition: width 0.3s, height 0.3s, border-color 0.3s;
    `;
    document.body.appendChild(trail);

    document.addEventListener('mousemove', (e) => {
      anime({
        targets: trail,
        left: e.clientX + 'px',
        top: e.clientY + 'px',
        duration: 300,
        easing: 'easeOutCubic',
      });
    });

    document.querySelectorAll('a, button, .feat-card, .problem-card').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        trail.style.width = '40px';
        trail.style.height = '40px';
        trail.style.borderColor = 'rgba(220, 47, 61, 0.6)';
      });
      el.addEventListener('mouseleave', () => {
        trail.style.width = '20px';
        trail.style.height = '20px';
        trail.style.borderColor = 'rgba(220, 47, 61, 0.3)';
      });
    });
  }

  // ─── Initialize All ──────────────────────────────────────
  function init() {
    animateHeroEntrance();
    animateCardReveals();
    animateSectionHeadings();
    animateCounters();
    animateSVGPaths();
    animateFlowSteps();
    animateWhyList();
    animateVision();
    animateCTA();
    setupParallaxDepth();
    setupLogoInteraction();
    setupButtonEffects();
    setupCardTilt();
    setupCursorTrail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
