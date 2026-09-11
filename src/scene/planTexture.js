import { CanvasTexture, SRGBColorSpace, LinearFilter } from 'three';

export const PLAN = {
  w: 14,
  d: 13,
  ppm: 148, // pixels per metre on the sheet
  rooms: [
    { key: 'living', no: '01', name: 'LIVING', x0: 0.6, z0: 0.6, x1: 7.4, z1: 6.4 },
    { key: 'dining', no: '02', name: 'DINING', x0: 7.9, z0: 0.6, x1: 13.4, z1: 5.4 },
    { key: 'rest', no: '03', name: 'REST', x0: 0.6, z0: 6.9, x1: 6.4, z1: 12.4 },
    { key: 'work', no: '04', name: 'WORK', x0: 6.9, z0: 5.9, x1: 13.4, z1: 12.4 },
  ],
  /** Plan symbols: the drawn outline each real piece sits on top of. */
  symbols: [
    { room: 'living', x: 3.6, z: 2.0, w: 2.18, d: 0.94, label: 'S-01' },
    { room: 'living', x: 6.2, z: 4.4, w: 0.9, d: 0.88, label: 'A-02', rot: -0.5 },
    { room: 'living', x: 3.6, z: 3.6, w: 1.1, d: 0.6, label: 'T-03' },
    { room: 'dining', x: 10.65, z: 3.0, w: 2.4, d: 0.95, label: 'D-04' },
    { room: 'rest', x: 3.2, z: 9.6, w: 1.62, d: 2.05, label: 'B-05' },
    { room: 'rest', x: 4.55, z: 8.45, w: 0.45, d: 0.42, label: 'N-06' },
    { room: 'work', x: 10.2, z: 9.4, w: 1.6, d: 0.7, label: 'W-07' },
    { room: 'work', x: 12.55, z: 9.4, w: 0.34, d: 1.8, label: 'L-08' },
  ],
  /** The circulation path: how a visitor actually moves through the sheet. */
  walk: [
    [3.6, 5.6],
    [3.6, 3.4],
    [7.0, 2.4],
    [10.65, 4.4],
    [8.6, 6.6],
    [3.9, 7.6],
    [3.2, 11.4],
    [7.6, 11.6],
    [10.2, 10.9],
  ],
};

const INK = '#f2e7d3';
const INK_SOFT = 'rgba(242,231,211,0.42)';
const INK_FAINT = 'rgba(242,231,211,0.22)';
// A shade up from the page ground: at #372619 the hatching disappeared under
// the evening light, and the sheet stopped reading as a drawing at all.
const GROUND = '#402d1f';
const HATCH = 'rgba(242,231,211,0.115)';
const LIVE = '#8fb0a0';

const px = (m) => m * PLAN.ppm;

function mono(g, size, weight = 400, tracking = 0) {
  g.font = `${weight} ${size}px "Martian Mono Variable", ui-monospace, monospace`;
  g.letterSpacing = `${tracking}px`;
}

/** Dashed leader with tick ends and a measurement, the way a sheet states a size. */
function dimension(g, x0, y0, x1, y1, text) {
  const vertical = Math.abs(x1 - x0) < 1;
  g.save();
  g.strokeStyle = INK_SOFT;
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.stroke();

  // Slashed terminators, not arrowheads: this is a drafted sheet.
  const t = 7;
  g.beginPath();
  if (vertical) {
    g.moveTo(x0 - t, y0 + t);
    g.lineTo(x0 + t, y0 - t);
    g.moveTo(x1 - t, y1 + t);
    g.lineTo(x1 + t, y1 - t);
  } else {
    g.moveTo(x0 + t, y0 - t);
    g.lineTo(x0 - t, y0 + t);
    g.moveTo(x1 + t, y1 - t);
    g.lineTo(x1 - t, y1 + t);
  }
  g.stroke();

  mono(g, 19, 500, 1.4);
  g.fillStyle = INK_SOFT;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const w = g.measureText(text).width;
  if (vertical) {
    g.translate(mx, my);
    g.rotate(-Math.PI / 2);
    g.fillStyle = GROUND;
    g.fillRect(-w / 2 - 8, -12, w + 16, 24);
    g.fillStyle = INK_SOFT;
    g.fillText(text, 0, 1);
  } else {
    g.fillStyle = GROUND;
    g.fillRect(mx - w / 2 - 8, my - 12, w + 16, 24);
    g.fillStyle = INK_SOFT;
    g.fillText(text, mx, my + 1);
  }
  g.restore();
}

function hatchRoom(g, r) {
  const x = px(r.x0);
  const y = px(r.z0);
  const w = px(r.x1 - r.x0);
  const h = px(r.z1 - r.z0);
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.strokeStyle = HATCH;
  g.lineWidth = 1.4;
  const step = 26;
  for (let i = -h; i < w + h; i += step) {
    g.beginPath();
    g.moveTo(x + i, y);
    g.lineTo(x + i + h, y + h);
    g.stroke();
  }
  g.restore();
}

export function buildPlanCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(px(PLAN.w));
  canvas.height = Math.round(px(PLAN.d));
  const g = canvas.getContext('2d');

  g.fillStyle = GROUND;
  g.fillRect(0, 0, canvas.width, canvas.height);

  // ── Metre grid: ticks at intersections rather than a full ruled grid, so the
  //    sheet reads as a drawing and not as graph paper.
  g.strokeStyle = INK_FAINT;
  g.lineWidth = 1.2;
  for (let mx = 1; mx < PLAN.w; mx += 1) {
    for (let mz = 1; mz < PLAN.d; mz += 1) {
      const x = px(mx);
      const y = px(mz);
      g.beginPath();
      g.moveTo(x - 5, y);
      g.lineTo(x + 5, y);
      g.moveTo(x, y - 5);
      g.lineTo(x, y + 5);
      g.stroke();
    }
  }

  // ── Rooms
  PLAN.rooms.forEach((r) => {
    hatchRoom(g, r);

    const x = px(r.x0);
    const y = px(r.z0);
    const w = px(r.x1 - r.x0);
    const h = px(r.z1 - r.z0);

    g.strokeStyle = INK;
    g.lineWidth = 5;
    g.strokeRect(x, y, w, h);

    // Doorway gaps on the circulation side, drawn as a broken wall with a swing.
    g.strokeStyle = GROUND;
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(x + w * 0.42, y + h);
    g.lineTo(x + w * 0.42 + px(0.9), y + h);
    g.stroke();
    g.strokeStyle = INK_SOFT;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x + w * 0.42, y + h, px(0.9), -Math.PI / 2, 0);
    g.stroke();

    // Room label: number set large in a rule box, name tracked beside it.
    const lx = x + 26;
    const ly = y + 30;
    mono(g, 46, 700, 2);
    g.fillStyle = INK;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillText(r.no, lx, ly);
    const nw = g.measureText(r.no).width;
    mono(g, 21, 500, 7);
    g.fillStyle = INK_SOFT;
    g.fillText(r.name, lx + nw + 18, ly + 16);
    g.strokeStyle = INK_SOFT;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(lx, ly + 58);
    g.lineTo(lx + nw + 18 + g.measureText(r.name).width + 7 * r.name.length, ly + 58);
    g.stroke();

    // Overall dimensions on two sides.
    dimension(g, x, y - 34, x + w, y - 34, `${Math.round((r.x1 - r.x0) * 1000)}`);
    dimension(g, x - 34, y, x - 34, y + h, `${Math.round((r.z1 - r.z0) * 1000)}`);
  });

  // ── Furniture plan symbols, with their reference codes.
  PLAN.symbols.forEach((s) => {
    g.save();
    g.translate(px(s.x), px(s.z));
    if (s.rot) g.rotate(s.rot);
    const w = px(s.w);
    const h = px(s.d);
    g.strokeStyle = INK_SOFT;
    g.lineWidth = 2.4;
    g.setLineDash([10, 7]);
    g.strokeRect(-w / 2, -h / 2, w, h);
    g.setLineDash([]);
    // Centre cross: where the piece is set out from.
    g.strokeStyle = INK_FAINT;
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(-10, 0);
    g.lineTo(10, 0);
    g.moveTo(0, -10);
    g.lineTo(0, 10);
    g.stroke();
    mono(g, 17, 600, 2);
    g.fillStyle = INK_SOFT;
    g.textAlign = 'left';
    g.textBaseline = 'bottom';
    g.fillText(s.label, -w / 2 + 4, -h / 2 - 8);
    g.restore();
  });

  // ── Circulation: the dotted walk, drawn in the revision colour because it is
  //    the one line on the sheet that describes a person and not a thing.
  g.save();
  g.strokeStyle = LIVE;
  g.globalAlpha = 0.55;
  g.lineWidth = 3;
  g.setLineDash([3, 13]);
  g.lineCap = 'round';
  g.beginPath();
  const w0 = PLAN.walk[0];
  g.moveTo(px(w0[0]), px(w0[1]));
  for (let i = 1; i < PLAN.walk.length; i += 1) {
    const prev = PLAN.walk[i - 1];
    const cur = PLAN.walk[i];
    const cx = (px(prev[0]) + px(cur[0])) / 2;
    const cy = (px(prev[1]) + px(cur[1])) / 2;
    g.quadraticCurveTo(px(prev[0]), px(prev[1]), cx, cy);
  }
  const last = PLAN.walk[PLAN.walk.length - 1];
  g.lineTo(px(last[0]), px(last[1]));
  g.stroke();
  g.setLineDash([]);

  // Station markers sit on the walk: a circled number, as on any drawing.
  PLAN.rooms.forEach((r, i) => {
    const p = PLAN.walk[[1, 3, 6, 8][i]];
    const x = px(p[0]);
    const y = px(p[1]);
    g.globalAlpha = 1;
    g.fillStyle = GROUND;
    g.beginPath();
    g.arc(x, y, 22, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = LIVE;
    g.lineWidth = 2.6;
    g.stroke();
    mono(g, 20, 700, 1);
    g.fillStyle = LIVE;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(r.no, x, y + 1);
  });
  g.restore();

  // ── North arrow
  g.save();
  g.translate(px(PLAN.w) - 120, 120);
  g.strokeStyle = INK_SOFT;
  g.lineWidth = 2.2;
  g.beginPath();
  g.arc(0, 0, 44, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(0, 30);
  g.lineTo(0, -34);
  g.moveTo(-11, -20);
  g.lineTo(0, -34);
  g.lineTo(11, -20);
  g.stroke();
  mono(g, 20, 700, 2);
  g.fillStyle = INK;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('N', 0, 48);
  g.restore();

  // ── Scale bar, in metres, because everything here is stated at full scale.
  g.save();
  g.translate(px(PLAN.w) - 120 - px(4), px(PLAN.d) - 96);
  g.strokeStyle = INK_SOFT;
  g.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    g.fillStyle = i % 2 ? GROUND : INK_SOFT;
    g.fillRect(px(i), 0, px(1), 14);
    g.strokeRect(px(i), 0, px(1), 14);
  }
  mono(g, 18, 500, 2);
  g.fillStyle = INK_SOFT;
  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.fillText('0', 0, 22);
  g.fillText('4 m', px(4) - 6, 22);
  g.restore();

  // ── Titleblock, bottom-left of the sheet
  g.save();
  const tbW = px(3.9);
  const tbH = px(1.24);
  const tbX = 46;
  const tbY = px(PLAN.d) - tbH - 46;
  g.fillStyle = 'rgba(30,21,16,0.72)';
  g.fillRect(tbX, tbY, tbW, tbH);
  g.strokeStyle = INK_SOFT;
  g.lineWidth = 3;
  g.strokeRect(tbX, tbY, tbW, tbH);
  g.beginPath();
  g.moveTo(tbX, tbY + 62);
  g.lineTo(tbX + tbW, tbY + 62);
  g.moveTo(tbX + tbW * 0.56, tbY + 62);
  g.lineTo(tbX + tbW * 0.56, tbY + tbH);
  g.lineWidth = 1.6;
  g.stroke();

  mono(g, 30, 700, 8);
  g.fillStyle = INK;
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText('FULL SCALE', tbX + 20, tbY + 32);

  const rows = [
    ['SHEET', '01 / 01'],
    ['SCALE', '1:1'],
    ['REV', 'C'],
  ];
  const rows2 = [
    ['DRAWN', 'WORKSHOP'],
    ['ROOMS', '04'],
    ['PIECES', '11'],
  ];
  mono(g, 16, 500, 3);
  rows.forEach((r, i) => {
    g.fillStyle = 'rgba(242,231,211,0.38)';
    g.fillText(r[0], tbX + 20, tbY + 92 + i * 30);
    g.fillStyle = INK_SOFT;
    g.fillText(r[1], tbX + 130, tbY + 92 + i * 30);
  });
  rows2.forEach((r, i) => {
    g.fillStyle = 'rgba(242,231,211,0.38)';
    g.fillText(r[0], tbX + tbW * 0.56 + 20, tbY + 92 + i * 30);
    g.fillStyle = INK_SOFT;
    g.fillText(r[1], tbX + tbW * 0.56 + 140, tbY + 92 + i * 30);
  });
  g.restore();

  return canvas;
}

export function buildPlanTexture() {
  const tex = new CanvasTexture(buildPlanCanvas());
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}
