/**
 * The hand-off, measured.
 *
 * Three things have to be true for the exit to read as smooth, and none of
 * them are visible in a screenshot:
 *   1. The first viewport is still animating while the ground clears. If the
 *      reveals finish first, the loader uncovers a static page.
 *   2. Nothing moves sideways. The scroll lock is released mid-exit, and
 *      without a stable scrollbar gutter that slides the whole page.
 *   3. The sheet is never blank: the drawing leaves and the ground goes on
 *      overlapping timelines, not end to end.
 */
import { chromium } from 'playwright';

const b = await chromium.launch({
  channel: 'msedge',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

async function trial(label, { reduced = false, blockWebgl = false, vp = { width: 1512, height: 950 } } = {}) {
  const ctx = await b.newContext({
    viewport: vp,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  if (blockWebgl) {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = function () { return null; };
    });
  }

  await page.addInitScript(() => {
    window.__log = [];
    const stamp = (k) => window.__log.push([k, Math.round(performance.now())]);
    // This init script runs before the document exists, so nothing can be
    // observed yet; wait for the root element before wiring anything up.
    // Everything is stamped from MutationObservers and a fixed-interval
    // sampler, never from requestAnimationFrame: under software WebGL a frame
    // can take half a second, and a rAF sampler then reports three phases at
    // the same millisecond because it missed all of them.
    const wire = () => {
      const html = document.documentElement;
      const seen = {};
      const once = (k) => {
        if (seen[k]) return;
        seen[k] = 1;
        stamp(k);
      };
      new MutationObserver(() => {
        if (html.classList.contains('boot-out')) once('boot-out');
        if (seen['boot-out'] && !html.classList.contains('boot-lock')) once('unlock');
        if (seen['boot-out'] && !html.classList.contains('booting')) once('booting-off');
      }).observe(html, { attributes: true, attributeFilter: ['class'] });

      const watchBoot = () => {
        const el = document.getElementById('boot');
        if (!el) return false;
        const check = () => {
          if (el.classList.contains('is-leaving')) once('is-leaving');
          if (el.classList.contains('is-done')) {
            once('is-done');
            if (!seen.__snap) {
              seen.__snap = 1;
              const st = document.querySelector('.stage');
              const hero = document.querySelector('h1');
              window.__atClear = {
                stageOpacity: st ? getComputedStyle(st).opacity : null,
                planOpacity: getComputedStyle(el.querySelector('.boot__plan')).opacity,
                revealsInFlight: document.querySelectorAll('.rv:not(.is-in)').length,
                heroOpacity: hero ? getComputedStyle(hero).opacity : null,
                heroHasReveal: hero ? hero.classList.contains('rv') : null,
                heroIn: hero ? hero.classList.contains('is-in') : null,
              };
            }
          }
          if (el.hidden) once('hidden');
        };
        new MutationObserver(check).observe(el, { attributes: true, attributeFilter: ['class', 'hidden'] });
        check();
        return true;
      };
      if (!watchBoot()) document.addEventListener('DOMContentLoaded', watchBoot, { once: true });

      // Independent sampler: what the stage's opacity actually does over time.
      window.__stage = [];
      setInterval(() => {
        const st = document.querySelector('.stage');
        if (st && window.__stage.length < 400) {
          window.__stage.push([Math.round(performance.now()), Number(getComputedStyle(st).opacity).toFixed(2)]);
        }
      }, 60);
    };
    if (document.documentElement) wire();
    else document.addEventListener('readystatechange', wire, { once: true });
  });

  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'load' });

  // Horizontal position of a hero line while the loader still holds the
  // screen, and again well after the unlock. Measured after load, so the
  // stylesheet is applied both times and only a real reflow can move it.
  const xBefore = await page.evaluate(() => {
    const h = document.querySelector('h1');
    return h ? Math.round(h.getBoundingClientRect().left) : null;
  });

  let ok = true;
  try {
    await page.waitForFunction(
      () => { const el = document.getElementById('boot'); return !el || el.hidden; },
      { timeout: 15000 }
    );
  } catch { ok = false; }
  await page.waitForTimeout(900);

  const out = await page.evaluate(() => ({
    log: window.__log,
    atClear: window.__atClear,
    xAfter: (() => { const h = document.querySelector('h1'); return h ? Math.round(h.getBoundingClientRect().left) : null; })(),
    stageOpacityEnd: getComputedStyle(document.querySelector('.stage')).opacity,
    stage: window.__stage,
    locked: document.documentElement.classList.contains('boot-lock'),
    stillBooting: document.documentElement.classList.contains('booting'),
    revealsPending: document.querySelectorAll('.rv:not(.is-in)').length,
    webgl: document.documentElement.dataset.webgl,
  }));

  const t = Object.fromEntries(out.log);
  console.log(`\n── ${label} ${reduced ? '(reduced motion)' : ''}${blockWebgl ? '(no webgl)' : ''}`);
  console.log('   timeline ms:', out.log.map(([k, v]) => `${k}=${v}`).join('  '));
  if (t['is-done'] && t['is-leaving']) {
    console.log(`   overlap: drawing leaves ${t['is-done'] - t['is-leaving']}ms before the ground starts (needs > 0)`);
    console.log(`   ground fade window: ${t.hidden - t['is-done']}ms`);
  }
  console.log('   at the moment the ground starts:', JSON.stringify(out.atClear));
  if (t['boot-out'] && out.stage) {
    const ramp = out.stage.filter(([ms]) => ms >= t['boot-out'] - 120 && ms <= t['boot-out'] + 1400);
    console.log('   stage opacity through the hand-off:', ramp.map(([ms, o]) => `${ms - t['boot-out']}:${o}`).join(' '));
  }
  console.log(`   hero x: ${xBefore} -> ${out.xAfter}  ${xBefore === out.xAfter ? 'NO SHIFT' : '*** SHIFTED ***'}`);
  console.log(`   end: stageOpacity=${out.stageOpacityEnd} locked=${out.locked} booting=${out.stillBooting} revealsPending=${out.revealsPending} webgl=${out.webgl}`);
  console.log(`   dismissed=${ok} errors=${errs.length ? errs[0] : 'none'}`);
  await ctx.close();
}

await trial('normal');
// Same code path, a quarter of the pixels. If the hand-off is smooth here and
// stalls at full size, the stall is SwiftShader rasterising the scene on the
// CPU, not the transition.
await trial('normal-small', { vp: { width: 760, height: 520 } });
await trial('reduced', { reduced: true });
await trial('nowebgl', { blockWebgl: true });
await b.close();
