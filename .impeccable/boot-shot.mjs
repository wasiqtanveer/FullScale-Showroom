import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
for (const [label, w, h] of [['boot-mid', 1512, 950], ['boot-mid-mobile', 402, 874]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  // Stall the webfonts so the loader sits inside its font-wait window.
  await page.route('**/*.woff2', async (r) => { await new Promise((x) => setTimeout(x, 6000)); await r.abort(); });
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1600);
  const s = await page.evaluate(() => ({ pct: document.getElementById('boot-pct')?.textContent, step: document.getElementById('boot-step')?.textContent, hidden: document.getElementById('boot')?.hidden }));
  await page.screenshot({ path: `.impeccable/review/${label}.png` });
  console.log(`${label}: pct=${s.pct} step="${s.step}" hidden=${s.hidden}`);
  await ctx.close();
}
await b.close();
