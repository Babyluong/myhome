#!/usr/bin/env node
/**
 * home_report_content.cjs
 *
 * Narrative content for the H.O.M.E. system module report. Quantitative
 * statements are injected from docs/reports/home-report-facts.json at build
 * time; qualitative statements describe implemented behaviour or documented
 * problem statements. No performance figures are asserted: KPI tables ship
 * with blank baselines for Hospital Lawas to populate from measured data.
 */

const FRONT = {
  title: 'HOSPITAL OPERATION MANAGEMENT ECOSYSTEM (H.O.M.E.)',
  subtitle: 'Comprehensive System Module Report',
  audience: 'Hospital Daerah Lawas, Sarawak - Jabatan Kesihatan Negeri Sarawak',
  classification: 'OFFICIAL USE (TERHAD - EDARAN DALAMAN)',
  docRef: 'HOME/LAP/MOD/2026/01',
  executive: [
    'H.O.M.E. is the hospital-built digital operations platform of Hospital Daerah Lawas. It replaces the paper registers, ink ledgers, telephone coordination and scattered spreadsheets that previously carried the hospital\'s pharmacy, logistics, facility and administrative workflows with a single signed-in ecosystem of {TILES} operational modules on one governed platform.',
    'The platform is delivered as an installable web application (React 18, TypeScript, Vite) backed by a PostgreSQL database with row-level security ({TABLES} tables, {POLICIES} policies across {MIGRATIONS} migrations), {SERVICES} shared services, {EDGE} serverless edge functions and an offline-first cache that keeps {OFFLINE} operational tables usable when the hospital\'s internet link is interrupted.',
    'Each module in this report is presented with the same evidence structure: why it was created, the manual practice that preceded it, what the digitised workflow does today, who uses it, the controls that protect it, and the value it delivers to Hospital Lawas and its users. Capability statements are derived from the source code and database schema at revision {COMMIT}; they are not marketing claims.',
    'The report is deliberately conservative about numbers. Where a benefit is qualitative it is stated qualitatively. Where Hospital Lawas wishes to publish a measured improvement, Chapter 12 and Appendix C provide a KPI framework - metric, definition, system data source, blank baseline and blank target - so that every future figure can be traced to a query rather than to an estimate.',
  ],
  whyCreated: [
    'Hospital Daerah Lawas serves a rural district at the northern tip of Sarawak, far from the state\'s specialist centres. Staff shortages, long supply lines and intermittent connectivity make manual record-keeping disproportionately expensive: every stock card written by hand, every temperature book carried between shifts and every key book reconciled from memory consumes clinical and administrative time that the hospital cannot spare.',
    'Statutory obligations compound the burden. Government store control requires the KEW.PS-4 card register and KEW.PS-14 physical verification; MSQH accreditation expects traceable cold-chain and medication-safety records; KKM key policy expects witnessed custody of controlled-drug safes. On paper, each of these becomes a periodic crisis rather than a continuous control.',
    'H.O.M.E. was therefore created to digitise the hospital\'s own operating procedures without changing their legal form: the KEW.PS-4 ledger keeps its Ministry of Finance structure, the key register keeps its witness requirement, the temperature log keeps its threshold-and-breach discipline - but each becomes a live, queryable, auditable record instead of a shelf of paper.',
    'A second driver was coherence. Before H.O.M.E., each unit solved its own problem with its own spreadsheet, so the same drug, supplier or staff member appeared under different names in different files. H.O.M.E. introduces one catalogue, one staff directory, one role model and one audit trail, so that a warrant commitment, a purchase order, a goods receipt and a ward issue all reference the same records.',
    'A third driver was resilience. Because the district\'s connectivity is not guaranteed, the platform was designed offline-first: operational tables are pre-warmed into a local cache, reads continue without a link, and writes are queued and replayed with their audit records when the link returns.',
  ],
  scope: [
    'This report covers release {VERSION} at repository revision {COMMIT}. It describes the {TILES} modules presented in the staff Module Hub, the {REG} modules registered in the central access-control registry, and the {BACKBONE} shared backbone components that support them.',
    'Evidence is drawn exclusively from repository sources: the module registry and role constants, the route table, the module source folders, the SQL migration history, the release manifest and the documented module problem statements. No live production database was queried and no production records were read.',
    'Where a module stores its records in browser storage rather than the shared database, or bundles static reference data, the report says so plainly and classifies the module accordingly. These classifications are implementation facts, not judgements of clinical value.',
  ],
  maturityLegend: [
    ['Database-backed (Operational)', 'Records persist in the shared PostgreSQL database under row-level security; multiple devices see one truth.'],
    ['Browser-local (Pilot)', 'Records persist in the individual browser\'s storage with seeded defaults; valuable workflow, but data does not yet travel between devices. Flagged as a migration candidate.'],
    ['Static reference bundle', 'Curated reference content shipped with the application; read-only by design.'],
    ['Navigation portal', 'A governed entry point that routes staff to pages owned by another module; no records of its own.'],
  ],
};

module.exports = { FRONT };
