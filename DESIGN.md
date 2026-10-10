# H.O.M.E. Design System Specification (DESIGN.md)

**System:** Hospital Operation Management Ecosystem (H.O.M.E.)  
**Aesthetic Archetype:** Clinical Operational (Linear-grade precision meets Vercel Geist data density & GOV.UK clarity)  
**Target Environment:** 24/7 Clinical Wards, Pharmacy Counters, Hospital Logistics, High-stress Emergency Desks  
**Governing Standard:** WCAG 2.1 AA Compliant, Zero Artificial Slop, 100% Real Database Visibility  

---

## 1. Core Principles

1. **Information Density over Decorative Air**: Healthcare professionals need high situational awareness with minimal unnecessary scrolling. Compact row heights, crisp hairline dividers, and monospaced numbers.
2. **One Deliberate Accent**: Accent color is reserved strictly for primary interactive actions and active navigation states. No neon teal/purple washes, no ambient radial glow blobs.
3. **Semantic Integrity (Strict Status Rule)**: Red/Rose is ONLY for medical breaches or safety warnings; Amber is ONLY for pending approvals or near-expiry stocks; Green is ONLY for verified active status. Status colors are NEVER used as decorative card backgrounds.
4. **Elevation via Hairline Insets, Not Soft Clouds**: Cards sit grounded on the surface plane with `1px` subtle borders (`border-default`). Soft drop shadows are reserved exclusively for elevated overlays (dialogs, dropdown menus, flyovers).
5. **No AI Clichés**: No generic blue-to-cyan gradient text, no floating bento grids without purpose, no decorative blueprint grids, no gratuitous glassmorphism blur stacks.
6. **Zero Mock Policy**: Every badge, stat, count, and status badge must query and render real Supabase records or render an authentic empty state ("Tiada Rekod Dijumpai").

---

## 2. Color Palette & Semantic Tokens

### 2.1 Theme Support (Light Default + Dark Mode)
The system defaults to a crisp, high-contrast **Light Mode** suitable for hospital fluorescent lighting, with a fully supported **Dark Mode** toggle for night shifts.

```css
/* LIGHT THEME (Default) */
:root {
  --bg-canvas: #f8fafc;          /* Slate 50: clean hospital desk background */
  --bg-surface: #ffffff;         /* Pure White: cards, modals, table rows */
  --bg-subtle: #f1f5f9;          /* Slate 100: table headers, input backgrounds */
  --bg-muted: #e2e8f0;           /* Slate 200: disabled surfaces, chip fills */
  --bg-inset: #f8fafc;           /* Inset areas */

  --border-default: #e2e8f0;     /* Slate 200: crisp 1px borders */
  --border-subtle: #cbd5e1;      /* Slate 300: input borders */
  --border-strong: #94a3b8;      /* Slate 400: active/hovered borders */

  --text-primary: #0f172a;       /* Slate 900: primary headings, high contrast (14:1) */
  --text-secondary: #334155;     /* Slate 700: labels, body text (7:1) */
  --text-muted: #64748b;         /* Slate 500: captions, timestamps, hints (4.5:1 AA) */
  --text-disabled: #94a3b8;      /* Slate 400 */

  /* Operational Accent (MOH Medical Teal) */
  --accent-base: #0f766e;        /* Teal 700: solid buttons, active links */
  --accent-hover: #0d9488;       /* Teal 600 */
  --accent-active: #115e59;      /* Teal 800 */
  --accent-subtle: #ccfbf1;      /* Teal 100: active item background */
  --accent-foreground: #ffffff;  /* High contrast text on accent */

  /* Status Colors */
  --status-success: #059669;     --status-success-bg: #ecfdf5;   --status-success-border: #a7f3d0;
  --status-warning: #d97706;     --status-warning-bg: #fffbeb;   --status-warning-border: #fde68a;
  --status-danger: #dc2626;      --status-danger-bg: #fef2f2;    --status-danger-border: #fecaca;
  --status-info: #0284c7;        --status-info-bg: #f0f9ff;      --status-info-border: #bae6fd;
}

/* DARK THEME (Night Shift) */
.dark {
  --bg-canvas: #090d16;          /* Deep slate charcoal (not pure pitch black) */
  --bg-surface: #0f172a;         /* Slate 900: primary cards */
  --bg-subtle: #1e293b;          /* Slate 800: input fills, table headers */
  --bg-muted: #334155;           /* Slate 700: disabled, tags */
  --bg-inset: #090d16;

  --border-default: #1e293b;     /* Slate 800 */
  --border-subtle: #334155;      /* Slate 700 */
  --border-strong: #475569;      /* Slate 600 */

  --text-primary: #f8fafc;       /* Slate 50 */
  --text-secondary: #cbd5e1;     /* Slate 300 */
  --text-muted: #94a3b8;         /* Slate 400 */
  --text-disabled: #64748b;      /* Slate 500 */

  /* Operational Accent in Dark */
  --accent-base: #14b8a6;        /* Teal 500 */
  --accent-hover: #2dd4bf;       /* Teal 400 */
  --accent-active: #0f766e;      /* Teal 700 */
  --accent-subtle: rgba(20, 184, 166, 0.12);
  --accent-foreground: #042f2e;

  /* Status Colors in Dark */
  --status-success: #34d399;     --status-success-bg: rgba(5, 150, 105, 0.15);   --status-success-border: rgba(52, 211, 153, 0.3);
  --status-warning: #fbbf24;     --status-warning-bg: rgba(217, 119, 6, 0.15);    --status-warning-border: rgba(251, 191, 36, 0.3);
  --status-danger: #f87171;      --status-danger-bg: rgba(220, 38, 38, 0.15);     --status-danger-border: rgba(248, 113, 113, 0.3);
  --status-info: #38bdf8;        --status-info-bg: rgba(2, 132, 199, 0.15);       --status-info-border: rgba(56, 189, 248, 0.3);
}
```

---

## 3. Typography Scale & Fonts

- **Primary UI Font**: `Geist Sans`, `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Tabular / Monospace Font**: `Geist Mono`, `JetBrains Mono`, `ui-monospace`, `monospace` (Used for: Staff IDs, IC Numbers, Key Numbers, Batch Numbers, Dosages, Temperatures, Audit Timestamps)

### Scale
- **Display (32px / Leading 1.15)**: `font-bold tracking-tight` (Main login system title)
- **H1 (24px / Leading 1.25)**: `font-semibold tracking-tight` (Module title)
- **H2 (20px / Leading 1.3)**: `font-semibold tracking-normal` (Section headers)
- **H3 (16px / Leading 1.4)**: `font-medium tracking-normal` (Card headers, modal titles)
- **Body Standard (14px / Leading 1.5)**: `font-normal` (Form inputs, table rows, descriptions)
- **Caption / Table Header (12px / Leading 1.4)**: `font-medium tracking-wider uppercase`
- **Micro Badge (11px / Leading 1.2)**: `font-semibold tracking-wider font-mono`

---

## 4. Component Microstates Specification

Every interactive primitive (Button, Input, Card, Link, Select) MUST implement all 6 states:
1. **Default**: Crisp hairline border, semantic background, readable text.
2. **Hover**: Border darkens/lightens by 1 step (`--border-strong`), subtle brightness shift, cursor-pointer.
3. **Focus-Visible**: Clean 2px ring offset (`ring-2 ring-teal-500/50 ring-offset-2 ring-offset-canvas`). Never strip focus outline.
4. **Active (Pressed)**: Slight scale down (`active:scale-[0.98]` or `active:translate-y-[0.5px]`).
5. **Disabled**: Opacity 50%, `cursor-not-allowed`, no hover background change.
6. **Loading**: Content replaced by spinner or shimmer skeleton, layout dimensions preserved (no layout shift).

---

## 5. Layout & Surface Hierarchy

- **Shell Header**: 56px–64px height, pinned top, crisp `border-b border-default`, background `bg-surface/95 backdrop-blur-md`. Left: Official Jata Negara + H.O.M.E. text + Active Module. Right: Theme toggle, Language switcher, Notifications, Real User avatar.
- **Sidebar**: 240px expanded, 64px collapsed. Grounded background, clear active indicator (3px left accent bar or subtle fill + accent icon).
- **Module Hub**: Clean category sections (Clinical & Pharmacy, Logistics & Inventory, Administration & Governance). Dense, scannable cards displaying Module Code, Full Name, 1-line mission description, and live operational availability. Real-time search filter with `⌘K` or `/` quick key.

---

## 6. Motion Standards

- **Modal & Dialog Open**: `opacity: 0 -> 1`, `scale: 0.98 -> 1`, 150ms `ease-out`.
- **Drawer / Flyout**: `translateX: 100% -> 0%`, 200ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- **List / Table Row Entry**: 80ms stagger, `opacity: 0 -> 1`, `translateY: 4px -> 0px`.
- **Reduced Motion**: All animations disabled or replaced with immediate opacity cross-fades when `@media (prefers-reduced-motion: reduce)` is active.
