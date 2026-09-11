import { Group, Mesh, CylinderGeometry, PointLight, ConeGeometry, TorusGeometry } from 'three';
import { roundedBox, cushion, leg, contactShadow } from './geometry.js';

/**
 * Every piece is assembled from the same four moves — a rounded slab, a sagging
 * cushion, a tapered leg, a painted contact shadow — which is what makes the
 * collection read as one system rather than a set of downloads.
 */

function put(geo, mat, x, y, z, castShadow = false) {
  const m = new Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  return m;
}

/** S-01 · The Ovett three-seat. 2180 × 940 × 720 mm. */
export function sofa(mats) {
  const g = new Group();
  const W = 2.18;
  const D = 0.94;
  const seatH = 0.43;
  const armW = 0.2;

  g.add(contactShadow(W * 1.5, D * 2.1, 0.95));

  // Plinth and seat deck, upholstered rather than bare: a pale ash slab under
  // the cushions read as a plinth the sofa was standing on.
  g.add(put(roundedBox(W - 0.06, 0.18, D - 0.08, 0.05), mats.upholstery, 0, seatH - 0.14, 0, true));

  // Three seat cushions
  const inner = W - armW * 2 - 0.06;
  const gap = 0.026; // wide enough that three cushions read as three
  const cw = inner / 3 - gap;
  for (let i = 0; i < 3; i += 1) {
    const x = -inner / 2 + cw / 2 + i * (cw + gap);
    g.add(put(cushion(cw, 0.19, D - 0.24, 0.055, 0.4), mats.upholstery, x, seatH + 0.03, 0.06, true));
  }

  // Three back cushions, tipped back a touch
  for (let i = 0; i < 3; i += 1) {
    const x = -inner / 2 + cw / 2 + i * (cw + gap);
    const m = put(cushion(cw, 0.4, 0.2, 0.06, 0.3), mats.upholstery, x, seatH + 0.24, -D / 2 + 0.21, true);
    m.rotation.x = -0.14;
    g.add(m);
  }

  // Arms
  [-1, 1].forEach((s) => {
    g.add(
      put(
        roundedBox(armW, 0.36, D - 0.04, 0.09),
        mats.upholstery,
        s * (W / 2 - armW / 2),
        seatH + 0.14,
        0,
        true
      )
    );
  });

  // Back panel behind the cushions
  g.add(put(roundedBox(W - 0.04, 0.34, 0.12, 0.05), mats.upholstery, 0, seatH + 0.11, -D / 2 + 0.055, true));

  // Four tapered legs
  [-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const l = put(
        leg(0.045, 0.028, seatH - 0.22),
        mats.ash,
        sx * (W / 2 - 0.16),
        (seatH - 0.22) / 2,
        sz * (D / 2 - 0.14)
      );
      l.rotation.z = sx * 0.06;
      l.rotation.x = -sz * 0.06;
      g.add(l);
    })
  );

  return g;
}

/** A-02 · The Ovett chair, the same grammar with one seat. */
export function armchair(mats) {
  const g = new Group();
  const W = 0.9;
  const D = 0.88;
  const seatH = 0.42;

  g.add(contactShadow(W * 1.7, D * 1.8, 0.9));
  g.add(put(roundedBox(W - 0.05, 0.14, D - 0.08, 0.05), mats.ash, 0, seatH - 0.13, 0, true));
  g.add(put(cushion(W - 0.34, 0.16, D - 0.26, 0.055, 0.42), mats.upholstery, 0, seatH + 0.02, 0.05, true));

  const back = put(cushion(W - 0.32, 0.46, 0.18, 0.07, 0.28), mats.upholstery, 0, seatH + 0.3, -D / 2 + 0.16, true);
  back.rotation.x = -0.17;
  g.add(back);

  [-1, 1].forEach((s) => {
    g.add(put(roundedBox(0.16, 0.26, D - 0.06, 0.075), mats.upholstery, s * (W / 2 - 0.08), seatH + 0.1, 0, true));
  });

  [-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const l = put(leg(0.04, 0.026, seatH - 0.2), mats.ash, sx * (W / 2 - 0.14), (seatH - 0.2) / 2, sz * (D / 2 - 0.13));
      l.rotation.z = sx * 0.07;
      l.rotation.x = -sz * 0.07;
      g.add(l);
    })
  );
  return g;
}

/** T-03 · Low table, oak slab on a blacked steel frame. */
export function lowTable(mats) {
  const g = new Group();
  g.add(contactShadow(1.5, 0.95, 0.75));
  g.add(put(roundedBox(1.1, 0.045, 0.6, 0.012), mats.oak, 0, 0.38, 0, true));
  [-1, 1].forEach((sx) => {
    g.add(put(roundedBox(0.035, 0.36, 0.5, 0.008), mats.steel, sx * 0.46, 0.19, 0));
  });
  g.add(put(roundedBox(0.86, 0.028, 0.03, 0.008), mats.steel, 0, 0.09, 0));
  return g;
}

/** D-04 · The Marlow refectory. 2400 × 950 × 740 mm. */
export function diningTable(mats) {
  const g = new Group();
  const W = 2.4;
  const D = 0.95;
  const H = 0.74;

  g.add(contactShadow(W * 1.35, D * 1.9, 0.9));
  g.add(put(roundedBox(W, 0.04, D, 0.008), mats.oak, 0, H - 0.02, 0, true));
  // Aprons
  [-1, 1].forEach((sz) => g.add(put(roundedBox(W - 0.5, 0.09, 0.03, 0.006), mats.oak, 0, H - 0.1, sz * (D / 2 - 0.1))));
  // Splayed legs, the drawbore joint the copy talks about
  [-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const l = put(leg(0.05, 0.038, H - 0.05), mats.oak, sx * (W / 2 - 0.2), (H - 0.05) / 2, sz * (D / 2 - 0.12), true);
      l.rotation.z = sx * 0.05;
      l.rotation.x = -sz * 0.08;
      g.add(l);
    })
  );
  return g;
}

/** Dining chair: seat, tapered legs, three spindles. */
export function diningChair(mats) {
  const g = new Group();
  const seatH = 0.45;
  g.add(contactShadow(0.9, 0.9, 0.6));
  g.add(put(roundedBox(0.44, 0.035, 0.42, 0.02), mats.ash, 0, seatH, 0, true));
  g.add(put(cushion(0.4, 0.05, 0.38, 0.02, 0.2), mats.upholstery, 0, seatH + 0.04, 0));

  [-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const l = put(leg(0.024, 0.016, seatH), mats.ash, sx * 0.18, seatH / 2, sz * 0.17);
      l.rotation.z = sx * 0.05;
      l.rotation.x = -sz * 0.05;
      g.add(l);
    })
  );

  // Back: two stiles and a curved crest rail
  [-1, 1].forEach((sx) => {
    const s = put(leg(0.02, 0.022, 0.46), mats.ash, sx * 0.18, seatH + 0.23, -0.17);
    s.rotation.x = -0.1;
    g.add(s);
  });
  const crest = put(new TorusGeometry(0.19, 0.018, 6, 12, Math.PI), mats.ash, 0, seatH + 0.44, -0.2);
  crest.rotation.set(Math.PI / 2 - 0.1, 0, 0);
  g.add(crest);
  for (let i = -1; i <= 1; i += 1) {
    const sp = put(leg(0.012, 0.012, 0.36), mats.ash, i * 0.085, seatH + 0.2, -0.18);
    sp.rotation.x = -0.1;
    g.add(sp);
  }
  return g;
}

/** The Hale three-drop pendant, with the one warm light the dining room needs. */
export function pendants(mats) {
  const g = new Group();
  const drops = [
    [-0.42, 1.62],
    [0, 1.48],
    [0.42, 1.7],
  ];
  drops.forEach(([x, y]) => {
    const shade = put(new ConeGeometry(0.15, 0.2, 16, 1, true), mats.shade, x, y, 0);
    shade.rotation.x = Math.PI;
    g.add(shade);
    g.add(put(new CylinderGeometry(0.004, 0.004, 2.7 - y, 4), mats.brass, x, y + (2.7 - y) / 2 + 0.1, 0));
    g.add(put(roundedBox(0.05, 0.012, 0.05, 0.004), mats.brass, x, y + 0.11, 0));
  });
  const bulb = new PointLight(0xffc07a, 9, 5.2, 2);
  bulb.position.set(0, 1.42, 0);
  g.add(bulb);
  return g;
}

/** B-05 · The Wren bed. 2050 × 1620 × 380 mm. */
export function bed(mats) {
  const g = new Group();
  const W = 1.62;
  const L = 2.05;

  g.add(contactShadow(W * 1.5, L * 1.3, 0.95));
  // Ash platform, wider than the mattress so there is a lip to sit on
  g.add(put(roundedBox(W, 0.14, L, 0.02), mats.ash, 0, 0.2, 0, true));
  [-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      g.add(put(roundedBox(0.07, 0.2, 0.07, 0.012), mats.ash, sx * (W / 2 - 0.08), 0.1, sz * (L / 2 - 0.08)));
    })
  );
  // Mattress and duvet
  g.add(put(roundedBox(W - 0.12, 0.2, L - 0.14, 0.035), mats.linen, 0, 0.37, 0, true));
  const duvet = put(cushion(W - 0.06, 0.13, L - 0.62, 0.06, 0.5), mats.upholstery, 0, 0.5, 0.22, true);
  g.add(duvet);
  // Padded batten at pillow height instead of a headboard
  g.add(put(roundedBox(W, 0.22, 0.1, 0.045), mats.upholstery, 0, 0.62, -L / 2 + 0.02, true));
  [-1, 1].forEach((sx) => {
    g.add(put(cushion(0.6, 0.13, 0.38, 0.06, 0.45), mats.linen, sx * 0.36, 0.52, -L / 2 + 0.28));
  });
  return g;
}

/** N-06 · Nightstand, one drawer, brass pull, and the Pell lamp on top. */
export function nightstand(mats) {
  const g = new Group();
  g.add(contactShadow(0.8, 0.8, 0.7));
  g.add(put(roundedBox(0.45, 0.34, 0.42, 0.015), mats.oak, 0, 0.4, 0, true));
  g.add(put(roundedBox(0.4, 0.012, 0.37, 0.004), mats.steel, 0, 0.41, 0.025));
  const pull = put(new CylinderGeometry(0.012, 0.012, 0.09, 8), mats.brass, 0, 0.41, 0.215);
  pull.rotation.z = Math.PI / 2;
  g.add(pull);
  [-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const l = put(leg(0.022, 0.015, 0.23), mats.ash, sx * 0.17, 0.115, sz * 0.15);
      l.rotation.z = sx * 0.06;
      g.add(l);
    })
  );

  // The Pell lamp: a shade that only throws downward.
  g.add(put(new CylinderGeometry(0.006, 0.006, 0.3, 6), mats.brass, 0, 0.72, 0));
  g.add(put(new CylinderGeometry(0.055, 0.055, 0.012, 12), mats.brass, 0, 0.575, 0));
  const shade = put(new ConeGeometry(0.14, 0.16, 18, 1, true), mats.shade, 0, 0.88, 0);
  shade.rotation.x = Math.PI;
  g.add(shade);
  const bulb = new PointLight(0xffb877, 7, 3.6, 2);
  bulb.position.set(0, 0.8, 0);
  g.add(bulb);
  return g;
}

/** W-07 · The Quill desk, with the cable tray along the back rail. */
export function desk(mats) {
  const g = new Group();
  const W = 1.6;
  const D = 0.7;
  const H = 0.735;

  g.add(contactShadow(W * 1.4, D * 2, 0.85));
  g.add(put(roundedBox(W, 0.028, D, 0.008), mats.oak, 0, H - 0.014, 0, true));
  // Cable tray: full width, open to the front, closed to the wall
  g.add(put(roundedBox(W - 0.3, 0.09, 0.012, 0.004), mats.steel, 0, H - 0.075, -D / 2 + 0.03));
  g.add(put(roundedBox(W - 0.3, 0.012, 0.09, 0.004), mats.steel, 0, H - 0.115, -D / 2 + 0.075));
  [-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const l = put(leg(0.03, 0.022, H - 0.03), mats.ash, sx * (W / 2 - 0.12), (H - 0.03) / 2, sz * (D / 2 - 0.09));
      l.rotation.z = sx * 0.04;
      g.add(l);
    })
  );
  return g;
}

/** Task chair: seat, back, and a five-spoke base. */
export function taskChair(mats) {
  const g = new Group();
  g.add(contactShadow(0.9, 0.9, 0.7));
  g.add(put(cushion(0.46, 0.07, 0.44, 0.03, 0.3), mats.upholstery, 0, 0.46, 0, true));
  const back = put(cushion(0.42, 0.44, 0.07, 0.035, 0.25), mats.upholstery, 0, 0.72, -0.2, true);
  back.rotation.x = -0.12;
  g.add(back);
  g.add(put(roundedBox(0.05, 0.28, 0.04, 0.015), mats.steel, 0, 0.62, -0.24));
  g.add(put(new CylinderGeometry(0.028, 0.028, 0.3, 8), mats.steel, 0, 0.3, 0));
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = put(roundedBox(0.03, 0.022, 0.27, 0.008), mats.steel, Math.sin(a) * 0.13, 0.05, Math.cos(a) * 0.13);
    spoke.rotation.y = a;
    g.add(spoke);
    g.add(put(new CylinderGeometry(0.024, 0.024, 0.02, 8), mats.steel, Math.sin(a) * 0.26, 0.026, Math.cos(a) * 0.26));
  }
  return g;
}

/** L-08 · Four-bay shelf, 1800 mm. Books are authored, not bought. */
export function shelf(mats) {
  const g = new Group();
  const W = 0.9;
  const H = 1.8;
  const D = 0.34;

  g.add(contactShadow(W * 1.5, D * 2.4, 0.8));
  [-1, 1].forEach((sx) => g.add(put(roundedBox(0.026, H, D, 0.006), mats.ash, sx * (W / 2), H / 2, 0, true)));
  for (let i = 0; i <= 4; i += 1) {
    g.add(put(roundedBox(W, 0.024, D, 0.006), mats.ash, 0, (i * H) / 4 + 0.02, 0, true));
  }
  g.add(put(roundedBox(W, H, 0.01, 0.004), mats.oak, 0, H / 2, -D / 2 + 0.005));

  // Objects on the shelves: the content that makes it a room and not a diagram.
  const stack = [
    [0.46, 0, 0.3, [0.22, 0.19, 0.26]],
    [1.36, 1, 0.24, [0.2, 0.24]],
    [0.91, 2, 0.34, [0.24, 0.2, 0.22, 0.18]],
    [1.36, 3, 0.16, [0.26]],
  ];
  const spineMats = [mats.upholstery, mats.linen, mats.oak, mats.ash];
  stack.forEach(([y, seed, start, heights]) => {
    let x = -W / 2 + start;
    heights.forEach((h, i) => {
      const t = 0.028 + ((seed + i) % 3) * 0.014;
      const b = put(roundedBox(t, h, D - 0.1, 0.004), spineMats[(seed + i) % 4], x, y + 0.032 + h / 2, 0.01);
      if ((seed + i) % 5 === 0) b.rotation.z = 0.14;
      g.add(b);
      x += t + 0.006;
    });
  });
  return g;
}

/** Rugs: flat, soft, and the only thing on the sheet that hides the hatching. */
export function rug(mats, w, d) {
  const m = new Mesh(roundedBox(w, 0.012, d, 0.006, 2), mats.rug);
  m.position.y = 0.007;
  m.receiveShadow = true;
  return m;
}
