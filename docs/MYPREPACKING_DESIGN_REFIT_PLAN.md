# MyPrepacking Module — High-Tier Design & Layout Refit Plan
**Orchestrated by Babybun 🐰 & Babyluong 🎨**

## 1. Executive Summary & Design Diagnosis
Following the forensic audit of the uploaded `KEW.PS-4 Bin Card Ledger` screenshot and the 7 pages comprising the `MyPrepacking` module, this plan eliminates visual dissonance, clashing cold-slate palettes, and candy-colored KPI ribbons. It establishes 100% adherence to H.O.M.E. design standards:
- **Palette Realignment**: Transition from hardcoded cold grays (`dark:bg-gray-800`, `dark:bg-gray-900`, `bg-slate-900`) to the warm charcoal semantic tokens (`bg-surface`, `bg-subtle`, `bg-inset`, `border-border-default`, `border-border-subtle`, `text-text-primary`, `text-text-muted`).
- **Impeccable Anti-Slop Enforced**: Eliminate rainbow gradients in metric ribbons. Replace with clean tabular metric cards with hairline indicators. Single primary CTA per view.
- **Emil Kowalski Motion & Microstates**: Add 150-200ms transitions, tactile button depression (`active:scale-[0.98]`), and accessible focus-visible rings (`focus-visible:ring-2 focus-visible:ring-teal-500/40`).
- **TasteSkill Clinical Density (7-8)**: High data density, tabular numerals (`font-mono tabular-nums`), tight padding, and clear typographic hierarchy.

---

## 2. Atomic Task Slices

### Slice 1: KEW.PS-4 Ledger Page & Multi-Echelon Metrics (Primary Screen)
- **Target**: `src/modules/myprepacking/pages/PrepackKewPs4LedgerPage.tsx`
- **Actions**:
  - Unify header with system top bar, removing heavy boxed icon container and clashing badges.
  - Rationalize action toolbar: Single primary CTA (`Pack UOD / Prepack`), clean outline secondary/tertiary buttons.
  - Refactor 4 multi-echelon metric cards from neon gradients to hairline clinical cards with tabular numerals.
  - Refine search & date filter bar with semantic tokens.
  - Polish transaction ledger table and empty state.

### Slice 2: Central Formulation Catalog Page
- **Target**: `src/modules/myprepacking/pages/PrepackItemListPage.tsx`
- **Actions**:
  - Replace `bg-slate-900 border border-slate-800` banner with semantic `bg-surface border-border-default`.
  - Unify category tab pills and active states.
  - Standardize formulation table rows, active toggles, and empty states.

### Slice 3: Packaging Batches & Label Print Studio
- **Targets**:
  - `src/modules/myprepacking/pages/PrepackBatchListPage.tsx`
  - `src/modules/myprepacking/pages/PrepackLabelStudioPage.tsx`
- **Actions**:
  - Align batch run table, expiry pills, and filter bar.
  - Polish Label Studio configuration panel, paper size buttons, and live label card preview.

### Slice 4: Stock Movement & Reports & Analytics
- **Targets**:
  - `src/modules/myprepacking/pages/PrepackStockMovementPage.tsx`
  - `src/modules/myprepacking/pages/PrepackReportsPage.tsx`
- **Actions**:
  - Align Store-to-Counter transfer log and counter dispensing ledger.
  - Unify Reports KPI metrics, packaging efficiency rate card, and export dropdown.

### Slice 5: MyPrepacking Modals & Sub-Components
- **Targets**:
  - `src/modules/myprepacking/components/StoreToCounterTransferModal.tsx`
  - `src/modules/myprepacking/components/PrepackBatchCreateModal.tsx`
  - `src/modules/myprepacking/components/PrepackCheckFoundModal.tsx`
  - `src/modules/myprepacking/components/PrepackStoreVerificationModal.tsx`
  - `src/modules/myprepacking/components/PrepackBringForwardModal.tsx`
- **Actions**:
  - Standardize modal headers, stock balance preview cards, form inputs, and action buttons.

### Slice 6: QA Verification Gate
- **Agent**: BabyAaralyn 🧪
- **Verification**: Playwright visual smoke test & build validation to confirm zero lint/TypeScript regressions.
