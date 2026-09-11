import {
  CanvasTexture,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Color,
} from 'three';

/** Palette shared with the stylesheet. The sheet and the page are one world. */
export const PALETTE = {
  umber900: 0x1e1510,
  umber800: 0x2a1e16,
  umber700: 0x372619,
  umber600: 0x46311f,
  bone100: 0xf2e7d3,
  bone300: 0xcbb79a,
  tan500: 0xc98a52,
  oak: 0x9a6b3f,
  ash: 0xd8c9b4,
  linen: 0xc9b79a,
  rug: 0x7a5940,
  brass: 0xc08f4a,
  steel: 0x3f3a34,
  lamp: 0xffc98a,
};

/** Upholstery options, wired to the swatch control in the Living station. */
export const UPHOLSTERY = {
  tan: { color: 0xc98a52, roughness: 0.52, sheen: 0.5, note: 'Tan aniline — darkens with light, never evenly.' },
  chestnut: { color: 0x8d4f30, roughness: 0.45, sheen: 0.65, note: 'Chestnut pull-up — the creases lighten as they form.' },
  olive: { color: 0x6f7351, roughness: 0.92, sheen: 0.1, note: 'Olive canvas — 480 gsm, stiff for a season then soft.' },
  bone: { color: 0xc9b79a, roughness: 0.95, sheen: 0.06, note: 'Bone linen — washed, so it creases on purpose.' },
};

/**
 * Speckled bump for hide. Generated once at 256px and shared by every
 * upholstered surface: material presence for one small texture upload.
 */
function hideBump() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i += 1) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 0.4 + Math.random() * 1.5;
    const light = Math.random() > 0.5;
    g.fillStyle = light ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)';
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

/** Straight grain for timber, streaked along one axis. */
function timberBump() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 220; i += 1) {
    const y = Math.random() * 128;
    const dark = Math.random() > 0.5;
    g.strokeStyle = dark ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.1)';
    g.lineWidth = 0.4 + Math.random() * 1.8;
    g.beginPath();
    g.moveTo(0, y);
    let yy = y;
    for (let x = 0; x <= 512; x += 32) {
      yy += (Math.random() - 0.5) * 3;
      g.lineTo(x, yy);
    }
    g.stroke();
  }
  // A few knots, so the grain is not a barcode.
  for (let i = 0; i < 4; i += 1) {
    const x = Math.random() * 512;
    const y = Math.random() * 128;
    for (let k = 0; k < 5; k += 1) {
      g.strokeStyle = 'rgba(0,0,0,0.1)';
      g.lineWidth = 0.7;
      g.beginPath();
      g.ellipse(x, y, 3 + k * 2.4, 1.6 + k * 1.1, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(2, 1);
  return t;
}

export function createMaterials() {
  const hide = hideBump();
  const timber = timberBump();

  const upholstery = new MeshStandardMaterial({
    color: UPHOLSTERY.tan.color,
    roughness: UPHOLSTERY.tan.roughness,
    metalness: 0,
    bumpMap: hide,
    // Raised from 0.35: at station distances the grain contributed nothing and
    // the hide read as flat tint. A roughnessMap was tried here and reverted —
    // the mid-grey noise halved roughness and turned the leather shiny, which
    // is the opposite of the soft register the brief pinned.
    bumpScale: 1.1,
  });

  const oak = new MeshStandardMaterial({
    color: PALETTE.oak,
    roughness: 0.68,
    metalness: 0,
    bumpMap: timber,
    bumpScale: 0.85,
  });

  const ash = new MeshStandardMaterial({
    color: PALETTE.ash,
    roughness: 0.74,
    metalness: 0,
    bumpMap: timber,
    bumpScale: 0.7,
  });

  const linen = new MeshStandardMaterial({
    color: PALETTE.linen,
    roughness: 0.95,
    metalness: 0,
    bumpMap: hide,
    bumpScale: 0.2,
  });

  // Rugs sit on the drawing, so they must not out-value it: a bone-linen rug
  // read as a pale slab covering the plan it was supposed to sit on.
  const rug = new MeshStandardMaterial({
    color: PALETTE.rug,
    roughness: 0.98,
    metalness: 0,
    bumpMap: hide,
    bumpScale: 0.5,
  });

  const brass = new MeshStandardMaterial({
    color: PALETTE.brass,
    roughness: 0.32,
    metalness: 0.88,
  });

  const steel = new MeshStandardMaterial({
    color: PALETTE.steel,
    roughness: 0.5,
    metalness: 0.55,
  });

  const wall = new MeshStandardMaterial({
    color: PALETTE.umber600,
    roughness: 0.9,
    metalness: 0,
  });

  const wallTop = new MeshStandardMaterial({
    color: PALETTE.bone300,
    roughness: 0.8,
    metalness: 0,
  });

  const shade = new MeshStandardMaterial({
    color: 0xf0dcc0,
    roughness: 0.85,
    metalness: 0,
    emissive: new Color(PALETTE.lamp),
    emissiveIntensity: 0.55,
    side: 2,
  });

  return { upholstery, oak, ash, linen, rug, brass, steel, wall, wallTop, shade, hide, timber };
}

export function applyUpholstery(materials, key) {
  const spec = UPHOLSTERY[key] || UPHOLSTERY.tan;
  materials.upholstery.color.setHex(spec.color);
  materials.upholstery.roughness = spec.roughness;
  materials.upholstery.needsUpdate = true;
  return spec;
}

export { SRGBColorSpace };
