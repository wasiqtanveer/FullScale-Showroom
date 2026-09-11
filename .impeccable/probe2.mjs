import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: 402, height: 874 } })).newPage();
await p.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => {
  const secs = [...document.querySelectorAll('[data-station]')];
  secs.forEach((s) => (s.style.display = 'none'));
  const res = {};
  secs.forEach((s) => {
    s.style.display = '';
    res[s.id] = document.documentElement.scrollWidth;
    s.style.display = 'none';
  });
  secs.forEach((s) => (s.style.display = ''));
  return res;
}), null, 1));
await b.close();
