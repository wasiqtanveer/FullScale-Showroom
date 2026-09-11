/**
 * All authored content in one place.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER NOTICE — for the brand, not for the visitor.
 * Piece names, dimensions, materials and lead times below are authored design
 * material for this mock. They are internally consistent and drawn to scale in
 * the 3D plan, but none of them is a claim about a real product. No prices,
 * customers, testimonials, press, addresses or stock figures appear anywhere on
 * this page, deliberately: those are the brand's to supply, and inventing them
 * would harden fiction into apparent fact. Replace this file's contents with
 * real specifications before the page goes anywhere public.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const COLLECTION = [
  { ref: 'S-01', name: 'The Ovett three-seat', room: '01 Living', dims: '2180 × 940 × 720', material: 'Aniline hide, ash', lead: '9 weeks' },
  { ref: 'S-01b', name: 'The Ovett two-seat', room: '01 Living', dims: '1620 × 940 × 720', material: 'Aniline hide, ash', lead: '9 weeks' },
  { ref: 'A-02', name: 'The Ovett chair', room: '01 Living', dims: '900 × 880 × 760', material: 'Aniline hide, ash', lead: '7 weeks' },
  { ref: 'T-03', name: 'The Stead low table', room: '01 Living', dims: '1100 × 600 × 380', material: 'Oak, blacked steel', lead: '5 weeks' },
  { ref: 'D-04', name: 'The Marlow refectory', room: '02 Dining', dims: '2400 × 950 × 740', material: 'European oak', lead: '11 weeks' },
  { ref: 'C-04b', name: 'The Marlow spindle chair', room: '02 Dining', dims: '440 × 420 × 890', material: 'Ash, cloth seat', lead: '6 weeks' },
  { ref: 'P-04c', name: 'The Hale three-drop', room: '02 Dining', dims: '1240 × 120 × 1100', material: 'Brass, opal glass', lead: '4 weeks' },
  { ref: 'B-05', name: 'The Wren bed', room: '03 Rest', dims: '2050 × 1620 × 380', material: 'Ash, webbed base', lead: '10 weeks' },
  { ref: 'N-06', name: 'The Wren stand', room: '03 Rest', dims: '450 × 420 × 560', material: 'Oak, brass pull', lead: '5 weeks' },
  { ref: 'W-07', name: 'The Quill desk', room: '04 Work', dims: '1600 × 700 × 735', material: 'Oak, ash legs', lead: '8 weeks' },
  { ref: 'L-08', name: 'The Quill shelf', room: '04 Work', dims: '900 × 340 × 1800', material: 'Ash, oak back', lead: '8 weeks' },
];

/** Station order. Must match the DOM order of [data-station] sections. */
export const STATION_ORDER = [
  'threshold',
  'lift',
  'living',
  'dining',
  'rest',
  'work',
  'sheet',
  'workshop',
  'enquire',
];

export const SHEET_LABEL = {
  threshold: '01',
  lift: '01',
  living: '01',
  dining: '02',
  rest: '03',
  work: '04',
  sheet: '—',
  workshop: 'W',
  enquire: '00',
};
