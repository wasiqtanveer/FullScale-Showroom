import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.URL || 'http://127.0.0.1:5180/';
const OUT = '.impeccable/review';
mkdirSync(OUT, { recursive: true });

// Anchor-driven, not viewport multiples: this captures what a visitor actually
// lands on when they use the nav or the rail, which is what scroll-margin-top
// is tuned for. Fixed multiples drift as soon as a section height changes.
const shots = [
  { name: 'desktop', anchor: null },
  { name: 'desktop-lift', anchor: '#lift' },
  { name: 'desktop-living', anchor: '#living' },
  { name: 'desktop-dining', anchor: '#dining' },
  { name: 'desktop-rest', anchor: '#rest' },
  { name: 'desktop-work', anchor: '#work' },
  { name: 'desktop-sheet', anchor: '#collection' },
  { name: 'desktop-workshop', anchor: '#workshop' },
  { name: 'desktop-enquire', anchor: '#enquire' },
  { name: 'desktop-footer', anchor: 'END' },
];
const mobileShots = [
  { name: 'mobile', anchor: null },
  { name: 'mobile-living', anchor: '#living' },
  { name: 'mobile-sheet', anchor: '#collection' },
  { name: 'mobile-workshop', anchor: '#workshop' },
  { name: 'mobile-enquire', anchor: '#enquire' },
  { name: 'mobile-footer', anchor: 'END' },
];

const browser = await chromium.launch({
  channel: process.env.CHANNEL || 'msedge',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const errors = [];

async function run(list, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2800);

  for (const s of list) {
    await page.evaluate((a) => {
      if (!a) { window.scrollTo(0, 0); return; }
      if (a === 'END') { window.scrollTo(0, document.body.scrollHeight); return; }
      document.querySelector(a)?.scrollIntoView({ block: 'start' });
    }, s.anchor);
    await page.waitForTimeout(3400);
    await page.screenshot({ path: `${OUT}/${s.name}.png` });
    console.log(`captured ${s.name}`);
  }

  const audit = await page.evaluate(() => {
    const bad = [];
    // Does any heading sit under the fixed masthead at its own anchor?
    document.querySelectorAll('[data-station]').forEach((sec) => {
      sec.scrollIntoView({ block: 'start' });
      const h = sec.querySelector('h1, h2');
      if (!h) return;
      const r = h.getBoundingClientRect();
      const mast = document.querySelector('.masthead').getBoundingClientRect();
      if (r.top < mast.bottom - 2) bad.push(`${sec.id}: heading top ${Math.round(r.top)} < masthead bottom ${Math.round(mast.bottom)}`);
    });
    return {
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      headingsUnderMasthead: bad,
    };
  });
  console.log(`\n— audit @${width}x${height} —\n${JSON.stringify(audit, null, 1)}`);
  await ctx.close();
}

await run(shots, 1512, 950);
await run(mobileShots, 402, 874);
console.log(`\n— console errors —\n${errors.length ? [...new Set(errors)].join('\n') : 'none'}`);
await browser.close();
