# DESIGN.md — Zig Design Quick Reference

Full design system: `docs/ux/design-system.md`. This file is a quick-reference for anyone
(or any Claude Code session) jumping straight into UI work without reading the full doc
tree first.

## Tokens at a glance

```
ink         #15202B   primary dark surface
paper       #F2F0E8   primary light surface
paper-2     #FAFAF7   card background on paper
amber       #D9A441   attention accent — gaps, flags, primary CTA
teal        #3E6B64   structure accent — healthy/confirmed states
ink-muted   #5B6472   secondary text on light
paper-muted #9AA5B1   secondary text on dark
border      #DEDACE   hairline borders on light surfaces
```

- **Display type**: Space Grotesk
- **Body type**: Work Sans
- **Utility/data type**: IBM Plex Mono (scores, framework codes, record IDs, timestamps)
- **Signature element**: the lifecycle rail — Create → Analyze → Recommend → Act →
  Measure → Report as a vertical pulse on the landing page, compact horizontal version
  in-app.
- **Color meaning is fixed**: amber always means "needs attention," teal always means
  "structurally sound." Don't repurpose either color decoratively.
- **No empty states, ever.** Every component has a populated, AI-suggested, or
  next-action variant.

See `docs/ux/design-system.md` for the full rationale, type scale, spacing scale,
component philosophy, motion rules, and accessibility floor.
