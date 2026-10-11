const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

// Safe file writing with retry for Windows file locks
function safeWriteFileSync(filePath, content) {
  const tmpPath = `${filePath}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tmpPath, content, 'utf8');
    fs.copyFileSync(tmpPath, filePath);
    try { fs.unlinkSync(tmpPath); } catch (e) {}
  } catch (err) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (e2) {
      console.warn(`[System Release Engine] Warning writing ${filePath}:`, e2.message);
    }
  }
}

// Load environment variables from .env if available
try {
  const dotenvPath = path.join(rootDir, '.env');
  if (fs.existsSync(dotenvPath)) {
    const dotenv = require('dotenv');
    dotenv.config({ path: dotenvPath });
  }
} catch (e) {
  // dotenv optional
}

console.log('----------------------------------------------------');
console.log('[System Release Engine] Running Automated Release Generation...');

// Read base package version
let BASE_VERSION = '2.8.0';
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  if (pkg.version) BASE_VERSION = pkg.version;
} catch (e) {
  // fallback
}
const CURRENT_VERSION = BASE_VERSION.startsWith('v') ? BASE_VERSION : `v${BASE_VERSION}`;

// Helper to run git commands safely
function runGit(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch (err) {
    return null;
  }
}

// 1. Extract Git & Deployment Metadata
const currentBranch = 
  process.env.VERCEL_GIT_COMMIT_REF || 
  runGit('rev-parse --abbrev-ref HEAD') || 
  'refactor/module-folders';

const latestCommitHash = 
  process.env.VERCEL_GIT_COMMIT_SHA || 
  runGit('rev-parse HEAD') || 
  'unknown';

const latestShortHash = 
  (process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : null) || 
  runGit('rev-parse --short HEAD') || 
  'latest';

const latestCommitDate = runGit('log -1 --format=%cI') || new Date().toISOString();

const latestCommitMsg = 
  process.env.VERCEL_GIT_COMMIT_MESSAGE || 
  runGit('log -1 --format=%s') || 
  'Production System Enhancements & English Unification';

// Helper to detect affected modules based on commit or changes (in English)
function detectModules(text) {
  const t = (text || '').toLowerCase();
  const mods = [];
  if (t.includes('prepack')) mods.push('MyPrepacking');
  if (t.includes('cylinder') || t.includes('oxygen') || t.includes('kewps')) mods.push('MyCylinder');
  if (t.includes('formulari') || t.includes('paediatric') || t.includes('drug') || t.includes('lasa')) mods.push('MyFormulari');
  if (t.includes('suhu') || t.includes('temp') || t.includes('chiller')) mods.push('MySuhu');
  if (t.includes('porter') || t.includes('driver')) mods.push('MyPorter');
  if (t.includes('kunci') || t.includes('key')) mods.push('MyKunci');
  if (t.includes('staff') || t.includes('leave') || t.includes('orgchart')) mods.push('MyStaff');
  if (t.includes('perolehan') || t.includes('procurement') || t.includes('lpo') || t.includes('po')) mods.push('MyPerolehan');
  if (t.includes('warrant') || t.includes('budget')) mods.push('MyWarrant');
  if (t.includes('offline') || t.includes('sync') || t.includes('pwa') || t.includes('queue')) mods.push('Offline Engine');
  if (t.includes('hub') || t.includes('admin') || t.includes('menu') || t.includes('broadcast')) mods.push('Operation Hub');
  if (t.includes('depth') || t.includes('contrast') || t.includes('token') || t.includes('theme') || t.includes('style')) mods.push('Design System & Depth');
  if (mods.length === 0) mods.push('All Modules');
  return [...new Set(mods)];
}

// Author sanitizer
function sanitizeAuthor(rawAuthor) {
  if (!rawAuthor) return 'H.O.M.E. System Administrator';
  const a = rawAuthor.trim();
  const lower = a.toLowerCase();
  if (lower.includes('lawas') || lower.includes('blslawas') || lower.includes('ci/cd') || lower.includes('root') || lower.includes('admin') || lower === 'continuous integration (ci/cd)') {
    return 'H.O.M.E. System Administrator';
  }
  return 'H.O.M.E. System Administrator';
}

// Extract raw git commits
let recentCommits = [];
try {
  const rawLog = execSync('git log -n 50 --format="%H<|%h<|%an<|%cI<|%s"', {
    cwd: rootDir,
    encoding: 'utf8'
  });
  
  recentCommits = rawLog
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('<|');
      return {
        hash: parts[0] || '',
        shortHash: parts[1] || '',
        author: sanitizeAuthor(parts[2]),
        date: parts[3] || '',
        message: parts[4] || ''
      };
    });
} catch (e) {
  console.warn('[System Release Engine] Git log extraction notice:', e.message);
}

// Fallback if git log returns nothing (e.g. headless/Vercel)
if (recentCommits.length === 0 && process.env.VERCEL_GIT_COMMIT_SHA) {
  recentCommits.push({
    hash: process.env.VERCEL_GIT_COMMIT_SHA,
    shortHash: process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7),
    author: sanitizeAuthor(process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME),
    date: new Date().toISOString(),
    message: latestCommitMsg
  });
}

// 2. Canonical structured releases (100% Professional Hospital English)
const BUILT_IN_RELEASES = [
  {
    id: 'release-v2-8-1',
    title: 'System Release & Production Depth Harmonization v2.8.1',
    content: `• System-Wide Modern Depth & Contrast Overhaul: Full dark-first token alignment across 401 components; complete elimination of inverted white backgrounds, table contrast hardening to WCAG 2.2 AA standard.
• Medical Oxygen Pipeline & Fleet Logistics: Real-time 4-stage cylinder pipeline (Store, Ward, Empty, Supplier), integrated supplier return dispatch, and collapsible logistics telemetry sidebar.
• Tier-1 Zero-Connectivity Offline Engine: Complete IndexedDB cache warming for Prepack batches, Transporter fleet, Tempahan rooms, and cross-border emergency transfer logs with reconnection replay.
• MyFormulari Depth & Clinical Monograph Suite: Standardized ModulePageHeader across Antidote, Drug Quota, Drug Alternatives, and Paediatric dosage protocols with non-glare clinical monographs.
• Operations Hub & Executive Bar: Compact 1-click Quick Launch strip, tactile depth module cards with micro-motion feedback, and real-time release synchronization.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.8.1',
    affected_modules: ['All Modules', 'MyCylinder', 'MyPrepacking', 'MyFormulari', 'Operation Hub', 'Offline Engine', 'Design System & Depth'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: true,
    metadata: {
      commit_hash: latestShortHash,
      branch: currentBranch,
      build_date: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'release-v2-8-0',
    title: 'System Release & Modern Depth Harmonization v2.8.0',
    content: `• System-Wide Modern Depth & Inverted Color Harmonization: Complete elimination of stark light backgrounds across 234 components; dark-mode-first token adoption (--bg-surface, --bg-elevated) with crisp hairline borders (1px solid var(--border-default)) and WCAG 2.2 AA contrast compliance.
• Medical Oxygen Pipeline & Supplier Returns Suite: Interactive 4-stage cylinder pipeline flow (StoreBalanceGrid: Store, Ward, Empty, Supplier), real-time supplier return dispatch tracking, and collapsible fleet logistics sidebar.
• Tier-1 Zero-Connectivity Offline Preloader: Automated IndexedDB cache preloading for Prepack batches, Transporter fleet, Tempahan rooms, MSDS records, and Crossborder logs with forensic mutation replay upon reconnection.
• MyFormulari Depth & Clinical Monograph Suite: Standardized ModulePageHeader across Antidote, Drug Quota, Drug Alternatives, and Antimicrobial modules with non-glare clinical monographs and paediatric dosage protocols.
• Operations Hub Modern Depth Overhaul: High-efficiency compact executive bar saving 140px vertical height, 1-click Quick Launch strip, and tactile depth module cards with micro-motion feedback.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.8.0',
    affected_modules: ['All Modules', 'MyCylinder', 'MyPrepacking', 'MyFormulari', 'Operation Hub', 'Offline Engine', 'Design System & Depth'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: {
      commit_hash: latestShortHash,
      branch: currentBranch,
      build_date: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'release-v2-7-0',
    title: 'System Release & Mobile Architecture Redesign v2.7.0',
    content: `• Universal Mobile Native Architecture: Native mobile bottom tab bar navigation (TabBar), spring-physics bottom sheets (BottomSheet), large title collapse on scroll (LargeTitleHeader), touch haptics and pull-to-refresh across all hospital operational modules.
• MyPrepacking Formulation Editor & Audit Suite: Comprehensive 5-tab galenical compounding monograph editor with real-time ingredients table, multi-step compounding SOPs, in-process QC checklists, and tamper-evident audit history logs.
• Galenical Monograph SOP Viewer: One-click clinical monograph viewer with official KKM/MOH compounding formulation breakdowns, beyond-use date (BUD) calculations, and instant thermal label previews.
• Mobile Responsive Data Views: Automatic adaptation of tabular data into high-density clinical touch cards (ListCard) on phone and tablet viewports with zero horizontal scrolling.
• Production Asset Synchronization: Automated deployment verification, browser cache busting, and real-time database release synchronization.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.7.0',
    affected_modules: ['All Modules', 'MyPrepacking', 'Operation Hub', 'System Architecture', 'Mobile Architecture'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: {
      commit_hash: 'c49cb66',
      branch: currentBranch,
      build_date: '2026-10-11T10:12:18.000Z'
    },
    created_at: '2026-10-11T10:12:18.000Z',
    updated_at: '2026-10-11T10:12:18.000Z'
  },
  {
    id: 'release-v2-6-1',
    title: 'System Release & Production Deployment Sync v2.6.1',
    content: `• Automated Production CI/CD Sync: Real-time deployment tracking with live Supabase database release log synchronization.
• Multi-Module Quality Hardening: Complete English unification and audit log parity across all 23 hospital operation modules.
• High-Precision Commit Attribution: Exact Git commit hash metadata and automated browser cache busting on each production build.
• Enhanced Operations Hub & Navigation: Instant access to system changelog, release history, and deployment verification.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.6.1',
    affected_modules: ['All Modules', 'System Architecture', 'MyAdmin', 'Operation Hub'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: {
      commit_hash: 'c49cb66',
      branch: currentBranch,
      build_date: '2026-10-10T16:52:19.000Z'
    },
    created_at: '2026-10-10T16:52:19.000Z',
    updated_at: '2026-10-10T16:52:19.000Z'
  },
  {
    id: 'release-v2-6-0',
    title: 'System Release & Ecosystem Language Unification v2.6.0',
    content: `• System-Wide English Standardization: All 23 modules, user interfaces, navigation menus, modals, and forensic audit logs unified to international hospital operational English.
• Clinical Safety & LASA Pharmacy Alignment: Standardized Look-Alike Sound-Alike medication registry, paediatric dosing protocols, and ISMP/KKM clinical guidelines.
• Multi-Echelon KEW.PS-4 Ledgers: Real-time 3-tier inventory tracking across Main Store, Galenical Production, and Active Dispensing counters.
• Automated Production Sync & CI/CD Changelog Engine: Live production deployment tracking and real-time Supabase release synchronization.
• Mobile & Tablet Experience Optimization: Streamlined module grid navigation, crisp typography, and responsive operational layouts.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.6.0',
    affected_modules: ['All Modules', 'MyPrepacking', 'MyFormulari', 'MyStaff', 'MyCylinder', 'MyTransporter', 'MyAdmin'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: {
      commit_hash: 'b5e2fb5',
      branch: currentBranch,
      build_date: '2026-10-10T12:00:00.000Z'
    },
    created_at: '2026-10-10T12:00:00.000Z',
    updated_at: '2026-10-10T12:00:00.000Z'
  },
  {
    id: 'release-v2-5-0',
    title: 'System Release & MyPrepacking Module Launch v2.5.0',
    content: `• New MyPrepacking Module: Unit-of-dose (UOD) medication packaging, production batch logging, BUD expiry tracking, and thermal label studio.
• MyCylinder Offline-First Engine: Full zero-connectivity medical oxygen cylinder tracking powered by local IndexedDB and background synchronization.
• Official MyCylinder KEW.PS-4 Ledger: Automated generation and export of Ministry of Health KEW.PS-4 supply ledgers in PDF and XLSX formats.
• MyFormulari Paediatric Dose Catalogue: Comprehensive paediatric dosing guidelines with smart inventory search and official PDF exports.
• Global Offline Ecosystem: Real-time network status indicator, offline sync drawer, and automated cache invalidation.
• Operations Hub Reorganization: Standardized sub-menu hierarchy across all hospital operational modules and MyAdmin command center.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.5.0',
    affected_modules: ['MyPrepacking', 'MyCylinder', 'MyFormulari', 'Operation Hub', 'Offline Engine', 'Whole System'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: {
      commit_hash: 'b5e2fb5',
      branch: 'refactor/module-folders'
    },
    created_at: '2026-10-08T12:00:00.000Z',
    updated_at: '2026-10-08T12:00:00.000Z'
  },
  {
    id: 'release-v2-4-1',
    title: 'Operations Hub Interface & Typography Enhancements v2.4.1',
    content: `• Streamlined Hub Navigation: Removed redundant search inputs for cleaner, faster module access.
• Mobile Icon Typography Fix: Standardized mobile module titles to prevent text clipping and unwanted line breaks.
• Dynamic System Update Sync: Automated release log synchronization across production Vercel deployments.
• Performance Optimization: Enhanced component code-splitting and automated asset cache purging.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.4.1',
    affected_modules: ['Operation Hub', 'Whole System'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: {},
    created_at: '2026-10-02T13:00:00.000Z',
    updated_at: '2026-10-02T13:00:00.000Z'
  },
  {
    id: 'release-v2-4-0',
    title: 'H.O.M.E. Ecosystem Architecture & Live Broadcasts v2.4.0',
    content: `• Portal UI Overhaul: Clean desktop operational layout and enhanced visual hierarchy.
• Live Maintenance Broadcasts: Real-time broadcast engine powered by live Supabase database subscriptions.
• Integrated Release Notes: Versioned changelog modal accessible to all healthcare staff.
• Zero-Mock Mandate Compliance: Direct database queries across real staff directories and hospital inventory.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.4.0',
    affected_modules: ['All Modules'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: {},
    created_at: '2026-10-02T00:37:26.735Z',
    updated_at: '2026-10-02T00:37:26.735Z'
  },
  {
    id: 'release-v2-3-0',
    title: 'Supabase Database Export & Automated Backup Integration v2.3.0',
    content: `• Automated Database Backups: Scheduled Supabase database exports and automated backup script pipelines.
• Hospital Procurement Ledger Alignment: Standardized Local Purchase Orders (LPO) and government tender tracking.
• Session & Auth Hardening: Strengthened user session token validation and permission handling.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.3.0',
    affected_modules: ['Database', 'MyPerolehan', 'Whole System'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: { commit_hash: 'b5e2fb5' },
    created_at: '2026-09-22T13:47:38.000Z',
    updated_at: '2026-09-22T13:47:38.000Z'
  },
  {
    id: 'release-v2-2-0',
    title: 'Modular Architecture Refactor & File Scheme v2.2.0',
    content: `• Directory Migration: Restructured codebase into clean domain modules under src/modules with barrel exports.
• Domain Types & Constants: Centralized shared types, routes, and constants in src/shared.
• Environment Compatibility: Enhanced parity between local development and production edge servers.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    version_tag: 'v2.2.0',
    affected_modules: ['System Architecture', 'Administration'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: false,
    metadata: { commit_hash: '25366ec' },
    created_at: '2026-06-17T23:52:17.000Z',
    updated_at: '2026-06-17T23:52:17.000Z'
  }
];

// 3. Dynamic Production Release Synthesizer (Automatically detects unreleased commits)
let dynamicReleases = [];

if (recentCommits.length > 0) {
  // Find the commit that established v2.8.1 or baseline
  const baseIndex = recentCommits.findIndex(c => 
    c.message.toLowerCase().includes('v2.8.1') ||
    c.message.toLowerCase().includes('v2.8.0') ||
    c.message.toLowerCase().includes('chore: finalize version manifests')
  );
  
  // Unreleased commits are any newer commits made after the baseline
  const unreleasedCommits = baseIndex > 0 ? recentCommits.slice(0, baseIndex) : [];
  
  if (unreleasedCommits.length > 0) {
    const latestGroup = unreleasedCommits.slice(0, 10);
    const affected = detectModules(latestGroup.map(c => c.message).join(' '));
    
    // Semantic patch bump: e.g. v2.8.1
    const baseMatch = CURRENT_VERSION.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
    const hasFeat = latestGroup.some(c => c.message.toLowerCase().startsWith('feat'));
    let dynamicVersion;
    if (baseMatch) {
      const major = parseInt(baseMatch[1], 10);
      const minor = parseInt(baseMatch[2], 10);
      const patch = parseInt(baseMatch[3], 10);
      dynamicVersion = hasFeat ? `v${major}.${minor + 1}.0` : `v${major}.${minor}.${patch + 1}`;
    } else {
      dynamicVersion = 'v2.8.1';
    }

    dynamicReleases.push({
      id: `release-${dynamicVersion.replace(/\./g, '-')}`,
      title: `System Release & Production Deployment Sync ${dynamicVersion}`,
      content: latestGroup.map(c => `• [${c.shortHash}] ${c.message}`).join('\n'),
      type: 'system_update',
      severity: 'info',
      status: 'published',
      scheduled_start: null,
      scheduled_end: null,
      version_tag: dynamicVersion,
      affected_modules: affected,
      created_by: null,
      created_by_name: 'H.O.M.E. System Administrator',
      is_active: false,
      metadata: {
        commit_hash: latestGroup[0].shortHash,
        branch: currentBranch,
        build_date: new Date().toISOString()
      },
      created_at: latestGroup[0].date || new Date().toISOString(),
      updated_at: latestGroup[0].date || new Date().toISOString()
    });
  }
}

// On Vercel / Edge: if running in CI and commit doesn't match canonical version
if (dynamicReleases.length === 0 && process.env.VERCEL_GIT_COMMIT_SHA) {
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  const vercelMsg = process.env.VERCEL_GIT_COMMIT_MESSAGE || 'Production system updates and optimizations';
  const isKnown = BUILT_IN_RELEASES.some(r => r.metadata?.commit_hash === vercelSha);
  
  if (!isKnown && !vercelMsg.toLowerCase().includes(CURRENT_VERSION.toLowerCase())) {
    const dynamicVersion = `${CURRENT_VERSION}-sync`;
    dynamicReleases.push({
      id: `release-prod-${vercelSha}`,
      title: `Production Deployment Live Sync (${vercelSha})`,
      content: `• Automated Production CI/CD Deployment: ${vercelMsg}\n• Deployed from Git branch: ${currentBranch}\n• Exact Commit Reference: ${vercelSha}`,
      type: 'system_update',
      severity: 'info',
      status: 'published',
      scheduled_start: null,
      scheduled_end: null,
      version_tag: dynamicVersion,
      affected_modules: detectModules(vercelMsg),
      created_by: null,
      created_by_name: 'H.O.M.E. System Administrator',
      is_active: false,
      metadata: {
        commit_hash: vercelSha,
        branch: currentBranch,
        build_date: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}

const ALL_SYSTEM_RELEASES = [...dynamicReleases, ...BUILT_IN_RELEASES];

// 4. Write public/version.json for client-side live deployment detection (FULL objects)
const versionJsonPath = path.join(rootDir, 'public', 'version.json');
const versionData = {
  version: CURRENT_VERSION,
  buildTime: new Date().toISOString(),
  commitHash: latestShortHash,
  fullCommitHash: latestCommitHash,
  branch: currentBranch,
  latestCommitDate: latestCommitDate,
  latestCommitMessage: latestCommitMsg,
  releases: ALL_SYSTEM_RELEASES,
  recentCommits: recentCommits.slice(0, 30)
};

safeWriteFileSync(versionJsonPath, JSON.stringify(versionData, null, 2));
console.log(`[System Release Engine] Written ${versionJsonPath}`);

// 5. Write src/config/generatedReleases.json
const generatedJsonPath = path.join(rootDir, 'src', 'config', 'generatedReleases.json');
safeWriteFileSync(generatedJsonPath, JSON.stringify(versionData, null, 2));
console.log(`[System Release Engine] Written ${generatedJsonPath}`);

// 6. Update src/config/systemReleases.ts
const systemReleasesTsPath = path.join(rootDir, 'src', 'config', 'systemReleases.ts');
const tsContent = `// @ts-nocheck
/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated by scripts/generate_system_releases.cjs
 * Generated at: ${new Date().toISOString()}
 * Git Commit: ${latestShortHash} (${currentBranch})
 */
import type { SystemAnnouncement } from '@/services/systemAnnouncementService'

export const CURRENT_SYSTEM_VERSION = '${CURRENT_VERSION}'
export const BUILD_COMMIT_HASH = '${latestShortHash}'
export const BUILD_TIMESTAMP = '${new Date().toISOString()}'

export const RECENT_GIT_COMMITS: Array<{
  hash: string
  shortHash: string
  author: string
  date: string
  message: string
}> = ${JSON.stringify(recentCommits.slice(0, 30), null, 2)};

export const SYSTEM_RELEASES: SystemAnnouncement[] = ${JSON.stringify(ALL_SYSTEM_RELEASES, null, 2)};
`;

safeWriteFileSync(systemReleasesTsPath, tsContent);
console.log(`[System Release Engine] Written ${systemReleasesTsPath}`);

// 7. Update cache buster version in src/shared/utils/cacheBuster.ts
try {
  const cacheBusterPath = path.join(rootDir, 'src', 'shared', 'utils', 'cacheBuster.ts');
  if (fs.existsSync(cacheBusterPath)) {
    let cbContent = fs.readFileSync(cacheBusterPath, 'utf8');
    const newCacheVersion = `HOME_CACHE_V${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12)}`;
    cbContent = cbContent.replace(
      /export const SYSTEM_CACHE_VERSION = '.*?'/,
      `export const SYSTEM_CACHE_VERSION = '${newCacheVersion}'`
    );
    safeWriteFileSync(cacheBusterPath, cbContent);
    console.log(`[System Release Engine] Bumped Cache Buster to ${newCacheVersion}`);
  }
} catch (e) {
  console.warn('[System Release Engine] Cache buster update warning:', e.message);
}

// 8. Synchronize to Supabase system_announcements table
async function syncToSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log('[System Release Engine] Supabase credentials not found in env, skipping remote DB sync.');
    return;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    console.log('[System Release Engine] Connecting to Supabase for release synchronization...');
    
    // Purge legacy build-* and non-standard release records
    const { error: purgeBuildErr } = await supabase
      .from('system_announcements')
      .delete()
      .or('version_tag.ilike.build%,content.ilike.%Lawas%');

    if (purgeBuildErr) {
      console.warn('[System Release Engine] Purge build tags notice:', purgeBuildErr.message);
    } else {
      console.log('[System Release Engine] Purged legacy build- tag entries from Supabase.');
    }

    // Fetch existing announcements
    const { data: existing, error: fetchErr } = await supabase
      .from('system_announcements')
      .select('id, version_tag, title');

    if (fetchErr) {
      console.warn('[System Release Engine] Could not query Supabase announcements:', fetchErr.message);
      return;
    }

    const existingMap = new Map();
    for (const r of (existing || [])) {
      if (r.version_tag) {
        existingMap.set(r.version_tag, r.id);
      }
    }

    for (const release of ALL_SYSTEM_RELEASES) {
      const existingId = existingMap.get(release.version_tag);

      if (existingId) {
        // Update existing record
        console.log(`[System Release Engine] Updating release ${release.version_tag} in Supabase...`);
        const { error: updateErr } = await supabase
          .from('system_announcements')
          .update({
            title: release.title,
            content: release.content,
            type: release.type,
            severity: release.severity,
            status: release.status,
            scheduled_start: release.scheduled_start,
            scheduled_end: release.scheduled_end,
            version_tag: release.version_tag,
            affected_modules: release.affected_modules,
            created_by_name: release.created_by_name,
            is_active: release.is_active,
            metadata: release.metadata || {},
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId);

        if (updateErr) {
          console.warn(`[System Release Engine] Could not update ${release.version_tag}:`, updateErr.message);
        }
      } else {
        // Insert new release
        console.log(`[System Release Engine] Inserting new release ${release.version_tag} into Supabase...`);
        const { error: insertErr } = await supabase
          .from('system_announcements')
          .insert({
            title: release.title,
            content: release.content,
            type: release.type,
            severity: release.severity,
            status: release.status,
            scheduled_start: release.scheduled_start,
            scheduled_end: release.scheduled_end,
            version_tag: release.version_tag,
            affected_modules: release.affected_modules,
            created_by: null,
            created_by_name: release.created_by_name,
            is_active: release.is_active,
            metadata: release.metadata || {},
            created_at: release.created_at || new Date().toISOString(),
            updated_at: release.updated_at || new Date().toISOString()
          });

        if (insertErr) {
          console.warn(`[System Release Engine] Could not insert ${release.version_tag}:`, insertErr.message);
        } else {
          console.log(`[System Release Engine] Successfully inserted ${release.version_tag} into Supabase!`);
        }
      }
    }
  } catch (err) {
    console.warn('[System Release Engine] Supabase sync error:', err.message);
  }
}

// Execute sync
syncToSupabase().then(() => {
  console.log('[System Release Engine] Automated release generation and database parity completed.');
  console.log('----------------------------------------------------');
}).catch(err => {
  console.error('[System Release Engine] Error during release sync:', err);
  console.log('----------------------------------------------------');
});
