import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: 402, height: 874 } })).newPage();
await p.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > window.innerWidth + 1) {
      let inScroller = false;
      for (let n = el.parentElement; n; n = n.parentElement) {
        if (getComputedStyle(n).overflowX === 'auto' || getComputedStyle(n).overflowX === 'scroll') { inScroller = true; break; }
      }
      if (!inScroller) out.push({ t: el.tagName.toLowerCase(), c: (el.className||'').toString().slice(0,34), right: Math.round(r.right), w: Math.round(r.width) });
    }
  });
  return { innerW: window.innerWidth, scrollW: document.documentElement.scrollWidth, offenders: out.slice(0, 12) };
}), null, 1));
await b.close();
