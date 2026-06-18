# Design System — Zig

> This is the canonical design system. The landing page in `/landing-page` and the
> in-app design tokens for Fable 1 should both derive from these tokens rather than
> re-deriving their own.

## Why this direction

Zig's subject matter is a governance ledger: assets, risks, controls, evidence — the kind
of register an auditor would actually sign off on. The design direction leans into that:
an ink-navy "ledger" surface, a warm paper neutral for working screens, a restrained amber
accent used specifically to mean "needs attention" (a flagged item, a gap, a score moving
in the wrong direction), and a quiet teal used for structure and confirmed/healthy states.
This is deliberately not the warm-cream-and-serif look, not a near-black-with-neon-accent
look, and not a hairline-newspaper look — those are common AI-generated defaults and none
of them fit a product whose whole pitch is "a living ledger, not a static checklist."

## Color

| Token | Hex | Use |
|---|---|---|
| `ink` | `#15202B` | Primary dark surface (nav, footer, "core data model" framing, headers on dark) |
| `paper` | `#F2F0E8` | Primary light surface / page background |
| `paper-2` | `#FAFAF7` | Subtle secondary light surface, card backgrounds on `paper` |
| `amber` | `#D9A441` | Attention accent — gaps, flagged items, declining score, primary CTA |
| `teal` | `#3E6B64` | Structure accent — confirmed/healthy states, secondary actions, engine framing |
| `ink-muted` | `#5B6472` | Secondary text on light surfaces |
| `paper-muted` | `#9AA5B1` | Secondary text on dark surfaces |
| `border` | `#DEDACE` | Hairline borders on light surfaces |

Amber and teal are never used decoratively — amber always signals "this needs action,"
teal always signals "this is structurally sound." That mapping should hold everywhere in
the product, not just on the landing page.

## Typography

- **Display** — Space Grotesk. Geometric, slightly technical, used for headlines and
  section titles. Used with restraint: large sizes, normal tracking, never for body copy.
- **Body** — Work Sans. Humanist, highly legible at small sizes, used for all UI copy,
  descriptions, and long-form content.
- **Utility / data** — IBM Plex Mono. Used specifically for things that read like ledger
  data: governance scores, framework codes (e.g. `ISO27001`, `SOC2-CC6.1`), record IDs,
  timestamps. This is what makes the product feel like a real register rather than a
  generic dashboard.

Type scale (rem, 16px base): `0.75` caption/mono · `0.875` body-small · `1` body ·
`1.25` body-large/lede · `1.75` h3 · `2.25` h2 · `3` h1 · `3.75` display (landing page only).

## Spacing

4px base unit. Scale: `4, 8, 12, 16, 24, 32, 48, 64, 96`. Section padding on the landing
page and major app views uses `64`/`96`; component-internal spacing stays at `8`–`24`.

## Signature element: the lifecycle rail

The one element this product should be remembered by is a vertical "lifecycle rail" — six
labeled nodes for Create → Analyze → Recommend → Act → Measure → Report, connected by a
line with a traveling pulse of light. It appears full-size as the landing page's hero
visual, and a compact horizontal version of it appears in-app as the persistent indicator
of where a given record sits in its lifecycle. It is the one place the design "performs" —
everything else (forms, tables, cards) stays quiet and disciplined so the rail stands out.

## Components (philosophy, not full inventory — full inventory is a Fable 1 deliverable)

- Cards: `paper-2` background, `1px` `border`, `10px` radius, no drop shadow at rest —
  shadow only appears on hover/focus to signal interactivity, not as ambient decoration.
- Status/severity tags: solid-fill chips using `amber` (attention) or `teal` (healthy),
  white text, set in the mono utility face for an audit-tag feel.
- Primary action: `amber` fill, `ink` text, no gradient.
- Secondary action: `ink`-bordered, transparent fill.
- Empty states: never a literally empty card — always demo content, an AI-generation
  prompt, or a suggested next action rendered in place of the missing data (see
  `navigation.md` and `empty-states.md`).

## Motion

Motion is used in exactly two places by default: the lifecycle rail's traveling pulse
(ambient, slow, always-on — it's the signature, so it earns continuous motion) and a brief
score-change animation when the governance score updates after an action. Everything else
(hover states, page transitions) should be fast and minimal. Respect `prefers-reduced-motion`
by freezing the rail's pulse and disabling the score animation.

## Accessibility floor

Responsive down to mobile width, visible keyboard focus rings using the `amber` token at
2px, color is never the only signal for severity (pair every amber/teal tag with a label,
not just a color), and all of the above motion respects `prefers-reduced-motion`.
