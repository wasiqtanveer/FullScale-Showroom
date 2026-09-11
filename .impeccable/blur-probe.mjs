import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });

// How long after the hand-off class lands does the very first animated frame
// actually appear? Measured as the stage's opacity leaving zero.
async function probe(label, css) {
  const ctx = await b.newContext({ viewport: { width: 1512, height: 950 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__t = {};
    const wire = () => {
      new MutationObserver(() => {
        if (document.documentElement.classList.contains('boot-out') && !window.__t.out)
          window.__t.out = performance.now();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      setInterval(() => {
        const st = document.querySelector('.stage');
        if (st && window.__t.out && !window.__t.moved) {
          if (Number(getComputedStyle(st).opacity) > 0.02) window.__t.moved = performance.now();
        }
      }, 16);
    };
    if (document.documentElement) wire();
    else document.addEventListener('readystatechange', wire, { once: true });
  });
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'load' });
  if (css) await page.addStyleTag({ content: css });
  await page.waitForFunction(() => window.__t.moved, { timeout: 20000 }).catch(() => {});
  const t = await page.evaluate(() => window.__t);
  console.log(`${label.padEnd(26)} first animated frame ${t.moved && t.out ? Math.round(t.moved - t.out) + 'ms' : 'NEVER'} after hand-off`);
  await ctx.close();
}

await probe('as shipped', null);
await probe('reveal blur removed', '.rv { filter: none !important; } .rv.is-in { filter: none !important; }');
await probe('reveals not started', '');
await b.close();
