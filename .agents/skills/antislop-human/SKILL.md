---
name: antislop-human
description: "Verify H.O.M.E. readability, contrast, keyboard operation, focus, states, zoom, mobile form access and reduced-motion behavior in affected UI."
---

# Accessibility and human use

This is self-contained local guidance. Follow root AGENTS.md, docs/DESIGN_SYSTEM.md and applicable acceptance criteria; no absent antislop core, mobile skill or contrast script is required.

## Contrast

For WCAG AA text, use at least 4.5:1 for normal text and 3:1 for large text. Large text means at least 18pt regular (24 CSS px) or 14pt bold (about 18.67 CSS px), with attention to thin/unusual fonts. Do not classify all 18px text as large.

Compare the full-precision computed ratio to the threshold; round only the displayed result. For example, 4.499:1 fails a 4.5:1 requirement. Verify the effective foreground/background, including opacity compositing and the worst position over an image or gradient.

For a solid sRGB pair:
1. Convert each channel to 0-1. Linearize with c/12.92 when c <= 0.04045; otherwise ((c+0.055)/1.055)^2.4.
2. L = 0.2126R + 0.7152G + 0.0722B.
3. Ratio = (lighter L + 0.05)/(darker L + 0.05).

Required non-text information and essential component/focus boundaries need the applicable 3:1 contrast against adjacent colors. Account for WCAG exceptions such as inactive controls and equivalent visible information instead of requiring every decorative border to pass. Pair status color with text, shape or an icon.

Reference: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Operation and layout

- Preserve semantic labels, logical DOM/tab order, keyboard activation and visible focus in every theme. Do not remove a browser outline without a replacement. Check dialogs' focus management and Escape behavior where applicable.
- Keep important fields and actions readable and reachable when zoomed to 200%, at narrow widths and with the on-screen keyboard. Reflow ordinary content; document inherently two-dimensional data exceptions.
- Give data views applicable loading, empty and error states with understandable text. Accessible labeled spinners are allowed; use skeletons when they clarify loading content.
- Keep sign-in controls stationary and usable while an approved hero moves. Provide pause and reduced-motion/static fallback for continuous movement; verify JavaScript/canvas behavior as well as CSS.
- Check actual rendered focus, contrast, zoom and motion. Source rules or a build alone do not prove accessibility.

BabyAaralyn records the relevant observations and limits; Amri accepts the evidence. Route UI fixes to Babyluong and authorization/data changes to BabyHien.
