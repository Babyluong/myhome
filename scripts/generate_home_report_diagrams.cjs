#!/usr/bin/env node
/**
 * generate_home_report_diagrams.cjs
 *
 * Builds the diagrams for the H.O.M.E. system module report from repository
 * evidence (docs/reports/home-report-facts.json). Each figure is emitted as SVG
 * for review and converted to PNG for embedding in the Word document.
 *
 * Usage: node scripts/generate_home_report_diagrams.cjs [--png]
 */
const fs = require('node:fs');
const path = require('node:path');
const { Svg, PALETTE } = require('./home_report_svg.cjs');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs/reports/diagrams');
const W = 1160;
const M = 40;
const CW = W - M * 2;

const facts = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/reports/home-report-facts.json'), 'utf8'));
const ev = facts.evidence;
const n = (v) => Number(v).toLocaleString('en-MY');

const built = [];
function save(name, svg) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg.toString());
  built.push(name);
  return name;
}

/** Figure 1 - Ecosystem context: people, platform, data and obligations. */
function figContext() {
  const s = new Svg(W, 620);
  const y = s.title(M, 46, 'Figure 1: H.O.M.E. ecosystem context',
    'Who uses the system, what it runs on, and which external obligations it serves');
  const colW = 320;
  const gap = (CW - colW * 3) / 2;
  const top = y + 6;
  const boxH = 372;
  const xs = [M, M + colW + gap, M + (colW + gap) * 2];

  const groups = [
    ['People (Hospital Lawas staff)', PALETTE.blue, PALETTE.blueSoft, [
      ['Hospital Director / JKNS', 'Oversight, approvals, audit readiness'],
      ['Pharmacy team', 'Warrant, inventory, prepacking, formulary'],
      ['Clinical staff & wards', 'Indenting, oxygen, cross-border referral'],
      ['Logistics & transport', 'Porter dispatch, fleet, deliveries'],
      ['Facility & security', 'Cold chain, key custody, venue booking'],
      ['Administration & HR', 'Staff movement, time-off, memos, files'],
      ['System Administrator', 'Accounts, RBAC, logs, releases'],
    ]],
    ['H.O.M.E. platform (single hub)', PALETTE.teal, PALETTE.tealSoft, [
      ['Module Hub', `${facts.hub.tileCount} modules in ${Object.keys(facts.hub.categoryCounts).length} operational groups`],
      ['Authentication & access requests', 'Employee ID login with approval workflow'],
      ['Role-based access control', `${facts.registry.roleCount} roles x ${facts.registry.actions.length} actions`],
      ['Offline-first PWA', `${facts.platform.offlineTableCount} tables pre-warmed locally`],
      ['Document & ledger output', 'KEW.PS-4 ledgers, PDF reports, labels'],
      ['Audit trail', 'Immutable action logging for MSQH review'],
      ['Release & announcement engine', `Version ${facts.release.releaseVersion} broadcast to staff`],
    ]],
    ['Data & external obligations', PALETTE.amber, PALETTE.amberSoft, [
      ['Supabase PostgreSQL', `${facts.database.tables} tables, ${facts.database.migrationFiles} migrations`],
      ['Row Level Security', `${facts.database.rlsEnabled} tables, ${facts.database.policies} policies`],
      ['Edge Functions', facts.platform.edgeFunctions.join(', ')],
      ['IndexedDB local cache', 'Reads and queued writes when offline'],
      ['Google Sheets sync', 'APPL / LP catalogue reconciliation'],
      ['Scheduled backups', `${facts.platform.backups.length} archived database exports`],
      ['Statutory frameworks', 'KEW.PS-4 / KEW.PS-14, MSQH, KKM key policy'],
    ]],
  ];

  groups.forEach(([title, accent, fill, rows], gi) => {
    const inner = s.panel(xs[gi], top, colW, boxH, title, { fill, barFill: accent, pad: 10 });
    const cells = Svg.colOf(inner.x, inner.y, inner.h, rows.length, 8);
    rows.forEach(([t, sub], i) => {
      s.node(cells[i].x, cells[i].y, colW - 20, cells[i].h, t, { subtitle: sub, accent, size: 12, subSize: 10 });
    });
  });

  const midY = top + boxH / 2;
  s.arrow(xs[0] + colW, midY, xs[1] - 6, midY, { stroke: PALETTE.navy, width: 2.4 });
  s.text(xs[0] + colW + gap / 2, midY - 12, 'signed-in session', { size: 10, color: PALETTE.muted, anchor: 'middle' });
  s.arrow(xs[1] + colW, midY, xs[2] - 6, midY, { stroke: PALETTE.navy, width: 2.4 });
  s.text(xs[1] + colW + gap / 2, midY - 12, 'tenant-scoped queries', { size: 10, color: PALETTE.muted, anchor: 'middle' });

  const fy = top + boxH + 34;
  s.bandLabel(M, fy, CW, 30, 'TENANCY: RECORDS ARE SCOPED BY hospital_id AND ENFORCED IN THE DATABASE, NOT ONLY IN THE INTERFACE');
  s.footnote(M, fy + 52, `Source: src/modules, src/services, src/shared/constants, supabase/migrations at revision ${facts.release.commit}.`);
  return save('fig-01-context', s);
}

/** Figure 2 - Layered technical architecture. */
function figArchitecture() {
  const s = new Svg(W, 740);
  const y = s.title(M, 46, 'Figure 2: Layered technical architecture',
    'Presentation, domain modules, shared platform services, serverless functions and the data layer');
  const sideW = 176;
  const mainW = CW - sideW - 16;
  const layers = [
    ['Presentation layer', PALETTE.blue, PALETTE.blueSoft, [
      ['React 18 + TypeScript + Vite', `${n(facts.scale.codeFiles)} source files, ${n(facts.scale.loc)} lines`],
      ['Router & application shell', `${facts.routes.declaredPaths} declared paths, ${facts.routes.lazyImports} lazy pages`],
      ['Design system & print templates', 'Semantic tokens, dark/light themes, official ledgers'],
    ]],
    ['Domain modules', PALETTE.teal, PALETTE.tealSoft, [
      [`${facts.scale.moduleDirs} module folders`, 'pages / services / components / types per domain'],
      [`${facts.registry.modules.length} registry modules`, `${facts.registry.featureCount} registered feature capabilities`],
      ['Independent loading', 'Modules load on demand and fail in isolation'],
    ]],
    ['Shared platform services', PALETTE.navy, PALETTE.slateSoft, [
      ['Auth, RBAC, audit', 'Session control, permission matrix, action log'],
      ['Offline engine', `${facts.platform.offlineServices.length} offline services with IndexedDB cache and replay queue`],
      ['Output & integration', `${facts.platform.serviceCount} shared services: PDF, QR, upload, sheet sync`],
    ]],
    ['Serverless layer', PALETTE.amber, PALETTE.amberSoft, [
      [`${facts.platform.edgeFunctions.length} Supabase Edge Functions`, facts.platform.edgeFunctions.join(' / ')],
      ['Privileged operations', 'Service-role key never shipped to the browser'],
      ['Catalogue synchronisation', 'APPL and LP reconciliation jobs'],
    ]],
    ['Data layer', PALETTE.rose, PALETTE.roseSoft, [
      [`PostgreSQL (${facts.database.tables} tables)`, `${facts.database.migrationFiles} migrations, ${facts.database.functions} functions, ${facts.database.triggers} triggers`],
      ['Row Level Security', `${facts.database.rlsEnabled} tables protected by ${facts.database.policies} policies`],
      ['Backups & recovery', `${facts.platform.backups.length} archived exports with scripted restore`],
    ]],
  ];
  const bandH = 92;
  const bandGap = 24;
  layers.forEach(([title, accent, fill, cells], i) => {
    const by = y + i * (bandH + bandGap);
    const inner = s.panel(M, by, mainW, bandH, title, { fill, barFill: accent, barHeight: 22, pad: 9 });
    const row = Svg.rowOf(inner.x, inner.y, inner.w, cells.length, 10);
    cells.forEach(([t, sub], j) => {
      s.node(row[j].x, row[j].y, row[j].w, inner.h, t, { subtitle: sub, accent, size: 11.5, subSize: 9.8 });
    });
    if (i < layers.length - 1) s.arrow(M + mainW / 2, by + bandH + 2, M + mainW / 2, by + bandH + bandGap - 4, { width: 1.8 });
  });

  const sh = layers.length * bandH + (layers.length - 1) * bandGap;
  const side = s.panel(M + mainW + 16, y, sideW, sh, 'Cross-cutting', { fill: PALETTE.white, barFill: PALETTE.slate, barHeight: 22, pad: 9 });
  const cross = [
    ['Security', 'RLS, tenant scoping, lockout'],
    ['Auditability', 'audit_logs on governed writes'],
    ['Resilience', 'Offline cache and queued replay'],
    ['Accessibility', 'Keyboard paths, focus, reduced motion'],
    ['Bilingual UI', 'English and Bahasa Malaysia'],
    ['Quality gates', `${facts.platform.productTests.length} product + ${facts.platform.governanceTests.length} governance suites`],
  ];
  const cells = Svg.colOf(side.x, side.y, side.h, cross.length, 8);
  cross.forEach(([t, sub], i) => {
    s.node(cells[i].x, cells[i].y, sideW - 20, cells[i].h, t, { subtitle: sub, accent: PALETTE.slate, size: 11.5, subSize: 9.6 });
  });
  s.footnote(M, y + sh + 26, 'Counts are extracted from repository sources at build time; no live database inspection was performed.');
  return save('fig-02-architecture', s);
}

/** Figure 3 - Module landscape by operational group. */
function figLandscape() {
  const s = new Svg(W, 640);
  const y = s.title(M, 46, 'Figure 3: Module landscape of the Module Hub',
    `${facts.hub.tileCount} staff-facing modules in three operational groups, on top of the shared platform backbone`);
  const groups = [
    ['Clinical & Pharmacy', PALETTE.teal, PALETTE.tealSoft, ['formulari', 'suhu', 'cylinder', 'prepacking', 'warrant', 'priviledging', 'myphis', 'mymsds']],
    ['Logistics & Facilities', PALETTE.blue, PALETTE.blueSoft, ['inventory', 'perolehan', 'transporter', 'porter', 'tempahan', 'kunci']],
    ['Administration & Governance', PALETTE.amber, PALETTE.amberSoft, ['admin', 'staff', 'timeoff', 'surat', 'borang', 'memo', 'file', 'gallery', 'perhimpunan']],
  ];
  const dirOf = {
    formulari: 'myformulari', suhu: 'mysuhu', cylinder: 'mycylinder', prepacking: 'myprepacking',
    warrant: 'mywarrant', priviledging: 'mypriviledging', myphis: 'myphis', mymsds: 'mymsds',
    inventory: 'inventory', perolehan: 'myperolehan', transporter: 'mytransporter', porter: 'myporter',
    tempahan: 'mytempahan', kunci: 'mykunci', admin: 'admin', staff: 'mystaff', timeoff: 'mytimeoff',
    surat: 'PORTAL', borang: 'PORTAL', memo: 'hospital-admin', file: 'PORTAL', gallery: 'hub', perhimpunan: 'PORTAL',
  };
  const colW = (CW - 32) / 3;
  const tileH = 40;
  groups.forEach(([title, accent, fill, ids], gi) => {
    const x = M + gi * (colW + 16);
    const rows = Math.ceil(ids.length / 2);
    const colH = 36 + rows * tileH + (rows - 1) * 8 + 16;
    const inner = s.panel(x, y, colW, colH, `${title} (${ids.length})`, { fill, barFill: accent, pad: 8, barHeight: 26 });
    const grid = Svg.gridOf(inner.x, inner.y, inner.w, rows * tileH + (rows - 1) * 8, 2, rows, 8, 8);
    ids.forEach((id, i) => {
      const c = grid[i];
      const evidence = dirOf[id] === 'PORTAL'
        ? { persistence: 'portal', tableCount: 0 }
        : (ev[dirOf[id]] || { persistence: 'reference-only', tableCount: 0 });
      const dotColor = evidence.persistence === 'database' ? PALETTE.green
        : evidence.persistence === 'browser-local' ? PALETTE.amber
          : evidence.persistence === 'static-bundle' ? PALETTE.blue : PALETTE.line;
      s.node(c.x, c.y, c.w, tileH, id.charAt(0).toUpperCase() + id.slice(1), { size: 11.5, dot: dotColor, center: false });
      s.text(c.x + 10, c.y + 32, evidence.persistence === 'portal' ? 'navigation portal' : `${evidence.tableCount} tables`, { size: 9, color: PALETTE.muted });
    });
  });

  const fy = y + 300;
  const inner = s.panel(M, fy, CW, 108, 'Platform backbone (shared across all modules)', { fill: PALETTE.slateSoft, barFill: PALETTE.slate, pad: 9, barHeight: 24 });
  const backbone = ['auth', 'profile', 'catalog', 'procurement', 'financial', 'distribution', 'maintenance', 'reports', 'hospital-admin', 'hub'];
  const grid = Svg.gridOf(inner.x, inner.y, inner.w, inner.h, 5, 2, 10, 8);
  backbone.forEach((b, i) => {
    const c = grid[i];
    const evidence = ev[b];
    s.node(c.x, c.y, c.w, c.h, b, { subtitle: `${evidence.pages} page${evidence.pages === 1 ? '' : 's'} / ${evidence.tableCount} tables`, size: 11, subSize: 9.5, accent: PALETTE.slate });
  });
  s.legend(M, fy + 132, [
    { label: 'Database-backed', color: PALETTE.green },
    { label: 'Browser-local persistence', color: PALETTE.amber },
    { label: 'Static reference bundle', color: PALETTE.blue },
    { label: 'Navigation portal', color: PALETTE.line },
  ]);
  s.footnote(M, fy + 156, 'Persistence tier is derived from source analysis: supabase.from() calls, localStorage usage and bundled data files.');
  return save('fig-03-landscape', s);
}

/** Figure 4 - Access, approval and enforcement flow. */
function figAccessFlow() {
  const s = new Svg(W, 560);
  const y = s.title(M, 46, 'Figure 4: Access request to audit trail',
    'Every staff member follows one governed path from request to audited module access');
  const steps = [
    ['1. Access request', 'Multi-step form: identity, department, emergency contact, photo'],
    ['2. Admin verification', 'Hospital or system admin reviews and approves the request'],
    ['3. Account provisioning', 'Employee ID generated; credential issued via secure channel'],
    ['4. Role assignment', `Role mapped to ${facts.registry.actions.length} action types in the RBAC matrix`],
    ['5. Module enforcement', 'Routes and actions gated by role, module and hospital scope'],
    ['6. Audit trail', 'Governed writes recorded immutably for MSQH and internal audit'],
  ];
  const row = Svg.rowOf(M, y + 10, CW, steps.length, 22);
  const boxes = steps.map(([t, sub], i) => s.node(row[i].x, row[i].y, row[i].w, 118, t, {
    subtitle: sub, accent: i === 5 ? PALETTE.green : PALETTE.navy, size: 12, subSize: 10, center: false,
  }));
  boxes.forEach((b, i) => {
    if (i < boxes.length - 1) s.arrow(b.right + 2, b.cy, boxes[i + 1].x - 4, b.cy, { stroke: PALETTE.navy, width: 2.2 });
  });

  const sy = y + 168;
  const supports = [
    ['Row Level Security', `${facts.database.policies} policies enforce tenant scope inside PostgreSQL`],
    ['Edge Functions', 'Privileged admin operations run server-side with the service role'],
    ['Session controls', 'Failed-attempt lockout, session timeout and password policy'],
  ];
  const srow = Svg.rowOf(M, sy, CW, supports.length, 22);
  supports.forEach(([t, sub], i) => {
    const b = s.node(srow[i].x, srow[i].y, srow[i].w, 96, t, { subtitle: sub, accent: PALETTE.amber, size: 12, subSize: 10, center: false, fill: PALETTE.amberSoft });
    s.arrow(b.cx, b.y - 2, b.cx, sy - 26, { stroke: PALETTE.amber, width: 1.6, dash: true });
  });
  s.text(M, sy + 130, 'The same matrix drives the hub tiles, route guards and per-action buttons, so a permission change is reflected everywhere at once.',
    { size: 11.5, color: PALETTE.muted });
  s.footnote(M, sy + 152, 'Source: src/modules/auth, src/modules/admin, src/shared/constants/moduleRegistry.ts, supabase/migrations.');
  return save('fig-04-access-flow', s);
}

/** Figure 5 - Pharmacy supply chain and control loops. */
function figSupplyChain() {
  const s = new Svg(W, 660);
  const y = s.title(M, 46, 'Figure 5: Pharmacy supply chain and control loops',
    'From warrant allocation to ward issue, with the statutory ledgers and monitoring loops attached');
  const chain = [
    ['Warrant & budget', 'Vote allocation, APPL / CC / LP tracking, forecasts'],
    ['LPO & quotations', 'Local purchase orders, approvals, order tracking'],
    ['Goods receipt', 'Delivery verification, penalties, credit notes'],
    ['Inventory ledger', 'KEW.PS-4 digital ledger, QR bin tags, FEFO issue'],
    ['Ward indenting', 'Entitlements, indent requests, approvals, issue counter'],
    ['Dispensing & prepack', 'Unit-of-dose batches, labels, usage history'],
  ];
  const row = Svg.rowOf(M, y + 8, CW, chain.length, 18);
  const boxes = chain.map(([t, sub], i) => s.node(row[i].x, row[i].y, row[i].w, 108, t, {
    subtitle: sub, accent: PALETTE.teal, size: 12, subSize: 9.8, center: false,
  }));
  boxes.forEach((b, i) => {
    if (i < boxes.length - 1) s.arrow(b.right + 2, b.cy, boxes[i + 1].x - 4, b.cy, { stroke: PALETTE.teal, width: 2.2 });
  });

  const oy = y + 158;
  const oxygen = [
    ['Cylinder registry', 'Serial, size, type, pressure test, supplier tag'],
    ['QR dispatch & receipt', 'Scan-based movement, return documents'],
    ['Consumption & reconciliation', 'Department requests, stock verification, KEW.PS-4'],
  ];
  s.bandLabel(M, oy, 150, 84, 'MEDICAL OXYGEN', { fill: PALETTE.blueSoft });
  const orow = Svg.rowOf(M + 166, oy, CW - 166, oxygen.length, 18);
  oxygen.forEach(([t, sub], i) => {
    const b = s.node(orow[i].x, orow[i].y, orow[i].w, 84, t, { subtitle: sub, accent: PALETTE.blue, size: 11.5, subSize: 9.6, center: false });
    if (i < oxygen.length - 1) s.arrow(b.right + 2, b.cy, orow[i + 1].x - 4, b.cy, { stroke: PALETTE.blue, width: 2 });
  });
  s.arrow(boxes[3].cx, boxes[3].bottom + 2, boxes[3].cx, oy - 4, { stroke: PALETTE.slate, width: 1.6, dash: true });

  const cy = oy + 122;
  const controls = [
    ['FEFO & near-expiry alerts', 'Colour-coded expiry horizons drive issue order'],
    ['Slow-moving review', 'Idle stock flagged for return or redistribution'],
    ['KEW.PS-14 verification', 'Guided stock count with automatic variance'],
    ['Supplier performance', 'Delay penalties and assessment records'],
  ];
  s.bandLabel(M, cy, 150, 84, 'CONTROL LOOPS', { fill: PALETTE.greenSoft, color: PALETTE.green });
  const crow = Svg.rowOf(M + 166, cy, CW - 166, controls.length, 18);
  controls.forEach(([t, sub], i) => {
    s.node(crow[i].x, crow[i].y, crow[i].w, 84, t, { subtitle: sub, accent: PALETTE.green, size: 11.5, subSize: 9.6, center: false, fill: PALETTE.greenSoft });
  });
  s.arrow(boxes[3].cx, oy + 88, boxes[3].cx, cy - 4, { stroke: PALETTE.green, width: 1.6, dash: true });
  s.footnote(M, cy + 112, 'Ledger structure follows the Ministry of Finance store-control format; printable official copies remain available for audit.');
  return save('fig-05-supply-chain', s);
}

/** Figure 6 - Before and after comparison lanes. */
function figBeforeAfter() {
  const s = new Svg(W, 700);
  const y = s.title(M, 46, 'Figure 6: Before and after H.O.M.E.',
    'The manual baseline that motivated each module family, and the digitised practice that replaced it');
  const laneW = CW;
  const before = [
    ['Stock cards by hand', 'KEW.PS-4 written in ink at the shelf; balances recomputed mentally'],
    ['Phone-call reconciliation', 'Warrant balances chased through calls and paper files'],
    ['Paper temperature books', 'Readings logged on sheets; night excursions found next morning'],
    ['Key books & envelopes', 'Custody recorded in notebooks; duplicates sealed by hand'],
    ['Month-end manual tallies', 'Counts and reports assembled from scattered sheets'],
  ];
  const after = [
    ['QR digital ledger', 'Scan the bin tag; ledger opens and posts in one action'],
    ['Live warrant dashboard', 'Allocation, commitment and balance visible on screen'],
    ['Threshold alerts & breach log', 'Out-of-range readings flagged with owner and response'],
    ['Digital custody with witness', 'Borrow and return logged with second-officer confirmation'],
    ['One-click audit exports', 'Official ledgers and reports generated on demand'],
  ];
  const laneH = 150;
  const drawLane = (topY, title, rows, accent, fill, chipLabel, chips) => {
    s.panel(M, topY, laneW, laneH, title, { fill, barFill: accent, barHeight: 24, pad: 9 });
    const row = Svg.rowOf(M + 9, topY + 33, laneW - 18, rows.length, 14);
    rows.forEach(([t, sub], i) => {
      s.node(row[i].x, row[i].y, row[i].w, 92, t, { subtitle: sub, accent, size: 11.5, subSize: 9.6, center: false });
    });
    s.text(M, topY + laneH + 20, chipLabel, { size: 10.5, weight: 700, color: accent });
    let cx = M + 120;
    chips.forEach((chip) => {
      const w = Math.max(90, chip.length * 6.1 + 22);
      s.rect(cx, topY + laneH + 8, w, 20, { fill: PALETTE.white, stroke: accent, radius: 10, strokeWidth: 1 });
      s.text(cx + w / 2, topY + laneH + 22, chip, { size: 9.5, weight: 600, color: accent, anchor: 'middle' });
      cx += w + 10;
    });
  };
  drawLane(y + 4, 'BEFORE: prevailing manual practice', before, PALETTE.rose, PALETTE.roseSoft, 'Typical exposure:',
    ['arithmetic errors', 'lost or late records', 'undetected excursions', 'audit downtime', 'double entry work']);
  const midY = y + 4 + laneH + 44;
  s.arrow(M + laneW / 2, midY - 18, M + laneW / 2, midY + 6, { stroke: PALETTE.teal, width: 3 });
  s.text(M + laneW / 2 + 14, midY - 2, 'digitisation under H.O.M.E.', { size: 11, weight: 600, color: PALETTE.teal });
  drawLane(midY + 12, 'AFTER: H.O.M.E. digitised practice', after, PALETTE.green, PALETTE.greenSoft, 'Observed capability:',
    ['single source of truth', 'real-time balances', 'automatic alerts', 'witnessed custody', 'audit-ready output']);
  s.footnote(M, midY + 12 + laneH + 52,
    'Before-state descriptions are drawn from the module problem statements in the repository (PRDs and plans); capability statements reflect implemented source behaviour.');
  return save('fig-06-before-after', s);
}

/** Figure 7 - Offline resilience model. */
function figOffline() {
  const s = new Svg(W, 520);
  const y = s.title(M, 46, 'Figure 7: Offline resilience model',
    'How the system keeps working when the hospital link to the cloud is interrupted');
  const steps = [
    ['Online session', 'Reads served from PostgreSQL; cache refreshed in background'],
    ['Pre-warm on launch', `${facts.platform.offlineTableCount} operational tables copied to IndexedDB`],
    ['Offline operation', 'Catalogues, ledgers and registers remain readable and searchable'],
    ['Queued writes', 'Changes captured locally with optimistic state for the user'],
    ['Reconnect & replay', 'Queue replayed; audit records written; conflicts surfaced to staff'],
  ];
  const row = Svg.rowOf(M, y + 10, CW, steps.length, 20);
  const boxes = steps.map(([t, sub], i) => s.node(row[i].x, row[i].y, row[i].w, 116, t, {
    subtitle: sub, accent: i === 2 || i === 3 ? PALETTE.amber : PALETTE.teal, size: 12, subSize: 9.8, center: false,
    badge: i === 0 ? 'ONLINE' : i === 4 ? 'SYNC' : 'OFFLINE',
    badgeFill: i === 0 || i === 4 ? PALETTE.tealSoft : PALETTE.amberSoft,
    badgeStroke: i === 0 || i === 4 ? PALETTE.teal : PALETTE.amber,
  }));
  boxes.forEach((b, i) => {
    if (i < boxes.length - 1) s.arrow(b.right + 2, b.cy, boxes[i + 1].x - 4, b.cy, { stroke: PALETTE.slate, width: 2 });
  });
  const ny = y + 170;
  const notes = [
    ['Why it matters at Lawas', 'Rural connectivity interruptions must not stop dispensing, oxygen dispatch or key custody.'],
    ['Data integrity guard', 'Writes that cannot be queued are reported as failures instead of silent success.'],
    ['Audit continuity', 'Replayed transactions carry the same audit trail as online writes.'],
  ];
  const nrow = Svg.rowOf(M, ny, CW, notes.length, 20);
  notes.forEach(([t, sub], i) => {
    s.node(nrow[i].x, nrow[i].y, nrow[i].w, 92, t, { subtitle: sub, accent: PALETTE.navy, size: 11.5, subSize: 9.8, center: false, fill: PALETTE.blueSoft });
  });
  s.footnote(M, ny + 122, 'Source: src/services/offlinePreloader.ts, offlineAdapter.ts, offlineQueue.ts, offlineFetch.ts.');
  return save('fig-07-offline', s);
}

/** Figure 8 - Module maturity and capability matrix. */
function figMaturity() {
  const rows = [
    ['MyWarrant', 'mywarrant'], ['MyInventory', 'inventory'], ['MyCylinder', 'mycylinder'],
    ['MySuhu', 'mysuhu'], ['MyFormulari', 'myformulari'], ['MyPerolehan', 'myperolehan'],
    ['MyTransporter', 'mytransporter'], ['MyKunci', 'mykunci'], ['MyStaff', 'mystaff'],
    ['MyCrossBorder', 'mycrossborder'], ['MyPHiS', 'myphis'], ['MyMSDS', 'mymsds'],
    ['MyTempahan', 'mytempahan'], ['MyAdmin', 'admin'], ['MyPrepacking', 'myprepacking'],
    ['MyPorter', 'myporter'], ['MyPriviledging', 'mypriviledging'], ['MyTimeOff', 'mytimeoff'],
  ];
  const cols = ['Persistence', 'RBAC registry', 'Audit log', 'Offline', 'Print / PDF', 'QR'];
  const registryDirs = new Set(['mywarrant', 'inventory', 'mycylinder', 'mysuhu', 'myformulari', 'myperolehan', 'mytransporter', 'mykunci', 'mystaff', 'mycrossborder', 'myphis', 'mymsds', 'mytempahan', 'admin']);
  const s = new Svg(W, 120 + rows.length * 30 + 90);
  const y = s.title(M, 46, 'Figure 8: Module capability matrix',
    'Implemented capabilities per module, derived from source analysis (not from marketing claims)');
  const nameW = 210;
  const pagesW = 90;
  const cellW = (CW - nameW - pagesW) / cols.length;
  const headY = y + 6;
  s.text(M + 8, headY + 16, 'Module', { size: 11, weight: 700, color: PALETTE.navy });
  cols.forEach((c, i) => {
    s.text(M + nameW + i * cellW + cellW / 2, headY + 16, c, { size: 10.5, weight: 700, color: PALETTE.navy, anchor: 'middle' });
  });
  s.text(M + CW - 8, headY + 16, 'Pages', { size: 10.5, weight: 700, color: PALETTE.navy, anchor: 'end' });
  s.line(M, headY + 24, M + CW, headY + 24, { stroke: PALETTE.line, width: 1.4 });
  rows.forEach(([label, dir], r) => {
    const ry = headY + 30 + r * 30;
    if (r % 2 === 0) s.rect(M, ry - 4, CW, 28, { fill: PALETTE.slateSoft, radius: 4 });
    const e = ev[dir] || { persistence: 'reference-only', flags: {}, pages: 0 };
    s.text(M + 8, ry + 14, label, { size: 11.5, weight: 600, color: PALETTE.text });
    const vals = [
      e.persistence === 'database' ? 2 : e.persistence === 'browser-local' || e.persistence === 'static-bundle' ? 1 : 0,
      registryDirs.has(dir) ? 2 : 0, e.flags.audit ? 2 : 0, e.flags.offline ? 2 : 0, e.flags.pdf ? 2 : 0, e.flags.qr ? 2 : 0,
    ];
    vals.forEach((v, i) => {
      const cx = M + nameW + i * cellW + cellW / 2;
      const fill = v === 2 ? PALETTE.green : v === 1 ? PALETTE.amber : PALETTE.line;
      s.circle(cx, ry + 10, 7, { fill });
      s.text(cx, ry + 13.5, v === 2 ? 'Y' : v === 1 ? 'L' : '-', { size: 8.5, weight: 700, color: PALETTE.white, anchor: 'middle' });
    });
    s.text(M + CW - 8, ry + 14, String(e.pages), { size: 10.5, color: PALETTE.muted, anchor: 'end' });
  });
  const ly = headY + 30 + rows.length * 30 + 22;
  s.legend(M, ly, [
    { label: 'Y = implemented against the database', color: PALETTE.green },
    { label: 'L = local / browser-level implementation', color: PALETTE.amber },
    { label: '- = not present in current release', color: PALETTE.line },
  ]);
  s.footnote(M, ly + 24, 'Persistence "L" marks modules whose records live in browser storage today; these are flagged in the report as migration candidates.');
  return save('fig-08-maturity', s);
}

/** Figure 9 - Shared data asset integration map. */
function figIntegration() {
  const s = new Svg(W, 640);
  const y = s.title(M, 46, 'Figure 9: Shared data assets and module integration',
    'The tables that bind the ecosystem together, and which module families read or write them');
  const assets = [
    ['users & roles', ['admin', 'auth', 'hospital-admin', 'hub', 'profile', 'mytransporter']],
    ['drugs & catalogues', ['catalog', 'inventory', 'myformulari', 'financial', 'procurement']],
    ['facility inventory', ['inventory', 'myprepacking', 'myformulari']],
    ['purchase orders & LPO', ['procurement', 'financial', 'mywarrant', 'reports']],
    ['oxygen tables', ['mycylinder']],
    ['staff & leave', ['mystaff', 'mytimeoff']],
    ['transport & vehicles', ['mytransporter']],
    ['audit_logs', ['admin', 'hospital-admin', 'mycylinder', 'inventory', 'profile']],
  ];
  const leftW = 300;
  const rightW = 300;
  const midX = M + leftW + 60;
  const midW = CW - leftW * 2 - 120;
  const mods = ['admin', 'auth', 'catalog', 'inventory', 'financial', 'procurement', 'reports', 'hub', 'hospital-admin', 'profile', 'myformulari', 'myprepacking', 'mycylinder', 'mystaff', 'mytimeoff', 'mytransporter', 'mywarrant'];
  const left = s.panel(M, y, leftW, 470, 'Module families', { fill: PALETTE.blueSoft, barFill: PALETTE.blue, pad: 8, barHeight: 24 });
  const lcells = Svg.colOf(left.x, left.y, left.h, mods.length, 5);
  const modBox = {};
  mods.forEach((m, i) => {
    modBox[m] = s.node(lcells[i].x, lcells[i].y, leftW - 16, lcells[i].h, m, { size: 10.5, center: false, accent: PALETTE.blue });
  });
  const right = s.panel(midX + midW + 60, y, rightW, 470, 'Shared data assets', { fill: PALETTE.tealSoft, barFill: PALETTE.teal, pad: 8, barHeight: 24 });
  const rcells = Svg.colOf(right.x, right.y, right.h, assets.length, 8);
  const assetBox = {};
  assets.forEach(([t, users], i) => {
    assetBox[t] = s.node(rcells[i].x, rcells[i].y, rightW - 16, rcells[i].h, t, { subtitle: `${users.length} module families`, size: 11, subSize: 9.5, center: false, accent: PALETTE.teal });
  });
  assets.forEach(([t, users]) => {
    users.forEach((u) => {
      if (!modBox[u]) return;
      const a = modBox[u];
      const b = assetBox[t];
      s.path(`M ${a.right} ${a.cy} C ${midX + midW * 0.4} ${a.cy}, ${midX + midW * 0.6} ${b.cy}, ${b.x - 4} ${b.cy}`,
        { stroke: PALETTE.line, width: 1.1, arrow: false });
    });
  });
  s.text(midX + midW / 2, y + 240, 'reads / writes', { size: 10.5, color: PALETTE.muted, anchor: 'middle' });
  s.footnote(M, y + 500, `Connections are derived from supabase.from() usage per module folder at revision ${facts.release.commit}.`);
  return save('fig-09-integration', s);
}

/** Figure 10 - Stakeholder benefit map. */
function figBenefits() {
  const s = new Svg(W, 660);
  const y = s.title(M, 46, 'Figure 10: What H.O.M.E. brings to each user group',
    'Benefits are stated per role so department heads can see their own value proposition');
  const personas = [
    ['Hospital Director', 'One dashboard for operations, budget and audit posture; approvals tracked end to end.', 'MyWarrant, MyAdmin, Reports'],
    ['Pharmacist', 'Formulary, dilution and LASA guidance at the point of care; quota and alternatives in seconds.', 'MyFormulari, MyPrepacking'],
    ['Store keeper', 'QR ledger replaces ink cards; counts, FEFO and variances handled by the system.', 'MyInventory, MyCylinder'],
    ['Ward sister / nurse', 'Indent against entitlement; oxygen and porter requests with visible status.', 'Distribution, MyPorter, MyCylinder'],
    ['Driver & porter', 'Dispatch queue, roster and vehicle issues on one screen instead of radio calls.', 'MyTransporter, MyPorter'],
    ['Facility officer', 'Cold-chain breaches and key custody answered with evidence, not memory.', 'MySuhu, MyKunci, MyTempahan'],
    ['HR & administration', 'Movement, leave, time-off and org chart maintained in one place.', 'MyStaff, MyTimeOff'],
    ['Quality / MSQH team', 'Audit trail, breach logs and printable official records on demand.', 'MyAdmin, MySuhu, MyKunci'],
    ['System administrator', 'Accounts, RBAC matrix, logs, backups and release broadcasts centrally controlled.', 'MyAdmin, Backups, Releases'],
  ];
  const grid = Svg.gridOf(M, y + 6, CW, 480, 3, 3, 18, 16);
  personas.forEach(([role, benefit, mods], i) => {
    const c = grid[i];
    s.node(c.x, c.y, c.w, c.h, role, { subtitle: benefit, size: 12.5, subSize: 10.2, center: false, accent: PALETTE.navy, strokeWidth: 1.3 });
    s.text(c.x + 13, c.y + c.h - 12, mods, { size: 9.5, weight: 600, color: PALETTE.teal });
  });
  s.footnote(M, y + 512, 'Module attribution follows the hub catalogue and registry role presets; benefit statements describe implemented functionality.');
  return save('fig-10-benefits', s);
}

const FIGURES = [
  figContext, figArchitecture, figLandscape, figAccessFlow, figSupplyChain,
  figBeforeAfter, figOffline, figMaturity, figIntegration, figBenefits,
];

async function toPng() {
  const sharp = require('sharp');
  for (const name of built) {
    const buf = fs.readFileSync(`${OUT}/${name}.svg`);
    await sharp(buf, { density: 150 }).resize({ width: 2200 }).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
  }
}

module.exports = {
  facts, ev, n, save, built, OUT, W, M, CW, FIGURES, toPng,
  figContext, figArchitecture, figLandscape, figAccessFlow, figSupplyChain,
  figBeforeAfter, figOffline, figMaturity, figIntegration, figBenefits,
};
if (require.main === module) {
  FIGURES.forEach((f) => f());
  if (process.argv.includes('--png')) {
    toPng().then(() => console.log(`SVG+PNG written (${built.length}): ${built.join(', ')}`))
      .catch((e) => { console.error(`PNG conversion failed: ${e.message}`); process.exitCode = 1; });
  } else {
    console.log(`SVG written (${built.length}): ${built.join(', ')}`);
  }
}
