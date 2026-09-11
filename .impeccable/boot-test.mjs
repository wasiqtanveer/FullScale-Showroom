import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });

async function trial(label, { throttleMs = 0, blockWebgl = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1512, height: 950 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  if (blockWebgl) {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = function () { return null; };
    });
  }
  if (throttleMs) await page.route('**/three*.js', async (r) => { await new Promise((x) => setTimeout(x, throttleMs)); await r.continue(); });

  const t0 = Date.now();
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'domcontentloaded' });
  // Is the loader painted and reporting before anything else?
  const early = await page.evaluate(() => {
    const el = document.getElementById('boot');
    return el ? { visible: !el.hidden, pct: document.getElementById('boot-pct')?.textContent } : null;
  });
  await page.screenshot({ path: `.impeccable/review/boot-${label}.png` });

  let gone = null;
  try {
    await page.waitForFunction(() => { const el = document.getElementById('boot'); return !el || el.hidden; }, { timeout: 15000 });
    gone = Date.now() - t0;
  } catch { gone = 'NEVER DISMISSED'; }

  const after = await page.evaluate(() => ({
    locked: document.documentElement.classList.contains('boot-lock'),
    canScroll: document.documentElement.scrollHeight > window.innerHeight + 10,
    webgl: document.documentElement.dataset.webgl,
  }));
  console.log(`${label}: earlyVisible=${early?.visible} startPct=${early?.pct} dismissedAfter=${gone}ms locked=${after.locked} scrollable=${after.canScroll} webgl=${after.webgl} errors=${errs.length ? errs[0] : 'none'}`);
  await ctx.close();
}

await trial('normal');
await trial('slow', { throttleMs: 2500 });
await trial('nowebgl', { blockWebgl: true });
await b.close();
