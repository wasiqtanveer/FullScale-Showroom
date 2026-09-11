/**
 * The preloader.
 *
 * Its job is the dead time between first paint and a showroom that can be
 * looked at: Three.js parsing, the plan texture being drawn onto a canvas, the
 * scene being assembled, and — the part that actually stutters — the GPU
 * compiling the scene's shaders on first render.
 *
 * Two rules it follows.
 *
 * 1. Progress is measured, not performed. Each entry in STAGES is a real
 *    milestone reported by main.js as it passes it. There is no timer pretending
 *    to be a download, and the figure never reaches 100 until a frame has
 *    actually been drawn.
 * 2. It leaves by handing over, not by uncovering. The loader's ground is
 *    the page's own background colour, so the exit is a dissolve in place
 *    while the first viewport lights and animates in underneath it. A reveal
 *    onto a page that has already finished moving reads as a shutter; the two
 *    have to overlap.
 * 3. It can always be escaped. A thrown error, a missing WebGL context, a font
 *    that never resolves — any of them still dismiss the loader, and a hard
 *    failsafe dismisses it even if nothing reports at all. A visitor stuck
 *    behind a loading screen has no way out; that is the one failure mode worth
 *    engineering against.
 */

const STAGES = {
  boot: { p: 0.08, label: 'Setting out the sheet' },
  module: { p: 0.22, label: 'Squaring the drawing' },
  fonts: { p: 0.36, label: 'Lettering the dimensions' },
  scene: { p: 0.64, label: 'Placing the furniture' },
  shaders: { p: 0.88, label: 'Lighting the room' },
  // Stops just short of 100 on purpose: the figure reaching 100 is what
  // release() does, at the same moment the sheet lifts. Letting a milestone
  // claim 100 while the drawing is still stroking in is the small dishonesty
  // that makes every loading screen feel fake.
  frame: { p: 0.96, label: 'Ready' },
};

const FAILSAFE_MS = 9000;

/**
 * A deliberate floor, not padding disguised as work. On a warm cache the real
 * milestones can all land inside a few hundred milliseconds, and the sheet
 * flashes past before it has finished drawing itself. This holds the opening
 * beat long enough to read — and it is skipped entirely under reduced motion,
 * because holding someone who asked for less movement is just a delay.
 */
const MIN_VISIBLE_MS = 1900;

/**
 * Exit choreography, in milliseconds.
 *
 * HOLD  — one beat on the completed drawing, so the figure reaching 100 is
 *         seen rather than inferred.
 * CLEAR — from the drawing starting to leave to the ground starting to go.
 *         Short enough that the two overlap: the sheet is never blank.
 * GONE  — belt and braces for the ground's own fade, in case transitionend
 *         never arrives. Comfortably longer than the 720ms fade: set tight to
 *         it, a main thread busy with the first frames of the render loop
 *         delays the transition and the backstop truncates it instead of
 *         catching a failure. The loader is already pointer-events: none by
 *         then, so a late removal costs nothing.
 */
const HOLD_MS = 320;
const CLEAR_MS = 380;
const GONE_MS = 1500;

export function createPreloader() {
  const root = document.getElementById('boot');
  if (!root) return { step: () => {}, fail: () => {}, done: () => {}, whenLeaving: (fn) => fn() };

  const pctEl = document.getElementById('boot-pct');
  const stepEl = document.getElementById('boot-step');
  const plan = root.querySelector('.boot__plan');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 'booting' says the loader exists, and is what holds the sheet back; the
  // page is responsible for showing the sheet outright the moment it is gone.
  document.documentElement.classList.add('boot-lock', 'booting');

  const openedAt = performance.now();
  let target = 0;
  let shown = 0;
  let finished = false;
  let raf = 0;
  let leaving = false;
  // Whatever the page wants to start on the same frame the hand-off does —
  // the first viewport's own entrance. Registered late, so anything that
  // arrives after the loader has already gone runs immediately.
  const onLeaving = [];
  const whenLeaving = (fn) => {
    if (leaving) fn();
    else onLeaving.push(fn);
  };

  // The label is derived from the figure on screen, never from the milestone
  // that has just been reported. Those diverge badly on a fast load — the last
  // stage fires within 100 ms while the eased figure is still at 18 — and a
  // loader reading 'Ready' beside '18%' is the exact thing that makes a
  // progress indicator feel invented.
  const labelFor = (p) => {
    let label = STAGES.boot.label;
    Object.values(STAGES).forEach((s) => {
      if (p >= s.p - 0.001) label = s.label;
    });
    return label;
  };

  let lastPaint = performance.now();
  const paint = (now = performance.now()) => {
    // Time-based, not per-frame. The main thread is genuinely blocked while the
    // scene is assembled and the shaders compile, so only a handful of frames
    // run; a per-frame lerp leaves the figure stuck far behind the truth for
    // exactly as long as the work takes.
    // Clamped at BOTH ends. The upper clamp stops a long stall from jumping
    // the figure; the lower one is not theoretical — `now` arrives from the
    // rAF timestamp on some calls and from performance.now() on others, and a
    // single negative dt inverts the easing factor and drives the figure away
    // from its target. It displayed "-36%" before this clamp existed.
    const dt = Math.max(0, Math.min(0.25, (now - lastPaint) / 1000));
    lastPaint = now;
    shown += (target - shown) * (reduced ? 1 : 1 - Math.exp(-dt * 5.5));
    if (Math.abs(target - shown) < 0.002) shown = target;
    // Belt and braces: whatever the arithmetic does, the figure on screen is
    // a percentage and must stay inside one.
    shown = Math.min(1, Math.max(0, shown));
    root.style.setProperty('--p', shown.toFixed(4));
    if (plan) plan.style.setProperty('--p', shown.toFixed(4));
    if (pctEl) pctEl.textContent = String(Math.round(shown * 100));
    if (stepEl) stepEl.textContent = labelFor(shown);
    if (shown !== target) raf = requestAnimationFrame(paint);
    else raf = 0;
  };

  const nudge = () => {
    if (raf) return;
    lastPaint = performance.now();
    raf = requestAnimationFrame(paint);
  };

  const step = (key) => {
    if (finished) return;
    const stage = STAGES[key];
    if (!stage) return;
    // Monotonic: a milestone reported out of order never walks the figure back.
    target = Math.max(target, stage.p);
    nudge();
  };

  const release = () => {
    if (finished) return;

    // Serve out the minimum before finishing, but keep drawing while we wait:
    // the figure and the linework carry on to 100, so the hold is spent on the
    // drawing completing rather than on a frozen screen.
    const waited = performance.now() - openedAt;
    if (!reduced && waited < MIN_VISIBLE_MS) {
      target = Math.max(target, 0.96);
      nudge();
      setTimeout(release, MIN_VISIBLE_MS - waited);
      return;
    }

    finished = true;
    cancelAnimationFrame(raf);
    target = 1;
    shown = 1;
    root.style.setProperty('--p', '1');
    if (plan) plan.style.setProperty('--p', '1');
    if (pctEl) pctEl.textContent = '100';
    if (stepEl) stepEl.textContent = 'Ready';

    const hide = () => {
      root.hidden = true;
      root.style.willChange = 'auto';
      document.documentElement.classList.remove('booting', 'boot-out');
    };

    // Phase two: the ground dissolves. Its colour is the page background, so
    // there is no seam — what the visitor sees is the room's light arriving.
    const clear = () => {
      root.classList.add('is-done');
      if (reduced) {
        hide();
        return;
      }
      // Only the ground's own fade ends the loader. transitionend bubbles, so
      // an unfiltered listener here was being fired by the drawing's fade
      // finishing inside it — which hid the ground 457ms into its 720ms fade,
      // popping it from roughly 40% opacity straight to nothing. That pop was
      // the whole reason the hand-off read as a cut.
      root.addEventListener('transitionend', function onEnd(e) {
        if (e.target !== root || e.propertyName !== 'opacity') return;
        root.removeEventListener('transitionend', onEnd);
        hide();
      });
      // transitionend never fires if something display:none's the element
      // first, and a loader left in the tree eats every click under it.
      setTimeout(hide, GONE_MS);
    };

    // Phase one: the drawing comes off the sheet, the page is unlocked, and
    // everything the page wanted to start on this frame starts now.
    const leave = () => {
      leaving = true;
      root.classList.add('is-leaving');
      const html = document.documentElement;
      html.classList.add('boot-out');
      // Safe to unlock here rather than at the end: the scrollbar gutter is
      // stable, so nothing reflows, and the page is interactive for the whole
      // exit instead of for the moment after it.
      html.classList.remove('boot-lock');
      onLeaving.splice(0).forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.warn('Hand-off hook failed.', err);
        }
      });
      if (reduced) clear();
      else setTimeout(clear, CLEAR_MS);
    };

    if (reduced) leave();
    else setTimeout(leave, HOLD_MS);
  };

  const fail = (message) => {
    if (stepEl && message) stepEl.textContent = message;
    release();
  };

  // Nothing reported for nine seconds means something we did not anticipate
  // went wrong. Show the page regardless — it reads without the plan.
  const failsafe = setTimeout(() => fail('Ready'), FAILSAFE_MS);

  const done = () => {
    clearTimeout(failsafe);
    release();
  };

  step('boot');
  return { step, fail, done, whenLeaving };
}
