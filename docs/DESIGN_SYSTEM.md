# H.O.M.E. Design System

**Status:** Active  
**Standard:** Maintained gray/blue operational shell with scoped identity heroes  
**Token source:** `src/index.css`, mapped by `tailwind.config.js`

## 1. Page purpose and authority

Root `AGENTS.md`, this system and the user's approved visual brief govern UI work. Supporting design skills adapt to that purpose. A successful static check does not establish visual quality or authentication security.

Operational modules use the established application shell, predictable navigation, compact actions and readable data-dense layouts. Density 7–8 is an operational starting point; readability, keyboard access and the task take precedence over packing more content into a page.

Login (`/login`) and hub (`/hub`) are the approved locations for a lazy-loaded WebGL identity hero. An approved composition may use larger display typography, purposeful lighting, material depth and continuous hero movement. Credential fields, labels, validation and primary actions stay stationary and readable. Operational type scales and density targets do not impose a ceiling on an identity hero.

The [premium 3D login brief](tasks/LOGIN-DESIGN-BRIEF-20261013.md) records a future review direction. The current token repair does not implement that redesign or select a new visual composition. Navy/slate foundations and cyan/teal identity lighting are optional scoped directions only after visual-brief approval; they must not silently recolor operational modules.

Keep WebGL within the approved hero boundary and behind dynamic imports. Feature modules use CSS surfaces and elevation. When reduced motion, unavailable WebGL or a scene-load/render failure prevents the hero, provide a static visual with a complete usable form. Verify lazy-chunk isolation and fallback behavior rather than assuming them from file placement.

## 2. Maintained palette and theme contract

The existing neutral and System Blue palette remains the operational source of truth. `.dark` selects the dark token overrides, matching Tailwind's class-based theme configuration.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg-canvas` | `#f5f5f7` | `#000000` | Page canvas |
| `--bg-surface` | `#ffffff` | `#1c1c1e` | Panels and controls |
| `--bg-subtle` | `#f0f0f2` | `#2c2c2e` | Secondary surfaces |
| `--bg-elevated` | `var(--bg-subtle)` | `var(--bg-subtle)` | Floating surface fill |
| `--text-primary` | `#1d1d1f` | `#f5f5f7` | Primary text |
| `--text-secondary` | `#424245` | `#a1a1a6` | Secondary text |
| `--text-muted` | `#86868b` | `#86868b` | Supporting text; verify actual contrast |
| `--accent-base` | `#0071e3` | `#2997ff` | Primary actions |
| `--border-default` | Black at 8% | White at 12% | Resting hairline borders |
| `--border-interactive` | System Blue at 30% | System Blue at 30% | Interactive border emphasis |

`--accent-teal` is a supplementary existing-palette hue (`#14b8a6` light / `#2dd4bf` dark), not a replacement primary action color. Reserve success, caution and critical colors for real status. Use the existing sans stack for operational text, tabular numerals for comparable values and a coherent display hierarchy for approved identity surfaces.

### Semantic opacity utilities

Keep complete color variables such as `--bg-surface` and `--border-default` usable by existing CSS consumers. Their parallel `-rgb` variables hold space-separated RGB channels in each theme; translucent tokens also have an `-alpha` value. Update these pairs together when a palette change is approved.

The `semanticColor` helper preserves the complete variable for a base utility. Slash modifiers use the channel variable and attenuate the token's original alpha:

- `bg-surface` remains `var(--bg-surface)`; `bg-surface/90` uses 90% surface opacity.
- `border-border-default/60` uses 60% of the token's existing opacity: 4.8% black in light and 7.2% white in dark. It does not become a 60%-opaque border.
- `bg-accent-subtle/50` halves the existing 8% light / 16% dark accent wash.
- `focus:ring-accent-base/20`, gradient stops and dark/pseudo-class variants use the same contract.
- The `8` opacity step supports existing `bg-accent-decor/8`; arbitrary slash values remain available.

This attenuation contract applies to semantic tokens. Built-in Tailwind literal colors retain Tailwind's normal opacity behavior. Prefer explicit slash modifiers over separate legacy color-opacity utilities for semantic colors.

## 3. CSS elevation

Both themes define `--elevation-1`, `--elevation-2` and `--elevation-3`. Light shadows remain restrained; dark shadows use the documented stronger depth values. The exact values live in `src/index.css`.

| Level | Tailwind utility | Compatibility alias | Purpose |
| --- | --- | --- | --- |
| 1 | `shadow-elevation-1` | `--shadow-surface` | Resting panels and controls |
| 2 | `shadow-elevation-2` | `--shadow-elevated` | Interactive lift and emphasis |
| 3 | `shadow-elevation-3` | `--shadow-modal` | Floating overlays |

`--shadow-card-3d` aliases level 2 for existing consumers. `--border-elevated` aliases the stronger theme border. Shadows and hairline borders may coexist where they clarify the surface hierarchy; there is no universal ban on resting shadows. Scene lighting/materials provide hero depth independently of CSS panel shadows.

## 4. Control motion and interaction states

Use 150–250ms control transitions, with `cubic-bezier(0.16, 1, 0.3, 1)` for deceleration where appropriate. Animate `transform` and `opacity` for movement; do not animate width, height, margins or padding. Subtle hover lift and `scale(0.98)` press feedback should clarify a real interaction without shifting surrounding content.

Approved continuous hero movement is a separate category: choose its pace to reveal volume or respond to attention, provide an accessible pause control and stop movement under reduced motion. Reduced-motion handling must cover JavaScript animation as well as CSS; the CSS duration override alone does not stop a WebGL/Framer animation loop.

Style the states each control actually has:

1. Default: clear surface, legible label and appropriate border.
2. Hover: restrained emphasis for pointer users.
3. Focus-visible: visible keyboard focus with sufficient contrast and offset; verify the rendered ring in both themes.
4. Active/pressed: immediate feedback without moving adjacent content.
5. Disabled, where applicable: clear unavailable state, no active hover effect and correct semantics.
6. Loading, where applicable: stable dimensions and an accessible announcement; a labeled spinner is valid for an action, a skeleton for loading content.

Do not invent disabled/loading states merely to satisfy a checklist. Preserve explicit loading, empty, error and success feedback in data-facing screens.

## 5. Existing primitives and evidence

Reuse the established application shell and existing UI entry points. `Surface` supplies elevation levels, `Button` supplies action variants, `DataTable` supports operational density, `PageHeader` supplies page hierarchy and `ThemeToggle` supplies theme presentation. Extend these within their assigned ownership rather than introducing a parallel design system.

Acceptance checks follow the affected behavior:

- Compile semantic base/alpha/gradient/focus utilities and resolve color/shadow variables in both themes. Preserve existing base palette values when fixing the contract.
- Retain actual browser evidence tied to revision or working-tree snapshot, theme, CSS viewport, zoom/device scale and motion setting. Capture relevant responsive layouts, keyboard focus and computed contrast. Missing evidence is unverified.
- For hero changes, demonstrate motion/pause, reduced motion, WebGL/scene failure and lazy-chunk isolation. Use the approved brief's viewport and visual criteria.
- Run applicable static checks and build/test gates; record skipped checks with a reason. The build workflow generates release files, so coordinate its outputs under the task's allowed paths.
- Static rule checks and screenshots do not certify authentication, tenant boundaries, RLS or audit behavior. Backend and QA owners provide those acceptance checks when affected.
