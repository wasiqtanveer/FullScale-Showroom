import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/martian-mono/wdth.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { Showroom } from './scene/Showroom.js';
import { Annotations } from './annotate.js';
import { initMotion } from './motion.js';
import { COLLECTION } from './content.js';
import { createPreloader } from './preloader.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';

/* ── Collection index ──────────────────────────────────────────────────────
   Rendered from the same data the 3D plan is laid out from, so a dimension
   can never disagree with the drawing. */
function renderIndex() {
  const body = document.getElementById('index-body');
  if (!body) return;
  body.innerHTML = COLLECTION.map(
    (p) => `
      <tr>
        <td class="index__ref">${p.ref}</td>
        <th scope="row" class="index__name">${p.name}</th>
        <td class="index__room">${p.room}</td>
        <td class="index__dims">${p.dims}</td>
        <td class="index__mat">${p.material}</td>
        <td class="index__lead">${p.lead}</td>
      </tr>`
  ).join('');
}

/* ── Upholstery control ───────────────────────────────────────────────────
   A real radiogroup: arrow keys move between hides, and the choice changes the
   material on the sofa in the scene, not a swatch image. */
function initSwatches(showroom) {
  const group = document.getElementById('swatches');
  const live = document.getElementById('swatch-live');
  if (!group) return;
  const buttons = Array.from(group.querySelectorAll('.swatch'));

  const select = (btn, focus = false) => {
    buttons.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    const spec = showroom.setUpholstery(btn.dataset.swatch);
    if (live) live.textContent = spec.note;
    if (focus) btn.focus();
  };

  buttons.forEach((b, i) => {
    b.tabIndex = b.classList.contains('is-on') ? 0 : -1;
    b.addEventListener('click', () => select(b));
    b.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      select(buttons[(i + dir + buttons.length) % buttons.length], true);
    });
  });
}

/* ── Phone navigation ─────────────────────────────────────────────────────
   Below 820px the nav row has nowhere to live, so it becomes the sheet index.
   Escape closes it, focus returns to the button, and the page underneath is
   locked so a tap does not scroll the drawer away. */
function initDrawer() {
  const btn = document.getElementById('menubtn');
  const drawer = document.getElementById('drawer');
  if (!btn || !drawer) return;

  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) drawer.querySelector('a')?.focus();
  };

  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      btn.focus();
    }
  });
  // A resize past the breakpoint must not leave an orphaned overlay behind.
  window.matchMedia('(min-width: 820px)').addEventListener('change', (m) => {
    if (m.matches) setOpen(false);
  });
}

/* ── Enquiry form ─────────────────────────────────────────────────────────
   Validated client-side and honest about where it goes: there is no endpoint
   to submit to yet, and pretending otherwise would lose a real enquiry. */
function initForm() {
  const form = document.getElementById('enquire-form');
  if (!form) return;
  const status = document.getElementById('form-status');

  const showError = (field, message) => {
    const err = form.querySelector(`[data-err-for="${field.id}"]`);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message || '';
    return !message;
  };

  const validate = () => {
    let ok = true;
    const name = form.elements.name;
    const email = form.elements.email;
    const room = form.elements.room;
    ok = showError(name, name.value.trim() ? '' : 'We need a name to head the drawing with.') && ok;
    ok =
      showError(
        email,
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())
          ? ''
          : 'That address will not reach you — check it over.'
      ) && ok;
    ok =
      showError(
        room,
        room.value.trim().length >= 8 ? '' : 'Give us the width, the depth, and what the room is for.'
      ) && ok;
    return ok;
  };

  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('blur', () => {
      if (el.getAttribute('aria-invalid') === 'true') validate();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      status.textContent = 'Three things missing before we can draw anything.';
      status.dataset.tone = 'err';
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    status.dataset.tone = 'ok';
    status.textContent =
      'Not wired up yet — this mock has no endpoint, so nothing was sent. Point the form at your inbox and this message becomes the real confirmation.';
  });
}

/* ── Boot ─────────────────────────────────────────────────────────────── */
async function boot() {
  // The module has evaluated, which means Three is parsed — the single biggest
  // chunk of the wait is already behind us by the time this runs.
  const loader = createPreloader();
  loader.step('module');

  renderIndex();

  // The plan texture letters itself in Martian Mono, so the face has to be
  // resolved before the scene is built or every dimension on the sheet ships
  // in the browser's fallback monospace. Waiting here also means we never have
  // to redraw a 2016x1924 canvas after the page is already visible.
  try {
    await Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 3500)),
    ]);
  } catch {
    /* A font that never resolves is not a reason to withhold the page. */
  }
  loader.step('fonts');

  const canvas = document.getElementById('sheet');
  let showroom;
  try {
    showroom = new Showroom(canvas, { reducedMotion });
    loader.step('scene');
    // Compile the shaders while the loader still covers the canvas.
    showroom.prewarm();
    loader.step('shaders');
  } catch (err) {
    // No WebGL, or a driver that will not play. The page is fully readable
    // without the plan, so fall back rather than failing.
    document.documentElement.dataset.webgl = 'off';
    console.warn('Showroom plan unavailable, falling back to the flat sheet.', err);
    initDrawer();
    initForm();
    loader.fail('Plan unavailable');
    return;
  }

  document.documentElement.dataset.webgl = 'on';

  const annotations = new Annotations(document.getElementById('annos'), showroom);
  const { lenis, startReveals } = initMotion({ showroom, annotations, reducedMotion });

  // The first viewport enters on the same frame the loader begins to leave, so
  // the two motions overlap instead of running one after the other.
  loader.whenLeaving(startReveals);

  initSwatches(showroom);
  initDrawer();
  initForm();

  // Pointer parallax and the hand light, from a passive listener only.
  if (!reducedMotion) {
    window.addEventListener(
      'pointermove',
      (e) => {
        showroom.setPointer(
          (e.clientX / window.innerWidth) * 2 - 1,
          (e.clientY / window.innerHeight) * 2 - 1
        );
      },
      { passive: true }
    );
  }

  let last = performance.now();
  let running = true;

  let firstFrame = true;
  const frame = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    lenis?.raf(now);
    showroom.update(dt);
    annotations.update();
    if (firstFrame) {
      // 100% means a frame is on screen, not that a download finished.
      firstFrame = false;
      loader.step('frame');
      loader.done();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // Stop rendering entirely when the tab is hidden. A WebGL canvas quietly
  // drawing to a tab nobody is looking at is the cheapest perf win there is.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => showroom.resize(), 120);
  });

  document.documentElement.classList.add('is-ready');
}

// Any unhandled failure in boot must still release the loader; the failsafe
// inside it is the backstop, this is the direct path.
const start = () =>
  boot().catch((err) => {
    console.error('Boot failed.', err);
    document.getElementById('boot')?.remove();
    document.documentElement.classList.remove('boot-lock', 'booting', 'boot-out');
  });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
