---
name: Full Scale
description: A furniture landing page built as an architect's sheet you stand inside — diazo sepia print, bone linework, and the furniture as the only warm-lit thing on the drawing.
colors:
  umber-900: "#1e1510"
  umber-800: "#2a1e16"
  umber-700: "#372619"
  umber-600: "#46311f"
  umber-550: "#543b26"
  bone-100: "#f2e7d3"
  bone-300: "#cbb79a"
  bone-500: "#a08d72"
  tan-500: "#c98a52"
  tan-300: "#e3b183"
  brass: "#c08f4a"
  lamp: "#f6c98a"
  live: "#8fb0a0"
  live-deep: "#5f7d6e"
  alarm: "#e0996a"
  sheet-ground: "#402d1f"
  panel-ground: "rgba(24, 17, 12, 0.985)"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 8.2vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.022em"
  display-l:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 5.6vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.022em"
  display-m:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.7rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.022em"
  lede:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.06rem, 1rem + 0.4vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  body:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.95rem + 0.22vw, 1.08rem)"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  measure:
    fontFamily: "Martian Mono Variable, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Martian Mono Variable, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.64rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  none: "0"
  circle: "50%"
spacing:
  s-1: "0.25rem"
  s-2: "0.5rem"
  s-3: "0.75rem"
  s-4: "1rem"
  s-5: "1.5rem"
  s-6: "2rem"
  s-7: "3rem"
  s-8: "4.5rem"
  s-9: "7rem"
  s-10: "10rem"
components:
  button-primary:
    backgroundColor: "{colors.tan-500}"
    textColor: "#2a1c0f"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.82rem 1.3rem"
  button-primary-hover:
    backgroundColor: "{colors.tan-300}"
    textColor: "#2a1c0f"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.bone-100}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.82rem 1.3rem"
  panel:
    backgroundColor: "{colors.panel-ground}"
    textColor: "{colors.bone-100}"
    rounded: "{rounded.none}"
    padding: "{spacing.s-6}"
  field:
    backgroundColor: "rgba(20, 13, 8, 0.6)"
    textColor: "{colors.bone-100}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.72rem 0.85rem"
  station-marker:
    backgroundColor: "{colors.umber-900}"
    textColor: "{colors.live}"
    typography: "{typography.measure}"
    rounded: "{rounded.circle}"
    size: "2.9rem"
  swatch:
    rounded: "{rounded.none}"
    size: "46px"
  stamp:
    backgroundColor: "{colors.tan-300}"
    textColor: "{colors.umber-900}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "7px 12px"
---

# Design System: Full Scale

## Overview

Full Scale is a furniture landing page built as a single architect's sheet that
the visitor stands inside. The whole surface is one WebGL scene: a drawn floor
plan lying flat, with 120 mm walls standing on it and procedurally modelled
furniture sitting on its own dashed plan symbol. Scrolling walks a camera
between nine held stations; the page's copy rides over that scene in ruled,
near-opaque panels.

The world is a **diazo sepia print** — the brown-line reprographic process, not
the blueprint. Everything structural is bone linework on umber ground;
everything warm is the furniture, which is the only lit material in the frame.
That single contrast carries the argument: the drawing is disciplined and cool,
the thing it produces is warm and worth sitting in.

The register is evening, not daylight. Dark is chosen from the use scene — a
person at home with one lamp on, picturing a sofa in a room they already live
in — never as a default. Because the ground is dark and the palette is narrow,
**light does the work that colour usually does**: the lamp pools, the key light,
and the pointer-tracked hand light are the composition's primary tools.

## Colors

Strategy: **full palette, four roles.** Umber owns the ground at page scale
(60%+ of every viewport). Bone owns all linework and type. Tan is the product
and nothing else. Verdigris green is reserved for live state and for the one
line on a drawing that describes a person rather than a thing.

### Primary

`tan-500` #c98a52 is the product colour: upholstery, the primary button, the
account stamp. `tan-300` #e3b183 is its lit state — hover fills, the `<em>` in a
display heading, the wordmark's scale rule.

### Secondary

`live` #8fb0a0 is the drafting revision green. It marks the active station, the
circulation path drawn on the sheet, every station marker, annotation dots, the
caret, and form success. It is a **state** colour, never decoration.

### Tertiary

`brass` #c08f4a and `lamp` #f6c98a exist only inside the 3D scene — hardware and
emissive shades. They are not available to the DOM layer.

### Neutral

A five-step umber ramp (`900` → `550`) for grounds, and a three-step bone ramp
(`100` / `300` / `500`) for ink. `sheet-ground` #402d1f is deliberately one step
lighter than `umber-700`: at the page ground value the plan's hatching
disappeared under the scene's lighting and the drawing stopped reading.

### Named Rules

**The Only Lit Thing.** Tan appears on furniture and on the primary action.
Nothing else on the page is allowed to be warm — no warm panel, no warm rule, no
warm heading. The moment a second element goes tan, the furniture stops being
the subject.

**Bone-500 Is Not For Reading.** `bone-500` measures ~5:1 on the umber grounds,
which passes, but it is reserved for hairlines, scale bars, corner ticks and the
sheet stamp. Body and secondary text use `bone-300` (8.4:1) or `bone-100`.

**Green Means Now.** Verdigris is never used to decorate or to differentiate a
category. If it is on screen, it is describing where the visitor currently is.

## Typography

Two families, split by job. **Archivo Variable** carries the voice, exploiting
its width axis: display type at `wdth 116` and weight 700 in uppercase, the
wordmark at `wdth 118`, the titleblock mark at `wdth 122`. **Martian Mono
Variable** carries every measurement — and only measurements: dimensions, specs,
labels, station numbers, the schedule's figures, the titleblock, and the text
drawn onto the sheet texture itself.

### Hierarchy

| Role | Size | Face |
|---|---|---|
| `display--xl` | `clamp(2.75rem, 8.2vw, 6rem)` | Archivo 700, `wdth 116`, caps |
| `display--l` | `clamp(2.1rem, 5.6vw, 3.9rem)` | Archivo 700, `wdth 116`, caps |
| `display--m` | `clamp(1.75rem, 4vw, 2.7rem)` | Archivo 700, `wdth 116`, caps |
| lede | `clamp(1.06rem, 1rem + 0.4vw, 1.3rem)` | Archivo 400 |
| body | `clamp(1rem, 0.95rem + 0.22vw, 1.08rem)` | Archivo 400 |
| measurement | `0.78–0.8rem` | Martian Mono 400–500 |
| label | `0.58–0.72rem`, tracking `0.12–0.18em`, caps | Martian Mono 500–600 |

### Named Rules

**Mono Is Earned, Not Worn.** Monospace here is for measurement, reference codes
and drawing annotation. It is never used to make prose look technical.

**The Compressed Emphasis.** Emphasis inside a display heading drops to
`wdth 78` at weight 400 in tan — narrow and light against wide and heavy —
rather than changing size. Used once per heading at most.

**Figures Are Tabular.** Every dimension, reference and lead time uses
`tabular-nums lining-nums`, so a column of measurements aligns the way it would
on a real schedule.

## Layout

One spacing rhythm on a 4px base, `s-1` (0.25rem) through `s-10` (10rem). The
page gutter is `clamp(1.25rem, 4vw, 4.5rem)`; above 900px stations also reserve
`--rail-w: 5.5rem` on the left for the fixed station rail.

The page is a stack of `.station` sections, each at least one viewport tall so
the camera has scroll distance to travel. Two layout modes:

- **Held stations** (the four rooms): the section runs `124vh` with
  `align-content: start`, and its copy panel is `position: sticky` beneath the
  masthead. The panel holds still while the camera walks.
- **Flowing stations** (collection, workshop, enquire): `min-height: auto`,
  `align-content: start`, and a top padding of `calc(var(--mast-h) + var(--s-7))`.

### Named Rules

**Reserve The Masthead, Never Centre Past It.** The masthead is fixed at
`--mast-h: 4.6rem`. Every station pays for it in top padding. Content taller
than the viewport must start below it — vertically centring a tall block inside
a taller-than-screen section is what puts headings under the navigation.

**Furniture Opposite Its Copy.** A station's subject sits on the side of the
frame its panel does not occupy. The camera rule that achieves this is
counter-intuitive and documented in `Showroom.js`: a subject lands on the side
of the frame its camera-relative offset shares with the camera's right axis, so
to push a piece right you move the **look target** left of it, not the camera.

**Nothing Scrolls Sideways But A Schedule.** The eleven-row collection table may
overflow horizontally inside its own `overflow-x: auto` container. The page body
never does, at any width. Decorative overflow (the grain layer's negative inset)
is clipped rather than allowed to reach the document's scroll width.

## Elevation & Depth

Depth comes from real light, not from stacked shadows. The scene carries a
single shadow-casting directional key at a tight 1024 map, a warm hemisphere
ambient, a verdigris rim fill, two emissive practical lights (pendant and
bedside lamp), and painted radial contact shadows lying on the sheet under each
piece. Exposure is ACES filmic at 1.22; fog is `FogExp2` at 0.016 — light enough
that the drawing stays legible to the far edge.

### Shadow Vocabulary

| Token | Value | Purpose |
|---|---|---|
| `panel-lift` | `0 26px 60px -30px rgba(10, 6, 3, 0.85)` | The one DOM shadow: a copy panel lifting off the sheet. |
| `swatch-hover` | `0 8px 18px -8px rgba(10, 6, 3, 0.9)` | Swatch rising 2px on hover. |
| `focus-ring` | `0 0 0 3px rgba(143, 176, 160, 0.16)` | Field focus, paired with a verdigris border. |
| `swatch-selected` | `0 0 0 1px var(--umber-800), 0 0 0 3px var(--live)` | Selected upholstery, as a double rule not a glow. |

### Named Rules

**One DOM Shadow.** Panels get `panel-lift` and nothing else does. Everything
that looks three-dimensional on this page either is three-dimensional or is
drawn — there is no CSS bevel, emboss, or faked material anywhere, and there
must not be. Imitation material is the failure mode this world is most exposed
to, because it already contains real material.

**Vignette Is Not Contrast.** The `.stage__vignette` and `.stage__grain` layers
are atmospheric only, at 0.42–0.5 and 0.055 respectively. They were both dialled
back once because, stacked on the scene fog, they crushed the drawing they were
meant to frame.

## Shapes

**Radius zero, everywhere, with one exception.** This is a drafted sheet: panels,
buttons, fields, swatches and the schedule are all square. Circles are reserved
for markers — station numbers in the rail, in the panel margin, on the sheet, and
in the phone drawer. There is no middle radius in this system.

Corner ticks replace rounding as the framing device: every content panel carries
13px L-shaped `::before`/`::after` marks at its top-left and bottom-right in
`bone-500`, one pixel wide. Dimension terminators are slashes, not arrowheads.

## Components

### Buttons

Ruled rectangles, never pills. Mono label at `0.72rem` / `0.13em` tracking,
uppercase, `0.82rem 1.3rem` padding, 1px border. Primary is a tan fill that
brightens to `tan-300` on hover; ghost is transparent with a `tan-300` wipe that
travels in from the left at 12% opacity. Both carry a 20×10 arrow rule that
translates 4px on hover.

### Cards / Containers

There is one container: `.panel` (applied to `.room`, `.enquire`,
`.sheet-index`, `.workshop`). Near-opaque `rgba(24, 17, 12, 0.985 → 0.955)`
gradient, `blur(18px) saturate(115%)` backdrop, 1px hairline border, zero
radius, corner ticks, `panel-lift` shadow, `s-6` padding. **Any text block that
stands on the lit scene gets this ground** — that is the rule, not a per-case
decision. The hero and the lift are the two exceptions, and they use a soft
radial scrim instead, because a hard panel would hide the reveal.

### Inputs / Fields

Square, `rgba(20, 13, 8, 0.6)` fill, hairline border that goes `bone-500` on
hover and `live` on focus with a 3px verdigris ring. Label above in mono label
style; the optional hint inside a label drops to sentence case in `bone-500`.
Errors set `aria-invalid` and print in `alarm` beneath, in a slot that reserves
its height so nothing reflows.

### Navigation

Three surfaces, one vocabulary. The **masthead** is a fixed gradient bar with the
wordmark (a drawn scale-rule glyph over tracked caps), mono nav links with a
`tan-300` underline on hover, a ruled sheet-number box, and the account stamp.
The **station rail** is a fixed left column of circled mono numbers whose label
slides in on hover or when active. The **phone drawer** replaces the nav row
below 820px as the sheet's own index: circled markers against large Archivo
caps, escape-to-close, focus returned to its button.

### Preloader — The Sheet Drawing Itself

The page's opening beat, and the only component whose styles are inline in the
document head rather than in the bundle: a preloader that waits for the
stylesheet it is styled by is a blank screen with extra steps.

Umber ground, the four rooms of the real plan stroking themselves in as bone
linework via `stroke-dashoffset` on `pathLength="1"`, the verdigris circulation
path fading up behind them, and beneath that the wordmark over a **dimension
string** — a hairline rule with slash terminators, a tan fill, the current stage
at one end and the figure at the other.

**It leaves by handing over, not by uncovering.** Its ground is `#2a1e16` —
`--umber-800`, the page's own background, to the byte — so there is nothing
behind the loader to hide and nothing to slide out of the way. The exit is three
overlapping phases:

| Phase | At | What moves |
| --- | --- | --- |
| Hold | 0 ms | Nothing. One beat on the completed drawing, so the figure reaching 100 is seen rather than inferred. |
| The drawing comes off | +320 ms | Linework and wordmark fade and rise ~1 rem. The ground stays. The page unlocks, and the first viewport starts its own entrance on this frame. |
| The ground clears | +700 ms | The ground fades over 720 ms onto a sheet that is already lit, already rendered, and already animating. |

Earlier it slid the whole full-viewport slab up 101%. With identical ground on
both sides of the seam, the eye read nothing but type and rules being yanked
across the frame — the one motion the page makes nowhere else.

Five rules it must keep, each of them a defect that was caught and fixed:

**Progress is measured, not performed.** Every step is a real milestone —
module evaluated, fonts resolved, scene assembled, shaders compiled, first frame
drawn. There is no timer imitating a download.

**The label is derived from the figure, never from the milestone.** On a warm
load every milestone fires inside 100 ms while the eased figure is still at 18,
and a loader reading "Ready" beside "18%" is what makes a progress indicator
feel invented.

**Easing is time-based, not per-frame.** The main thread is genuinely blocked
while the scene is built and the shaders compile, so only a handful of frames
run; a per-frame lerp leaves the figure stranded for exactly as long as the work
takes.

**The page's entrance overlaps the exit.** The reveals are not observed until
the loader says it is leaving. Started when the scene was built, they ran and
finished behind an opaque loader, and the hand-off then uncovered a first
viewport that had already stopped moving — which is what made the exit read as a
shutter regardless of how it was animated.

**Only the ground's own fade ends the loader.** `transitionend` bubbles, so an
unfiltered listener on the root was fired by the drawing's fade finishing inside
it, hiding the ground 457 ms into its 720 ms fade — a pop from roughly 40%
opacity straight to nothing. Filter on `e.target` **and** `e.propertyName`, and
set the belt-and-braces timeout comfortably longer than the fade, or a busy main
thread makes the backstop truncate the very transition it exists to protect.

A minimum visible duration of 1.9 s is a deliberate opening beat, not padding —
it is declared as such in the source and skipped entirely under reduced motion,
because holding someone who asked for less movement is just a delay. A failsafe
at 9 s, an error path, and a no-WebGL path all dismiss it. **A visitor must
never be able to get stuck behind this.**

### Signature Component — Projected Annotation

The system's distinctive element. A crisp DOM label, positioned every frame from
a `Vector3` anchor in the 3D scene, connected to its point by a leader rule and
a verdigris dot. Two lines: a mono value in `bone-100` and a tracked caps unit in
`bone-300`, on a `rgba(20,13,8,0.82)` blurred ground. Four side variants
(`up` / `down` / `left` / `right`) control which way the leader runs.

Rules it must keep: annotations are **DOM text, never texture**, so they stay
crisp at any zoom and reach assistive technology. They stagger in at 110ms
intervals when a station becomes active. They suppress themselves when their
projected point falls inside the active copy panel's rect plus 24px. And they
are removed entirely below 700px, where they would cover the furniture they
describe — every value they carry also appears in a spec list.

## Do's and Don'ts

### Do:

- Let light carry the composition. This palette is narrow on purpose; reach for
  a lamp, a pool, a rim, before reaching for another colour.
- Give every text block that sits on the scene the panel ground, or the scrim.
- Set every measurement in Martian Mono with tabular figures.
- Keep radius at zero and use corner ticks and circled markers for framing.
- Theme the browser's own surfaces — selection, caret, scrollbar, focus ring,
  underline offset — from the palette. On a page this committed, a default
  scrollbar is the loudest thing on screen.
- Drive reveals from `IntersectionObserver`, and apply the hidden state from
  script so a page whose JavaScript never arrives still reads in full.
- Honour `prefers-reduced-motion` by making the page *still*, not lesser: the
  camera snaps to each station, Lenis never loads, and no scroll is hijacked.

### Don't:

- Don't let a second element go tan. The furniture is the only lit thing.
- Don't fake material. No CSS bevels, embossing, or imitation texture — this
  world renders real material, so a fake one reads as a forgery.
- Don't add a kicker or eyebrow above a heading. Station numbers belong in the
  margin as plan markers, in the rail, or on the sheet — never as a label
  stacked over a heading.
- Don't introduce a middle radius, a pill, or a rounded card.
- Don't use monospace for prose.
- Don't make a copy panel translucent enough to read the scene through. It was
  tried at 0.9 and the specification list became guesswork.
- Don't pin a table header inside a horizontal scroller. `.index-scroll` needs
  `overflow-x: auto` for the table's 46rem minimum width, and that makes the
  wrapper the scrollport — so a sticky `thead` sticks to the wrapper, and the
  `top: var(--mast-h)` meant to clear the fixed masthead instead offsets it
  4.6rem DOWN into the body and parks it across row two. Offsetting by zero
  only moves the same bug to the top of the table. This one regressed once
  after being fixed, so it is worth stating as a rule: a header that must
  clear a fixed masthead cannot be sticky inside a horizontal scroller. The
  schedule is eleven rows; letting it scroll away costs nothing.
- Don't use `ScrollTrigger` to reveal a `position: sticky` element. Its start
  measurement is unreliable there, which left whole panels at opacity 0.
- Don't let a loading indicator claim a figure the work has not reached, and
  never let one become inescapable. Derive its label from what is on screen,
  ease it on real time, and give it a failsafe.
- Don't clamp a progress figure at one end only. The preloader's easing takes
  `dt` from a rAF timestamp on some calls and `performance.now()` on others; a
  single negative `dt` inverts the easing factor, drives the figure away from
  its target, and it rendered **"-36%"**. Clamp the delta at both ends and
  bound the figure itself to 0–1.
- Don't animate `filter: blur()` on entrance. It was in the reveals at 7px, and
  on a `display--xl` headline it pushed the first animated frame of the whole
  hand-off from 631 ms to 1710 ms after the class landed — every transition on
  screen, the loader's own exit included, sat frozen while the blur allocated
  its layers. Entrances animate `opacity` and `transform` only.
- Don't reveal a loader by sliding it off when its ground already matches the
  page's. There is no seam to cover, so all the visitor sees is the loader's
  own content being thrown across the frame. Dissolve it in place and let the
  page animate up through it.
- Don't lock scroll without `scrollbar-gutter: stable`. The scrollbar goes for
  the length of the load and comes back at the hand-off, sliding every line of
  the first viewport sideways at the exact moment it is being looked at.
