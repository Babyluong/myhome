if (!process.argv.includes('--publish') && !process.argv.includes('--preview')) { console.error('Explicit --publish required'); process.exit(1); }
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('[Sync] Supabase credentials missing from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

const CANONICAL_RELEASES = [
  {
    version_tag: 'v2.6.0',
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
    affected_modules: ['All Modules', 'MyPrepacking', 'MyFormulari', 'MyStaff', 'MyCylinder', 'MyTransporter', 'MyAdmin'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: true,
    metadata: {
      commit_hash: 'latest',
      branch: 'refactor/module-folders',
      release_type: 'major_enhancement'
    },
    created_at: '2026-10-10T12:00:00.000Z'
  },
  {
    version_tag: 'v2.5.0',
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
    affected_modules: ['MyPrepacking', 'MyCylinder', 'MyFormulari', 'Operation Hub', 'Offline Engine', 'Whole System'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: true,
    metadata: {
      commit_hash: 'b5e2fb5',
      branch: 'refactor/module-folders'
    },
    created_at: '2026-10-08T12:00:00.000Z'
  },
  {
    version_tag: 'v2.4.1',
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
    affected_modules: ['Operation Hub', 'Whole System'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: true,
    metadata: {},
    created_at: '2026-10-02T13:00:00.000Z'
  },
  {
    version_tag: 'v2.4.0',
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
    affected_modules: ['All Modules'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: true,
    metadata: {},
    created_at: '2026-10-02T00:37:26.735Z'
  },
  {
    version_tag: 'v2.3.0',
    title: 'Supabase Database Export & Automated Backup Integration v2.3.0',
    content: `• Automated Database Backups: Scheduled Supabase database exports and automated backup script pipelines.
• Hospital Procurement Ledger Alignment: Standardized Local Purchase Orders (LPO) and government tender tracking.
• Session & Auth Hardening: Strengthened user session token validation and permission handling.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    affected_modules: ['Database', 'MyPerolehan', 'Whole System'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: true,
    metadata: {
      commit_hash: 'b5e2fb5'
    },
    created_at: '2026-09-22T13:47:38.000Z'
  },
  {
    version_tag: 'v2.2.0',
    title: 'Modular Architecture Refactor & File Scheme v2.2.0',
    content: `• Directory Migration: Restructured codebase into clean domain modules under src/modules with barrel exports.
• Domain Types & Constants: Centralized shared types, routes, and constants in src/shared.
• Environment Compatibility: Enhanced parity between local development and production edge servers.`,
    type: 'system_update',
    severity: 'info',
    status: 'published',
    scheduled_start: null,
    scheduled_end: null,
    affected_modules: ['System Architecture', 'Administration'],
    created_by: null,
    created_by_name: 'H.O.M.E. System Administrator',
    is_active: true,
    metadata: {
      commit_hash: '25366ec'
    },
    created_at: '2026-06-17T23:52:17.000Z'
  }
];

async function sync() {
  // Fetch current rows
  const { data: currentRows, error: fetchErr } = await supabase
    .from('system_announcements')
    .select('id, version_tag,created_by,created_by_name,metadata');

  if (fetchErr) {
    throw fetchErr;
  }

  const existingMap = new Map();
  for (const row of currentRows || []) {
    if (row.version_tag) {
      if (existingMap.has(row.version_tag)) throw new Error('Ambiguous release version');
      existingMap.set(row.version_tag, row);
    }
  }

  const plan = CANONICAL_RELEASES.map(rel => {
    const prior = existingMap.get(rel.version_tag);
    if (prior && prior.metadata?.managed_by !== 'home_release_engine' && !(prior.created_by === null && prior.created_by_name === rel.created_by_name)) throw new Error('Unmanaged release conflict');
    return { rel, existingId: prior?.id };
  });
  if (process.argv.includes('--preview')) { console.log(JSON.stringify({ preview: true, writes: 0, plan: plan.map(entry => ({ action: entry.existingId ? 'update' : 'insert', id: entry.existingId, version: entry.rel.version_tag })) })); return; }
  for (const { rel, existingId } of plan) {
    if (existingId) {
      console.log(`[Sync] Updating existing record for ${rel.version_tag} (${existingId}) to English...`);
      const { error: updateErr } = await supabase
        .from('system_announcements')
        .update({
          title: rel.title,
          content: rel.content,
          type: rel.type,
          severity: rel.severity,
          status: rel.status,
          scheduled_start: rel.scheduled_start,
          scheduled_end: rel.scheduled_end,
          version_tag: rel.version_tag,
          affected_modules: rel.affected_modules,
          created_by_name: rel.created_by_name,
          is_active: rel.is_active,
          metadata: { ...rel.metadata, managed_by: 'home_release_engine' },
          created_at: rel.created_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId);

      if (updateErr) {
        throw updateErr;
      } else {
        console.log(`[Sync] Successfully updated ${rel.version_tag} to English.`);
      }
    } else {
      console.log(`[Sync] Inserting new release ${rel.version_tag}...`);
      const { error: insErr } = await supabase
        .from('system_announcements')
        .insert({
          title: rel.title,
          content: rel.content,
          type: rel.type,
          severity: rel.severity,
          status: rel.status,
          scheduled_start: rel.scheduled_start,
          scheduled_end: rel.scheduled_end,
          version_tag: rel.version_tag,
          affected_modules: rel.affected_modules,
          created_by: null,
          created_by_name: rel.created_by_name,
          is_active: rel.is_active,
          metadata: { ...rel.metadata, managed_by: 'home_release_engine' },
          created_at: rel.created_at,
          updated_at: new Date().toISOString()
        });

      if (insErr) {
        throw insErr;
      } else {
        console.log(`[Sync] Successfully inserted ${rel.version_tag} into Supabase.`);
      }
    }
  }

  console.log('[Sync] Managed release publication completed');
}

sync().catch(() => { console.error('[Sync] Publishing failed'); process.exitCode = 1; });
