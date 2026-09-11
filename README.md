# Full Scale — showroom plan

A furniture landing page built as an architect's furnished floor plan that you
walk. One WebGL canvas sits behind the whole document; scrolling moves a camera
between nine stations in a room you are standing inside, and the DOM
annotations are projected from the 3D scene every frame.

> [!WARNING]
> **This is a mock, not a launch.** The brand name, positioning, copy and every
> figure on the page are invented placeholders. There are deliberately no
> prices, testimonials, customer names, press logos or addresses anywhere in
> it — see the notice at the top of [`src/content.js`](src/content.js) and the
> constraints in [`PRODUCT.md`](PRODUCT.md). All of it must be replaced with
> real, verified content before this is shown publicly.

## Running it

```bash
npm ci        # restore exact dependency versions
npm run dev   # dev server
npm run build # production build into dist/
npm run preview
```

Requires a browser with WebGL. The page is fully readable without it — if the
context fails, it falls back to the flat sheet rather than breaking.

## Layout

| Path | What's in it |
| --- | --- |
| `index.html` | Document, the direction contract as the first body comment, and the preloader's inline styles |
| `src/main.js` | Boot sequence, preloader wiring, swatches, nav drawer, form |
| `src/scene/` | The showroom: camera stations, procedural furniture geometry, materials, and the plan drawn to a canvas texture |
| `src/motion.js` | Scroll-driven camera, reveals, station tracking, smooth scroll |
| `src/annotate.js` | Projecting DOM labels from 3D positions, with keep-out zones |
| `src/preloader.js` | The opening beat and its hand-off to the page |
| `DESIGN.md` | The design system, derived from the shipped code |
| `.impeccable/` | Playwright probes used to verify the build |

## Notes on the build

All furniture geometry is generated in code and every texture is drawn to a
canvas at runtime, so the payload is JavaScript rather than assets. Three.js is
the floor at ~132 kB gzip. One shadow map, painted contact shadows, capped
device pixel ratio, and rendering halts entirely when the tab is hidden.

`DESIGN.md` records the rules and, for each "don't", the actual defect that
produced it.
