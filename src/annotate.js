import { Vector3 } from 'three';
import { ANCHORS } from './scene/Showroom.js';

/**
 * The drawing keeps annotating the object.
 *
 * Each anchor is a point in the 3D plan; this projects it to screen space every
 * frame and parks a real DOM label there with a leader line. Putting the type
 * in the DOM rather than in the WebGL scene is the whole reason the dimensions
 * stay crisp at any zoom — and it means they are selectable text, not pixels.
 */
export class Annotations {
  constructor(host, showroom) {
    this.host = host;
    this.showroom = showroom;
    this.items = ANCHORS.map((a) => {
      const el = document.createElement('div');
      el.className = `anno anno--${a.side}`;
      el.innerHTML = `
        <svg class="anno__leader" viewBox="0 0 2 2" preserveAspectRatio="none" aria-hidden="true">
          <line x1="1" y1="0" x2="1" y2="2" />
        </svg>
        <span class="anno__dot"></span>
        <span class="anno__text"><b>${a.text}</b><i>${a.unit}</i></span>`;
      host.appendChild(el);
      return {
        el,
        station: a.station,
        world: new Vector3(...a.at),
        out: { x: 0, y: 0, visible: false },
        shown: false,
      };
    });
    this.active = 'threshold';
    this.panel = null;
  }

  setStation(key) {
    if (this.active === key) return;
    this.active = key;
    // The copy panel for this station is the one region a label must never
    // land on: a dimension sitting across the specification list reads as a
    // typo in the sentence underneath it.
    const section = document.querySelector(`[data-station="${key}"]`);
    this.panel = section?.querySelector('.room, .threshold, .lift, .sheet-index, .workshop, .enquire') || null;
    this.items.forEach((it) => {
      const belongs = it.station === key;
      if (!belongs && it.shown) {
        it.el.classList.remove('is-on');
        it.shown = false;
      }
      it.wants = belongs;
    });
    // Stagger the ones that belong here, so the sheet annotates itself in order.
    let n = 0;
    this.items.forEach((it) => {
      if (!it.wants) return;
      const delay = n * 110 + 220;
      n += 1;
      clearTimeout(it.timer);
      it.timer = setTimeout(() => {
        if (it.wants) {
          it.el.classList.add('is-on');
          it.shown = true;
        }
      }, delay);
    });
  }

  update() {
    // One rect read per frame, for the active panel only. Annotations are
    // fixed-position and the panel scrolls, so this has to be live.
    let keepOut = null;
    if (this.panel) {
      const r = this.panel.getBoundingClientRect();
      if (r.width > 0 && r.bottom > 0 && r.top < window.innerHeight) {
        keepOut = { l: r.left - 24, r: r.right + 24, t: r.top - 20, b: r.bottom + 20 };
      }
    }

    for (let i = 0; i < this.items.length; i += 1) {
      const it = this.items[i];
      if (!it.wants) {
        if (it.el.style.visibility !== 'hidden') it.el.style.visibility = 'hidden';
        continue;
      }
      this.showroom.project(it.world, it.out);
      const blocked =
        keepOut &&
        it.out.x > keepOut.l &&
        it.out.x < keepOut.r &&
        it.out.y > keepOut.t &&
        it.out.y < keepOut.b;
      if (!it.out.visible || blocked) {
        it.el.style.visibility = 'hidden';
        continue;
      }
      it.el.style.visibility = 'visible';
      it.el.style.transform = `translate3d(${Math.round(it.out.x)}px, ${Math.round(it.out.y)}px, 0)`;
    }
  }
}
