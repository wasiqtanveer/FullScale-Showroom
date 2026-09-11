import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { STATION_ORDER, SHEET_LABEL } from './content.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * One authored moment, orchestrated.
 *
 * The page has exactly one motion idea: a camera walking a plan, with the
 * drawing's annotations catching up to it. Everything else here serves that —
 * the reveals are the same exponential ease-out at three delays, not a
 * different entrance per section.
 */
export function initMotion({ showroom, annotations, reducedMotion, onStation }) {
  const sections = Array.from(document.querySelectorAll('[data-station]'));
  const railLinks = Array.from(document.querySelectorAll('[data-rail]'));
  const sheetNo = document.getElementById('sheet-no');
  let current = 'threshold';

  const setStation = (key) => {
    if (current === key) return;
    current = key;
    annotations.setStation(key);
    document.documentElement.dataset.station = key;
    if (sheetNo) sheetNo.textContent = SHEET_LABEL[key] || '01';
    railLinks.forEach((a) => {
      const on = a.dataset.rail === key;
      a.classList.toggle('is-on', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    onStation?.(key);
  };

  // ── Reveals.
  //
  //    Deliberately NOT ScrollTrigger. The copy panels are position: sticky,
  //    and a sticky trigger's start position is measured wrong often enough
  //    that panels were being set to opacity 0 and never animated back. An
  //    IntersectionObserver cannot get that wrong, costs nothing, and fails
  //    in the safe direction: the hidden state is applied by script, so a
  //    script that never runs leaves every word on the page visible.
  //    They are also not observed until the caller says so. The loader holds
  //    the screen for well over a second, and starting the entrances behind it
  //    spent all of them on a covered page — the hand-off then uncovered a
  //    first viewport that had already finished moving.
  const reveals = Array.from(document.querySelectorAll('[data-reveal]'));
  let startReveals = () => {};
  if (!reducedMotion) {
    // A container staggers its children; anything holding words of its own
    // animates as one piece. Splitting on child count alone was wrong and
    // silently so: the headline is "A room is a<br><em>drawing</em> you<br>
    // live inside", three element children, so the entrance was applied to
    // two line breaks and one word while the headline itself never moved.
    const isGroup = (el) =>
      el.children.length > 1 &&
      Array.from(el.childNodes).every(
        (n) => n.nodeType === 1 || (n.nodeType === 3 && !n.textContent.trim())
      );

    const groups = reveals.map((el) => {
      const kids = isGroup(el) ? Array.from(el.children) : [el];
      kids.forEach((k, i) => {
        k.classList.add('rv');
        k.style.setProperty('--rv-d', `${i * 70}ms`);
      });
      return { el, kids };
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const group = groups.find((g) => g.el === entry.target);
          group?.kids.forEach((k) => k.classList.add('is-in'));
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -14% 0px', threshold: 0.04 }
    );
    startReveals = () => groups.forEach((g) => io.observe(g.el));
  }

  // ── Station tracking.
  //
  //    Two triggers per section, with strictly separate jobs. Letting the
  //    camera trigger also set the active station is what made the rail read
  //    one room ahead of the one on screen: a section that has merely peeked
  //    over the fold is not the station you are standing in.
  sections.forEach((section, i) => {
    const key = section.dataset.station;
    const prev = STATION_ORDER[Math.max(0, i - 1)];

    // Camera: the walk completes before the section reaches the middle of the
    // screen, then holds for the whole time the panel is readable.
    ScrollTrigger.create({
      trigger: section,
      start: 'top 88%',
      end: 'top 34%',
      scrub: true,
      onUpdate: (self) => showroom.goTo(prev, key, self.progress),
      onLeave: () => showroom.goTo(prev, key, 1),
    });

    // Station identity: only while the section actually owns the viewport.
    ScrollTrigger.create({
      trigger: section,
      start: 'top 52%',
      end: 'bottom 48%',
      onToggle: (self) => {
        if (self.isActive) setStation(key);
      },
    });
  });

  // ── Smooth scroll. Skipped entirely under reduced motion: hijacking a
  //    visitor's scroll when they have asked for less movement is the exact
  //    thing the preference is about.
  let lenis = null;
  if (!reducedMotion) {
    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
    });
    // Lenis drives the real window scroll, so ScrollTrigger needs no proxy —
    // it only needs telling when a frame moved. Lenis itself is ticked from
    // the render loop in main.js, so the page has exactly one rAF.
    lenis.on('scroll', ScrollTrigger.update);
  }

  // Failsafe: anything already scrolled past that somehow never received its
  // reveal is shown outright. A page that hides its own content on a script
  // hiccup is broken in the one way a visitor cannot work around.
  setTimeout(() => {
    document.querySelectorAll('.rv:not(.is-in)').forEach((k) => {
      if (k.getBoundingClientRect().top < window.innerHeight) k.classList.add('is-in');
    });
  }, 3200);

  // In-page links go through Lenis so the plan walks there rather than cutting.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.5 });
      else target.scrollIntoView({ behavior: 'auto', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  setStation('threshold');
  annotations.setStation('threshold');

  return { startReveals, lenis, refresh: () => ScrollTrigger.refresh() };
}
