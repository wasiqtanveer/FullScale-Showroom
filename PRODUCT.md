# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Vite + vanilla Three.js + GSAP (ScrollTrigger) + Lenis. Chosen for a fast, beautiful mock: HMR is necessary to tune a 3D scene iteratively, dependencies are installed locally (user authorized installing 3D libraries), there is no framework lock-in, and `vite build` emits a static folder that deploys anywhere. Scalability decisions (framework, CMS, routing) are explicitly deferred until the mock is approved.

## Users

Primary: a design-conscious shopper furnishing a home, browsing on desktop or phone, deciding whether this brand's furniture is worth their money and their room. They are comparing feel and craft, not spec sheets.

Immediate audience for this deliverable: the furniture brand's own stakeholders, reviewing a mock to approve a direction before production work begins.

## Product Purpose

A furniture brand's landing page. Success is the stakeholder approving the direction, and — once real, a visitor moving from "this looks beautiful" to browsing the collection.

## Positioning

Undecided (brand has not supplied it). The mock carries invented placeholder positioning that must be replaced with the brand's real claim before launch. Do not treat any copy in the build as approved brand language.

## Operating Context

Single-page marketing surface. Desktop-first attention with full phone support. Must run smoothly on integrated graphics and mid-range phones — the brief explicitly asks for 3D that is not heavy.

## Capabilities and Constraints

- Single landing page; no backend, no cart, no auth. The LOGIN and GET APP affordances in the reference are visual only.
- Furniture is modeled procedurally in Three.js (user's choice). Stylized and soft-lit, not photoreal. No GLB downloads, no product photography.
- Performance is a hard constraint, not a preference: low-poly geometry, no post-processing stacks that tank fill rate, capped DPR, motion paused when offscreen, and a reduced-motion path.
- Undecided and must not be fabricated as fact: brand name, product names, prices, locations, contact details, app availability.

## Brand Commitments

None binding yet. The user supplied two visual references (a warm tan-leather minimal hero; a cream/forest-green/mustard editorial layout with chunky uppercase display type) and named thaum.xyz as a craft benchmark. These are direction inputs, not identity locks, and the user explicitly does not want a literal copy of either.

## Evidence on Hand

No real content: no photography, no 3D models, no testimonials, no press, no pricing, no customer names. All copy and figures in the mock are placeholder and are labeled as such to the user. Nothing may be presented as a real claim about the brand.

## Product Principles

1. Warmth over contrast. The surface must be soft on the eyes; this is a comfort product and the page should feel like the room it sells.
2. Motion must be felt, not watched. Animation serves the sense of craft and material; anything that delays understanding or costs frames is cut.
3. Craft is in the small things. Weight, spacing, easing, and light do the persuading — not effects volume.
4. Placeholder content stays visibly placeholder. The brand has not decided its claims; the mock must never harden invented copy into apparent fact.
5. Approval-ready, not throwaway. A mock the brand can look at and say yes to, built so the yes is worth something.

## Accessibility & Inclusion

No brand standard established. Baseline required regardless: `prefers-reduced-motion` honored with a genuinely static fallback, text contrast held on the warm low-contrast palette, full keyboard reachability, and no information conveyed by the 3D scene alone.
