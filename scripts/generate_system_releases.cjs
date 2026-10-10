const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

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

// Helper to run git commands safely
function runGit(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch (err) {
    return null;
  }
}

// 1. Extract Git & Deployment Metadata
// Support Vercel deployment environment variables or fallback to git
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
  if (mods.length === 0) mods.push('All Modules');
  return [...new Set(mods)];
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
        author: parts[2] || '',
        date: parts[3] || '',
        message: parts[4] || ''
      };
    });
} catch (e) {
  console.warn('[System Release Engine] Git log extraction warning:', e.message);
}

// 2. Canonical structured releases (100% Professional Hospital English)
const CURRENT_VERSION = 'v2.6.1';

const BUILT_IN_RELEASES = [
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
      commit_hash: latestShortHash,
      branch: currentBranch,
      build_date: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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

// Baseline commit for canonical releases
// Commits created after v2.6.1 will be automatically detected as dynamic production releases
let dynamicReleases = [];

if (recentCommits.length > 0) {
  const baseIndex = recentCommits.findIndex(c => 
    c.message.toLowerCase().includes('v2.6.1') ||
    c.shortHash === 'b5e2fb5' || 
    c.hash.startsWith('b5e2fb5')
  );
  const unreleasedCommits = baseIndex > 0 ? recentCommits.slice(0, baseIndex) : [];
  
  if (unreleasedCommits.length > 0) {
    const latestGroup = unreleasedCommits.slice(0, 5);
    const affected = detectModules(latestGroup.map(c => c.message).join(' '));
    
    dynamicReleases.push({
      id: `release-${latestGroup[0].shortHash}`,
      title: `Latest Production Deployment: ${latestGroup[0].message}`,
      content: latestGroup.map(c => `• [${c.shortHash}] ${c.message} (${c.author})`).join('\n'),
      type: 'system_update',
      severity: 'info',
      status: 'published',
      scheduled_start: null,
      scheduled_end: null,
      version_tag: `build-${latestGroup[0].shortHash}`,
      affected_modules: affected,
      created_by: null,
      created_by_name: 'Continuous Integration (CI/CD)',
      is_active: false,
      metadata: {
        commit_hash: latestGroup[0].shortHash,
        branch: currentBranch
      },
      created_at: latestGroup[0].date || new Date().toISOString(),
      updated_at: latestGroup[0].date || new Date().toISOString()
    });
  }
}

const ALL_SYSTEM_RELEASES = [...dynamicReleases, ...BUILT_IN_RELEASES];

// 3. Write public/version.json for client-side live deployment detection
const versionJsonPath = path.join(rootDir, 'public', 'version.json');
const versionData = {
  version: CURRENT_VERSION,
  buildTime: new Date().toISOString(),
  commitHash: latestShortHash,
  fullCommitHash: latestCommitHash,
  branch: currentBranch,
  latestCommitDate: latestCommitDate,
  latestCommitMessage: latestCommitMsg,
  releases: ALL_SYSTEM_RELEASES.map(r => ({
    id: r.id,
    version_tag: r.version_tag,
    title: r.title,
    created_at: r.created_at
  })),
  recentCommits: recentCommits.slice(0, 20)
};

fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2), 'utf8');
console.log(`[System Release Engine] Written ${versionJsonPath}`);

// 4. Write src/config/generatedReleases.json
const generatedJsonPath = path.join(rootDir, 'src', 'config', 'generatedReleases.json');
fs.writeFileSync(generatedJsonPath, JSON.stringify(versionData, null, 2), 'utf8');
console.log(`[System Release Engine] Written ${generatedJsonPath}`);

// 5. Update src/config/systemReleases.ts
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
}> = ${JSON.stringify(recentCommits.slice(0, 20), null, 2)};

export const SYSTEM_RELEASES: SystemAnnouncement[] = ${JSON.stringify(ALL_SYSTEM_RELEASES, null, 2)};
`;

fs.writeFileSync(systemReleasesTsPath, tsContent, 'utf8');
console.log(`[System Release Engine] Written ${systemReleasesTsPath}`);

// 6. Update cache buster version in src/shared/utils/cacheBuster.ts
try {
  const cacheBusterPath = path.join(rootDir, 'src', 'shared', 'utils', 'cacheBuster.ts');
  if (fs.existsSync(cacheBusterPath)) {
    let cbContent = fs.readFileSync(cacheBusterPath, 'utf8');
    const newCacheVersion = `HOME_CACHE_V${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12)}`;
    cbContent = cbContent.replace(
      /export const SYSTEM_CACHE_VERSION = '.*?'/,
      `export const SYSTEM_CACHE_VERSION = '${newCacheVersion}'`
    );
    fs.writeFileSync(cacheBusterPath, cbContent, 'utf8');
    console.log(`[System Release Engine] Bumped Cache Buster to ${newCacheVersion}`);
  }
} catch (e) {
  console.warn('[System Release Engine] Cache buster update warning:', e.message);
}

// 7. Synchronize to Supabase system_announcements table
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
        // Update existing record with latest English content
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
