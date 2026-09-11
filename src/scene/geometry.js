import {
  BoxGeometry,
  CylinderGeometry,
  Vector3,
  CanvasTexture,
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
} from 'three';

/**
 * A rounded box built by pushing a subdivided box's vertices onto a rounded
 * cube. Three has no primitive for this and drei is a React dependency we do
 * not want, so this is the one piece of geometry maths the world needs: every
 * cushion, arm, slab and drawer in the showroom is one of these, which is why
 * the whole plan stays under a few thousand triangles.
 */
export function roundedBox(w, h, d, radius = 0.04, seg = 4) {
  const r = Math.min(radius, Math.min(w, h, d) / 2 - 1e-4);
  const geo = new BoxGeometry(w, h, d, seg, seg, seg);
  const pos = geo.attributes.position;
  const ix = w / 2 - r;
  const iy = h / 2 - r;
  const iz = d / 2 - r;
  const v = new Vector3();
  const c = new Vector3();

  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    c.set(clamp(v.x, -ix, ix), clamp(v.y, -iy, iy), clamp(v.z, -iz, iz));
    v.sub(c);
    const len = v.length();
    if (len > 1e-6) v.multiplyScalar(r / len);
    pos.setXYZ(i, c.x + v.x, c.y + v.y, c.z + v.z);
  }

  geo.computeVertexNormals();
  geo.deleteAttribute('uv2');
  return geo;
}

/** A cushion: a rounded box that sags a little, because none of them are boxes. */
export function cushion(w, h, d, radius = 0.05, sag = 0.35) {
  const geo = roundedBox(w, h, d, radius, 5);
  const pos = geo.attributes.position;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    // Pinch the waist and let the top settle toward the middle.
    const nx = (v.x / (w / 2)) ** 2;
    const nz = (v.z / (d / 2)) ** 2;
    const dip = (1 - nx) * (1 - nz) * sag * h * 0.35;
    if (v.y > 0) pos.setY(i, v.y - dip);
    const bulge = 1 + (1 - Math.abs(v.y) / (h / 2)) * 0.035;
    pos.setX(i, v.x * bulge);
    pos.setZ(i, v.z * bulge);
  }
  geo.computeVertexNormals();
  return geo;
}

/** A tapered leg, the detail that separates furniture from crates. */
export function leg(topR, botR, h, seg = 10) {
  return new CylinderGeometry(topR, botR, h, seg, 1);
}

let shadowTex = null;
function contactShadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0, 'rgba(12,7,4,0.62)');
  grad.addColorStop(0.45, 'rgba(12,7,4,0.34)');
  grad.addColorStop(1, 'rgba(12,7,4,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  shadowTex = new CanvasTexture(c);
  return shadowTex;
}

/**
 * A painted contact shadow. One directional shadow map cannot give every piece
 * a believable footprint without going expensive, so the ambient occlusion
 * under each object is a single unlit sprite lying on the sheet.
 */
export function contactShadow(w, d, opacity = 1) {
  const mesh = new Mesh(
    new PlaneGeometry(w, d),
    new MeshBasicMaterial({
      map: contactShadowTexture(),
      transparent: true,
      opacity,
      depthWrite: false,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.004;
  mesh.renderOrder = -1;
  return mesh;
}

function clamp(n, lo, hi) {
  return n < lo ? lo : n > hi ? hi : n;
}
