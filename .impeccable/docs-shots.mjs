/**
 * The screenshots used in README.md.
 *
 * Deliberately a separate, curated list from capture.mjs: that one photographs
 * every station for review, this one picks the few views that explain what the
 * page is to someone who has never seen it. It also waits for the preloader's
 * hand-off to finish rather than a fixed delay, because the loader's timing is
 * tuned and any fixed wait goes stale the moment it changes.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.URL || 'http://127.0.0.1:5180/';
// PNGs land here (gitignored), then get re-encoded into docs/img as JPEGs for
// the README — 4.5 MB of PNG does not belong in a repository:
//   for f in docs/shots/*.png; do n=$(basename "$f" .png); //     ffmpeg -y -i "$f" -vf "scale='min(1400,iw)':-2:flags=lanczos" -q:v 3 "docs/img/$n.jpg"; done
const OUT = 'docs/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  channel: 'msedge',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

const errors = [];

async function shoot(list, width, height, label) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });

  // Wait for the loader to actually go, then for the scene to settle.
  await page.waitForFunction(() => { const b = document.getElementById('boot'); return !b || b.hidden; }, { timeout: 30000 });
  await page.waitForTimeout(2600);

  for (const s of list) {
    await page.evaluate((a) => {
      if (!a) return window.scrollTo(0, 0);
      if (a === 'END') return window.scrollTo(0, document.body.scrollHeight);
      document.querySelector(a)?.scrollIntoView({ block: 'start' });
    }, s.anchor);
    // The camera scrubs with the scroll and is critically damped, so it needs
    // time to arrive before the frame is worth keeping.
    await page.waitForTimeout(3600);
    await page.screenshot({ path: `${OUT}/${s.name}.png` });
    console.log(`  ${label}: ${s.name}`);
  }
  await ctx.close();
}

await shoot(
  [
    { name: 'hero', anchor: null },
    { name: 'plan', anchor: '#lift' },
    { name: 'living', anchor: '#living' },
    { name: 'rest', anchor: '#rest' },
    { name: 'collection', anchor: '#collection' },
    { name: 'workshop', anchor: '#workshop' },
  ],
  1440,
  900,
  'desktop'
);

await shoot(
  [
    { name: 'mobile-hero', anchor: null },
    { name: 'mobile-living', anchor: '#living' },
  ],
  402,
  874,
  'mobile'
);

// No preloader shot. It cannot be photographed honestly: the stage label and
// the figure are written to the DOM immediately, while the linework and the
// fill bar are CSS transitions that lag by design — so every screenshot of it
// shows a finished figure over an unfinished drawing, the exact contradiction
// the loader exists to avoid. It is a thing to watch live.

console.log(`\nconsole errors: ${errors.length ? [...new Set(errors)].join(' | ') : 'none'}`);
await browser.close();
