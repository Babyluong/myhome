# H.O.M.E. Modern Depth Design System

**Status:** Active  
**Standard:** Modern Clinical Depth + Hybrid 3D  
**Target:** Hospital Operation Management Ecosystem (H.O.M.E.)

---

## 1. Core Philosophy & Architectural Boundaries

H.O.M.E. is a mission-critical hospital operation platform requiring **high information density (TasteSkill Density 7–8)**, clinical precision, and instant responsiveness.

### The Hybrid 3D Principle
1. **Isolated WebGL Heroes**: Real-time 3D (React Three Fiber / Three.js) is strictly confined to:
   - Pengesahan & Log Masuk (`/login`)
   - Module Hub & Landing (`/hub`)
2. **Lazy-Loaded Boundaries**: 3D components must be lazy-loaded (`React.lazy`) behind dynamic imports to prevent bloat in enterprise module bundles.
3. **Graceful Fallbacks**: When WebGL is unavailable or when `prefers-reduced-motion: reduce` is active, the system automatically falls back to lightweight multi-layered CSS depth surfaces.
4. **CSS Depth Across All Modules**: All 21 functional operational modules (MyKunci, MySuhu, MyCylinder, MyStaff, etc.) use high-performance CSS elevation, crisp hairline borders, and tactile micro-interactions with **zero WebGL overhead**.

---

## 2. Token Architecture & Theme Mapping

Tokens are defined in `src/index.css` via CSS Custom Properties and integrated into Tailwind configuration.

### 2.1 Color Palette
- **Foundation Base**: Dark Navy/Slate (`#0b0f19` dark / `#f8fafc` light).
- **Surface Layer 1**: Card / Panel (`#111827` dark / `#ffffff` light).
- **Elevated Layer 2**: Modals / Popovers (`#1e293b` dark / `#f1f5f9` light).
- **Clinical Accent**: Precision Cyan / Teal (`#0ea5e9` sky / `#14b8a6` teal) for focal primary actions.
- **Status Accents**:
  - Emerald (`#10b981`) — Success / Online / Ready
  - Amber (`#f59e0b`) — Caution / Pending / Maintenance
  - Rose (`#f43f5e`) — Critical / Overdue / Alarm
  - Indigo/Sky (`#38bdf8`) — Informational / Audit

### 2.2 Elevation Scale
```css
/* Level 0: Canvas */
--bg-canvas: #0b0f19;

/* Level 1: Standard Surface (Cards, Tables, Panels) */
--bg-surface: #111827;
--border-subtle: rgba(255, 255, 255, 0.08);
--shadow-surface: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3);

/* Level 2: Interactive Lift (Hover, Focus) */
--border-interactive: rgba(14, 165, 233, 0.3);
--shadow-elevated: 0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3);

/* Level 3: Floating Overlay (Modals, Drawers, Dropdowns) */
--bg-elevated: #1e293b;
--border-elevated: rgba(255, 255, 255, 0.14);
--shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
```

---

## 3. Motion & Micro-Interactions (Emil Kowalski Standard)

1. **Duration**: 150ms – 250ms max.
2. **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (fluid spring/ease-out deceleration).
3. **Properties**: ONLY animate `transform` and `opacity`. Never animate width, height, margin, or padding.
4. **Tactile Feedback**:
   - Card Hover: `transform: translateY(-1px)` with subtle border highlight.
   - Button Press: `transform: scale(0.98)` with instant visual confirmation.
5. **Reduced Motion**: Under `@media (prefers-reduced-motion: reduce)`, all transitions drop to `duration: 0.01ms` or immediate state toggle.

---

## 4. Required 6 Microstates on All Interactive Controls

Every interactive element (buttons, inputs, select triggers, table rows) must explicitly style:
1. `default`: Clean surface, legible text, hairline border.
2. `hover`: Subdued lift, subtle border illumination.
3. `focus-visible`: 2px offset focus ring (`ring-2 ring-cyan-500/50 outline-none`).
4. `active / pressed`: Tactile scale depression (`scale-[0.98]`).
5. `disabled`: Opacity 40%, cursor-not-allowed, no hover lift.
6. `loading`: Non-layout-shifting skeleton or smooth spinner with accessible aria announcement.

---

## 5. UI Primitives Suite

All screens consume these foundational primitives located in `src/components/ui/`:
- `Surface`: Layered container with elevation levels 1–3, hairline border, and optional subtle interactive tilt/lift.
- `Button`: Compact clinical button styling all 6 microstates with primary, secondary, outline, and destructive variants.
- `DataTable`: High-density tabular layout with sticky headers, tabular figures (`font-mono` / `tabular-nums`), and structured empty/loading states.
- `PageHeader`: Standardized operational header with breadcrumbs, title, clinical status indicator, and primary action slot.
- `ThemeToggle`: Accessible toggle supporting dark, light, and system themes.

---

## 6. Verification Checklist
- [ ] No hardcoded hex values in `.tsx` files.
- [ ] React Three Fiber and Drei packages are only imported under `src/components/three/`.
- [ ] Bundle analysis confirms 3D code is isolated in a split chunk.
- [ ] `npm run build` and `scripts/check-rules.cjs` pass cleanly.
