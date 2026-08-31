/**
 * Pulse AI — Scroll Animations & Interactive Effects
 *
 * Uses IntersectionObserver for performant scroll-triggered animations.
 * Adds 3D tilt effects on mouse move for cards.
 */
(function () {
  'use strict';

  // ─── Scroll Reveal ───────────────────────────────────────
  // Elements get animated when they enter the viewport
  const revealSelectors = [
    // Sections: fade up
    { selector: '#problem .section-head', cls: 'anim-hidden' },
    { selector: '#problem .problem-grid', cls: 'anim-stagger' },

    { selector: '#solution .section-head', cls: 'anim-hidden' },
    { selector: '#solution .flow', cls: 'anim-hidden' },

    { selector: '#features .section-head', cls: 'anim-hidden' },
    { selector: '#features .feat-grid', cls: 'anim-stagger' },

    { selector: '#how .section-head', cls: 'anim-hidden' },
    { selector: '#how .steps', cls: 'anim-stagger' },

    { selector: '.why-grid > div:first-child', cls: 'anim-slide-left' },
    { selector: '.why-grid .why-visual', cls: 'anim-slide-right' },

    { selector: '#vision .vision-inner', cls: 'anim-scale' },

    { selector: '#roadmap .section-head', cls: 'anim-hidden' },
    { selector: '#roadmap .roadmap', cls: 'anim-stagger' },

    { selector: '#team .section-head', cls: 'anim-hidden' },
    { selector: '#team .team-grid', cls: 'anim-stagger' },

    { selector: '.final-cta .wrap', cls: 'anim-hidden' },

    // Individual cards for extra stagger
    { selector: '.problem-card', cls: 'anim-hidden' },
    { selector: '.feat-card', cls: 'anim-hidden' },
    { selector: '.road-card', cls: 'anim-hidden' },
    { selector: '.team-card', cls: 'anim-hidden' },
    { selector: '.why-item', cls: 'anim-hidden' },
    { selector: '.step', cls: 'anim-hidden' },
    { selector: '.flow-step', cls: 'anim-hidden' },
  ];

  function setupScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-visible');
            // Don't unobserve stagger parents — let children animate
            if (!entry.target.classList.contains('anim-stagger')) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealSelectors.forEach(({ selector, cls }) => {
      document.querySelectorAll(selector).forEach((el) => {
        // Don't add anim-hidden to already-visible elements (hero is animated via CSS)
        if (el.closest('.hero')) return;
        el.classList.add(cls);
        observer.observe(el);
      });
    });
  }

  // ─── 3D Tilt Effect on Cards ─────────────────────────────
  function setup3DTilt() {
    const cards = document.querySelectorAll('.feat-card, .problem-card, .team-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ─── Magnetic Cursor on CTA Buttons ──────────────────────
  function setupMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ─── Smooth Parallax on Hero Visual ──────────────────────
  function setupHeroParallax() {
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const rate = scrollY * 0.15;
      heroVisual.style.transform = `translateY(${rate}px)`;
    }, { passive: true });
  }

  // ─── Animate Number Counter (stats-like) ─────────────────
  function animateCounter(el, target, duration = 1200) {
    let start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // ─── SVG Path Drawing on Scroll ──────────────────────────
  function setupSVGDrawing() {
    const paths = document.querySelectorAll('.pg-path');
    paths.forEach((path) => {
      const length = path.getTotalLength ? path.getTotalLength() : 600;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)';
            path.style.strokeDashoffset = '0';
            observer.unobserve(path);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(path);
    });
  }

  // ─── Cursor Trail (subtle) ───────────────────────────────
  function setupCursorTrail() {
    // Only on desktop
    if (window.matchMedia('(hover: none)').matches) return;

    const trail = document.createElement('div');
    trail.style.cssText = `
      position: fixed;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1.5px solid rgba(220, 47, 61, 0.25);
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.15s ease-out, opacity 0.3s;
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    `;
    document.body.appendChild(trail);

    let visible = false;

    document.addEventListener('mousemove', (e) => {
      trail.style.left = e.clientX + 'px';
      trail.style.top = e.clientY + 'px';
      if (!visible) {
        visible = true;
        trail.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      visible = false;
      trail.style.opacity = '0';
    });

    // Enlarge on interactive elements
    const interactives = document.querySelectorAll('a, button, .feat-card, .problem-card, .team-card, .road-card');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        trail.style.transform = 'translate(-50%, -50%) scale(2.5)';
        trail.style.borderColor = 'rgba(220, 47, 61, 0.5)';
      });
      el.addEventListener('mouseleave', () => {
        trail.style.transform = 'translate(-50%, -50%) scale(1)';
        trail.style.borderColor = 'rgba(220, 47, 61, 0.25)';
      });
    });
  }

  // ─── Text Scramble Effect for Hero Heading ────────────────
  function setupTextScramble() {
    const heading = document.querySelector('.hero h1');
    if (!heading) return;

    const originalText = heading.innerHTML;
    // Only scramble the italic part
    const emMatch = originalText.match(/<em>(.*?)<\/em>/);
    if (!emMatch) return;

    const emText = emMatch[1];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let iterations = 0;
    const maxIterations = 15;

    const scrambleObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          scrambleObserver.unobserve(heading);
          runScramble();
        }
      },
      { threshold: 0.5 }
    );
    scrambleObserver.observe(heading);

    function runScramble() {
      const interval = setInterval(() => {
        const scrambled = emText
          .split('')
          .map((char, i) => {
            if (i < iterations) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        heading.innerHTML = originalText.replace(
          `<em>${emText}</em>`,
          `<em>${scrambled}</em>`
        );

        iterations += 1;
        if (iterations > emText.length) {
          clearInterval(interval);
          heading.innerHTML = originalText;
        }
      }, 40);
    }
  }

  // ─── 3D Perspective Scroll Effect ────────────────────────
  function setup3DPerspectiveScroll() {
    const sections = document.querySelectorAll('#problem, #solution, #features, #how, #vision, #roadmap, #team');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('perspective-enter');
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => {
      section.classList.add('perspective-section');
      observer.observe(section);
    });
  }

  // ─── 3D Mousemove Parallax on Hero ───────────────────────
  function setup3DHeroParallax() {
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    if (!hero || !heroVisual) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const panel = heroVisual.querySelector('.panel');
      if (panel) {
        panel.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 5}deg) translateZ(10px)`;
      }

      // Move orbit dots based on mouse
      const orbit = heroVisual.querySelector('.hero-orbit');
      if (orbit) {
        orbit.style.transform = `translate(calc(-50% + ${x * 20}px), calc(-50% + ${y * 20}px)) rotateX(60deg) rotateZ(0deg)`;
      }
    });

    hero.addEventListener('mouseleave', () => {
      const panel = heroVisual.querySelector('.panel');
      if (panel) panel.style.transform = '';
    });
  }

  // ─── 3D Card Depth on Scroll ─────────────────────────────
  function setup3DCardDepth() {
    const cards = document.querySelectorAll('.feat-card, .problem-card, .road-card');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          const depth = Math.sin(progress * Math.PI) * 15;
          card.style.transform = `translateZ(${depth}px)`;
        }
      });
    }, { passive: true });
  }

  // ─── 3D Floating Particles in Hero ───────────────────────
  function setup3DParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(220, 47, 61, ${Math.random() * 0.15 + 0.05});
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
        z-index: 0;
        animation: particle3D ${4 + Math.random() * 6}s ease-in-out infinite ${Math.random() * 4}s;
        transform-style: preserve-3d;
      `;
      hero.appendChild(particle);
    }

    // Inject particle keyframes
    if (!document.getElementById('particle3d-keyframes')) {
      const style = document.createElement('style');
      style.id = 'particle3d-keyframes';
      style.textContent = `
        @keyframes particle3D {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate3d(${15 + Math.random() * 20}px, -${20 + Math.random() * 30}px, ${10 + Math.random() * 20}px) scale(1.3);
            opacity: 0.6;
          }
          50% {
            transform: translate3d(-${10 + Math.random() * 15}px, ${10 + Math.random() * 20}px, -${5 + Math.random() * 15}px) scale(0.8);
            opacity: 0.4;
          }
          75% {
            transform: translate3d(${5 + Math.random() * 10}px, -${5 + Math.random() * 10}px, ${15 + Math.random() * 10}px) scale(1.1);
            opacity: 0.5;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ─── 3D Logo Interactive Spin ────────────────────────────
  function setup3DLogoSpin() {
    const logos = document.querySelectorAll('.logo');
    logos.forEach((logo) => {
      logo.addEventListener('mouseenter', () => {
        const mark = logo.querySelector('.logo-mark');
        if (mark) mark.style.transform = 'rotateY(180deg)';
      });
      logo.addEventListener('mouseleave', () => {
        const mark = logo.querySelector('.logo-mark');
        if (mark) mark.style.transform = '';
      });
    });
  }

  // ─── Initialize All ──────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    setupScrollReveal();
    setup3DTilt();
    setupMagneticButtons();
    setupHeroParallax();
    setupSVGDrawing();
    setupCursorTrail();
    setupTextScramble();
    setup3DPerspectiveScroll();
    setup3DHeroParallax();
    setup3DCardDepth();
    setup3DParticles();
    setup3DLogoSpin();
  }
})();
