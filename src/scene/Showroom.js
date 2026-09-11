import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  Mesh,
  PlaneGeometry,
  MeshStandardMaterial,
  HemisphereLight,
  DirectionalLight,
  PointLight,
  FogExp2,
  Color,
  Vector3,
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from 'three';
import { createMaterials, applyUpholstery, PALETTE } from './materials.js';
import { buildPlanTexture, PLAN } from './planTexture.js';
import { roundedBox } from './geometry.js';
import * as F from './furniture.js';

const WALL_H = 0.12; // 120 mm, the whole premise: a plan you can also stand in

/**
 * Camera stations. Each one is a held position in the plan; scrolling
 * interpolates between consecutive stations, which is how the page lifts you
 * out of Room 01 and sets you down in the next.
 *
 * Framing rule, and it is easy to get backwards: a subject lands on the side of
 * the frame that its offset from the camera shares with the camera's own right
 * axis. So to push a piece to the right of the frame — clear of a copy panel on
 * the left — the LOOK TARGET moves left of the piece, not the camera.
 */
export const STATIONS = [
  { key: 'threshold', pos: [2.45, 1.24, 6.9], look: [4.35, 0.52, 2.15], fov: 40, lamp: 0.7 },
  { key: 'lift', pos: [3.9, 8.2, 10.4], look: [4.6, 0, 4.2], fov: 40, lamp: 0.9 },
  { key: 'living', pos: [3.3, 2.4, 7.2], look: [1.9, 0.45, 2.0], fov: 36, lamp: 1 },
  { key: 'dining', pos: [10.3, 2.5, 7.8], look: [12.6, 0.6, 3.0], fov: 36, lamp: 1 },
  { key: 'rest', pos: [3.4, 3.2, 16.6], look: [2.0, 0.6, 9.6], fov: 36, lamp: 1 },
  { key: 'work', pos: [8.6, 2.0, 13.2], look: [12.4, 0.7, 9.2], fov: 36, lamp: 1 },
  { key: 'sheet', pos: [7.0, 22.5, 14.6], look: [7.0, 0, 6.2], fov: 34, lamp: 0.95 },
  { key: 'workshop', pos: [5.9, 1.0, 4.15], look: [4.2, 0.55, 2.25], fov: 32, lamp: 1 },
  { key: 'enquire', pos: [11.4, 7.0, 16.4], look: [6.4, 0, 7.2], fov: 36, lamp: 0.85 },
];

/**
 * Annotation anchors. These are the crisp DOM labels that ride over the scene,
 * so the drawing keeps annotating the real object at every station. Real text,
 * not texture: it stays legible, selectable and available to a screen reader.
 */
export const ANCHORS = [
  { station: 'threshold', at: [5.05, 0.03, 3.15], text: '2180', unit: 'mm', side: 'down' },
  { station: 'threshold', at: [5.05, 0.44, 2.15], text: '430', unit: 'mm seat', side: 'right' },
  { station: 'living', at: [3.6, 0.03, 2.72], text: '2180 × 940', unit: 'mm', side: 'down' },
  { station: 'living', at: [4.72, 0.86, 1.6], text: 'Ash frame', unit: 'doweled', side: 'right' },
  { station: 'living', at: [2.5, 0.52, 2.1], text: 'Feather', unit: 'over HR core', side: 'left' },
  { station: 'dining', at: [10.65, 0.03, 3.7], text: '2400', unit: 'mm', side: 'down' },
  { station: 'dining', at: [9.5, 0.76, 3.1], text: '40', unit: 'mm oak slab', side: 'left' },
  { station: 'dining', at: [10.65, 1.45, 3.0], text: 'Hale', unit: 'three-drop', side: 'up' },
  { station: 'rest', at: [3.3, 0.03, 10.9], text: '2050', unit: 'mm', side: 'down' },
  { station: 'rest', at: [4.55, 0.9, 8.45], text: '2200', unit: 'K, downward', side: 'right' },
  { station: 'rest', at: [2.55, 0.4, 10.8], text: '380', unit: 'mm platform', side: 'left' },
  { station: 'work', at: [10.2, 0.03, 10.05], text: '700', unit: 'mm deep', side: 'down' },
  { station: 'work', at: [9.45, 0.66, 9.05], text: 'Cable tray', unit: '90 mm', side: 'left' },
  { station: 'work', at: [12.55, 1.45, 9.4], text: '4 bays', unit: '1800 mm', side: 'up' },
  { station: 'workshop', at: [3.05, 0.63, 2.0], text: 'Aniline hide', unit: 'full grain', side: 'up' },
  { station: 'workshop', at: [3.4, 0.32, 2.35], text: 'Webbing', unit: 'not springs', side: 'down' },
];

export class Showroom {
  constructor(canvas, { reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    this.mats = createMaterials();

    const mobile = window.innerWidth < 760;
    this.mobile = mobile;

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: !mobile,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.4 : 1.75));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
    this.renderer.shadowMap.enabled = !mobile;
    this.renderer.shadowMap.type = 2; // PCFSoftShadowMap: soft enough, cheap enough

    this.scene = new Scene();
    this.scene.background = new Color(PALETTE.umber800);
    // Light fog only. At 0.036 the far half of the sheet fell to near-black and
    // the drawing — the entire premise — stopped being legible.
    this.scene.fog = new FogExp2(0x2c1f16, 0.016);

    this.camera = new PerspectiveCamera(38, 1, 0.08, 90);
    this.camTarget = new Vector3();

    this._buildSheet();
    this._buildRooms();
    this._buildLights();

    // Interpolation state: the camera is always easing toward a station.
    this.from = STATIONS[0];
    this.to = STATIONS[0];
    this.blend = 0;
    this.pos = new Vector3(...STATIONS[0].pos);
    this.look = new Vector3(...STATIONS[0].look);
    this.fov = STATIONS[0].fov;
    this.lampMix = STATIONS[0].lamp;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this.clock = 0;

    this.resize();
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
  }

  /** The sheet: the plan drawing itself, plus the 120 mm walls standing on it. */
  _buildSheet() {
    const tex = buildPlanTexture();
    this.planTexture = tex;

    const floor = new Mesh(
      new PlaneGeometry(PLAN.w, PLAN.d),
      new MeshStandardMaterial({ map: tex, roughness: 0.94, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(PLAN.w / 2, 0, PLAN.d / 2);
    floor.receiveShadow = true;
    this.floor = floor;
    this.scene.add(floor);

    // A dark surround so the sheet reads as a sheet lying on a workshop table.
    const surround = new Mesh(
      new PlaneGeometry(PLAN.w * 4, PLAN.d * 4),
      new MeshStandardMaterial({ color: PALETTE.umber900, roughness: 1 })
    );
    surround.rotation.x = -Math.PI / 2;
    surround.position.set(PLAN.w / 2, -0.012, PLAN.d / 2);
    this.scene.add(surround);

    const walls = new Group();
    PLAN.rooms.forEach((r) => {
      const w = r.x1 - r.x0;
      const d = r.z1 - r.z0;
      const t = 0.055;
      const spans = [
        [r.x0 + w / 2, r.z0, w, t],
        [r.x0 + w / 2, r.z1, w, t],
        [r.x0, r.z0 + d / 2, t, d],
        [r.x1, r.z0 + d / 2, t, d],
      ];
      spans.forEach(([cx, cz, sw, sd]) => {
        const m = new Mesh(roundedBox(sw, WALL_H, sd, 0.008, 1), this.mats.wall);
        m.position.set(cx, WALL_H / 2, cz);
        m.castShadow = false;
        m.receiveShadow = true;
        walls.add(m);
        // Bone cap: the drawn line, sitting on top of the wall.
        const cap = new Mesh(roundedBox(sw + 0.004, 0.006, sd + 0.004, 0.002, 1), this.mats.wallTop);
        cap.position.set(cx, WALL_H, cz);
        walls.add(cap);
      });
    });
    this.scene.add(walls);
  }

  _buildRooms() {
    const m = this.mats;
    this.rooms = {};

    // 01 LIVING
    const living = new Group();
    this.sofa = F.sofa(m);
    this.sofa.position.set(3.6, 0, 2.0);
    const chair = F.armchair(m);
    chair.position.set(6.2, 0, 4.4);
    chair.rotation.y = -2.2;
    const table = F.lowTable(m);
    table.position.set(3.6, 0, 3.6);
    // Sized and placed to sit between the pieces, not to tile over the plan.
    const livingRug = F.rug(m, 2.2, 1.5);
    livingRug.position.set(3.7, 0, 3.5);
    living.add(livingRug, this.sofa, chair, table);
    this.rooms.living = living;

    // 02 DINING
    const dining = new Group();
    const dt = F.diningTable(m);
    dt.position.set(10.65, 0, 3.0);
    dining.add(dt);
    const seats = [
      [9.75, 2.2, Math.PI],
      [10.65, 2.2, Math.PI],
      [11.55, 2.2, Math.PI],
      [9.75, 3.8, 0],
      [10.65, 3.8, 0],
      [11.55, 3.8, 0],
      [12.35, 3.0, Math.PI / 2],
      [8.95, 3.0, -Math.PI / 2],
    ];
    seats.forEach(([x, z, ry]) => {
      const c = F.diningChair(m);
      c.position.set(x, 0, z);
      c.rotation.y = ry;
      dining.add(c);
    });
    const pend = F.pendants(m);
    pend.position.set(10.65, 0, 3.0);
    dining.add(pend);
    this.rooms.dining = dining;

    // 03 REST
    const rest = new Group();
    const b = F.bed(m);
    b.position.set(3.2, 0, 9.6);
    const ns = F.nightstand(m);
    ns.position.set(4.55, 0, 8.45);
    const restRug = F.rug(m, 2.2, 1.2);
    restRug.position.set(3.2, 0, 11.5);
    rest.add(restRug, b, ns);
    this.rooms.rest = rest;

    // 04 WORK
    const work = new Group();
    const dk = F.desk(m);
    dk.position.set(10.2, 0, 9.4);
    const tc = F.taskChair(m);
    tc.position.set(10.2, 0, 10.25);
    tc.rotation.y = Math.PI + 0.2;
    const sh = F.shelf(m);
    sh.position.set(12.55, 0, 9.4);
    sh.rotation.y = -Math.PI / 2;
    work.add(dk, tc, sh);
    this.rooms.work = work;

    Object.values(this.rooms).forEach((g) => this.scene.add(g));
  }

  _buildLights() {
    // Evening ambient: warm from above, almost nothing bouncing back up.
    this.scene.add(new HemisphereLight(0x8a6b4a, 0x241811, 1.25));

    // One shadow-casting key light, framed tightly to the sheet so a single
    // 1024 map is enough for the whole showroom.
    const key = new DirectionalLight(0xffd6a4, 1.85);
    key.position.set(-6.5, 11, 14);
    key.target.position.set(6, 0, 6);
    if (!this.mobile) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      const c = key.shadow.camera;
      c.left = -11;
      c.right = 11;
      c.top = 11;
      c.bottom = -11;
      c.near = 1;
      c.far = 34;
      key.shadow.bias = -0.0012;
      key.shadow.normalBias = 0.022;
    }
    this.scene.add(key, key.target);
    this.key = key;

    // A soft fill from the far corner, so the umber never goes to pure black.
    const fill = new DirectionalLight(0x8fb0a0, 0.4);
    fill.position.set(15, 6, -4);
    this.scene.add(fill);

    // The pointer light: the piece under your cursor catches the light, the way
    // a foil-stamped cover catches a lamp when you tilt it.
    this.handLight = new PointLight(0xffd9ac, 0, 4.6, 2);
    this.scene.add(this.handLight);
  }

  /**
   * Compile every material against this camera and draw one frame before the
   * page is revealed. Three compiles shaders lazily on first render, so without
   * this the loader lifts and the visitor's first scroll lands on a 300 ms
   * stall — the one stutter a scroll-driven camera cannot hide.
   */
  prewarm() {
    this.renderer.compile(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera);
  }

  setUpholstery(key) {
    return applyUpholstery(this.mats, key);
  }


  /** Called by the scroll orchestration: where we are, and how far along. */
  goTo(fromKey, toKey, blend) {
    const from = STATIONS.find((s) => s.key === fromKey) || this.from;
    const to = STATIONS.find((s) => s.key === toKey) || from;
    this.from = from;
    this.to = to;
    this.blend = blend;
    if (this.reducedMotion) this._applyImmediate();
  }

  _applyImmediate() {
    const t = ease(this.blend);
    lerpArr(this.pos, this.from.pos, this.to.pos, t);
    lerpArr(this.look, this.from.look, this.to.look, t);
    this.fov = lerp(this.from.fov, this.to.fov, t);
    this.lampMix = lerp(this.from.lamp, this.to.lamp, t);
    this.camera.position.copy(this.pos);
    this.camera.position.y += this.lift || 0;
    if (this.pullBack) {
      tmpF.copy(this.pos).sub(this.look).normalize().multiplyScalar(this.pullBack);
      this.camera.position.add(tmpF);
    }
    this.camera.fov = this.fov + (this.fovBias || 0);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.look);
  }

  setPointer(nx, ny) {
    this.pointer.tx = nx;
    this.pointer.ty = ny;
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // A portrait frame sees a fraction of the width a landscape one does, so
    // it needs both a wider lens AND real distance: widening alone left the
    // sofa filling the phone viewport with the copy sitting on top of it.
    const ar = w / h;
    this.fovBias = ar < 0.85 ? 10 : ar < 1.2 ? 4 : 0;
    // 2.2 was an overcorrection: it pushed the sofa out of the phone hero
    // entirely, trading a collision for an empty frame.
    this.pullBack = ar < 0.85 ? 0.85 : ar < 1.2 ? 0.5 : 0;
    // A portrait frame stacks rather than sitting side by side: the copy takes
    // the top, so the camera rises and the furniture drops into the lower
    // two thirds instead of sitting behind the headline.
    this.lift = ar < 0.85 ? 1.05 : ar < 1.2 ? 0.35 : 0;
  }

  update(dt) {
    this.clock += dt;

    if (this.reducedMotion) {
      this._applyImmediate();
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const t = ease(this.blend);
    const targetPos = tmpA.set(0, 0, 0);
    lerpArr(targetPos, this.from.pos, this.to.pos, t);
    const targetLook = tmpB.set(0, 0, 0);
    lerpArr(targetLook, this.from.look, this.to.look, t);

    // Critically damped follow: the camera never snaps, and never drifts.
    const k = 1 - Math.exp(-dt * 5.2);
    this.pos.lerp(targetPos, k);
    this.look.lerp(targetLook, k);
    this.fov = lerp(this.fov, lerp(this.from.fov, this.to.fov, t), k);
    this.lampMix = lerp(this.lampMix, lerp(this.from.lamp, this.to.lamp, t), k);

    // Pointer parallax: a hand on the sheet, not a free camera.
    this.pointer.x += (this.pointer.tx - this.pointer.x) * (1 - Math.exp(-dt * 3.4));
    this.pointer.y += (this.pointer.ty - this.pointer.y) * (1 - Math.exp(-dt * 3.4));
    const sway = Math.sin(this.clock * 0.22) * 0.014;

    this.camera.position.set(
      this.pos.x + this.pointer.x * 0.26 + sway,
      this.pos.y + (this.lift || 0) - this.pointer.y * 0.12,
      this.pos.z + Math.cos(this.clock * 0.19) * 0.014
    );
    if (this.pullBack) {
      // Back off along the view axis, so the framing loosens without the
      // station's composition changing.
      tmpF.copy(this.camera.position).sub(this.look).normalize().multiplyScalar(this.pullBack);
      this.camera.position.add(tmpF);
    }
    this.camera.fov = this.fov + (this.fovBias || 0);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.look);

    // The hand light rides in front of the camera, toward the pointer.
    this.handLight.intensity = 3.1 * this.lampMix;
    const fwd = tmpC.copy(this.look).sub(this.camera.position).normalize();
    this.handLight.position
      .copy(this.camera.position)
      .add(fwd.multiplyScalar(1.5))
      .add(tmpD.set(this.pointer.x * 1.5, 0.7 - this.pointer.y * 0.5, 0));

    this.key.intensity = 1.45 + 0.75 * this.lampMix;

    this.renderer.render(this.scene, this.camera);
  }

  project(vec3, out) {
    tmpE.copy(vec3).project(this.camera);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    out.x = (tmpE.x * 0.5 + 0.5) * w;
    out.y = (-tmpE.y * 0.5 + 0.5) * h;
    out.visible = tmpE.z < 1 && out.x > -80 && out.x < w + 80 && out.y > 40 && out.y < h - 20;
    return out;
  }

  dispose() {
    this.renderer.dispose();
    this.planTexture.dispose();
  }
}

const tmpA = new Vector3();
const tmpB = new Vector3();
const tmpC = new Vector3();
const tmpD = new Vector3();
const tmpE = new Vector3();
const tmpF = new Vector3();

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpArr(out, a, b, t) {
  out.set(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
  return out;
}
/**
 * Smootherstep. Scroll-linked interpolation needs ease on BOTH ends: an
 * ease-out here would fling the camera at the next room the instant you nudged
 * the wheel. DOM reveals use exponential ease-out instead — see motion.js —
 * because those start from rest and have somewhere to arrive.
 */
function ease(t) {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * c * (c * (c * 6 - 15) + 10);
}
