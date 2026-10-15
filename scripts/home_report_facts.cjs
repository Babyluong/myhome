#!/usr/bin/env node
/**
 * home_report_facts.cjs
 *
 * Read-only evidence extractor for the H.O.M.E. system module report.
 * Every quantitative claim in the report is derived here from repository
 * sources (source tree, route table, module registry, hub catalogue, SQL
 * migrations, release manifest) so the document stays traceable to a revision.
 *
 * No network calls. No database access. Writes only the optional --out file.
 *
 * Usage: node scripts/home_report_facts.cjs [--out <file.json>] [--quiet]
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

function walk(dir, acc = []) {
  if (!exists(dir)) return acc;
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, acc);
    else acc.push(rel);
  }
  return acc;
}

/** 1. Release identity. */
function releaseFacts() {
  const pkg = JSON.parse(read('package.json'));
  const releases = read('src/config/systemReleases.ts');
  const pick = (re) => (releases.match(re) || [])[1] || null;
  const versionJson = exists('public/version.json') ? JSON.parse(read('public/version.json')) : {};
  return {
    name: pkg.name,
    version: pkg.version,
    releaseVersion: pick(/CURRENT_SYSTEM_VERSION = '([^']+)'/),
    commit: pick(/BUILD_COMMIT_HASH = '([^']+)'/),
    buildTimestamp: pick(/BUILD_TIMESTAMP = '([^']+)'/),
    branch: versionJson.branch || null,
    dependencies: Object.keys(pkg.dependencies || {}).length,
    devDependencies: Object.keys(pkg.devDependencies || {}).length,
    dependencyList: Object.keys(pkg.dependencies || {}).sort(),
  };
}

/** 2. Codebase scale. */
function scaleFacts() {
  const src = walk('src');
  const code = src.filter((f) => /\.tsx?$/.test(f));
  let loc = 0;
  for (const f of code) loc += read(f).split(/\r?\n/).length;
  const moduleDirs = fs
    .readdirSync(path.join(ROOT, 'src/modules'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  return {
    srcFiles: src.length,
    codeFiles: code.length,
    components: code.filter((f) => f.endsWith('.tsx')).length,
    loc,
    moduleDirs: moduleDirs.length,
    moduleDirList: moduleDirs,
    sharedServices: walk('src/services').filter((f) => /\.tsx?$/.test(f)).length,
    testFiles: walk('tests').length,
  };
}

/** 3. Database evidence from migration SQL (repository source, not live DB). */
function databaseFacts() {
  const dir = 'supabase/migrations';
  const files = fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.sql')).sort();
  const tables = new Set();
  const tableByFile = {};
  let policies = 0;
  let rlsEnabled = 0;
  let functions = 0;
  let triggers = 0;
  let inserts = 0;
  for (const f of files) {
    const sql = read(`${dir}/${f}`);
    const found = [];
    for (const m of sql.matchAll(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(?:public\.)?([a-z_0-9]+)/gi)) {
      tables.add(m[1].toLowerCase());
      found.push(m[1].toLowerCase());
    }
    if (found.length) tableByFile[f] = found;
    policies += (sql.match(/CREATE POLICY/gi) || []).length;
    rlsEnabled += (sql.match(/ENABLE ROW LEVEL SECURITY/gi) || []).length;
    functions += (sql.match(/CREATE (?:OR REPLACE )?FUNCTION/gi) || []).length;
    triggers += (sql.match(/CREATE TRIGGER/gi) || []).length;
    inserts += (sql.match(/INSERT INTO/gi) || []).length;
  }
  return {
    migrationFiles: files.length,
    firstMigration: files[0],
    lastMigration: files[files.length - 1],
    tables: tables.size,
    tableList: [...tables].sort(),
    policies,
    rlsEnabled,
    functions,
    triggers,
    seedInserts: inserts,
    tableByFile,
  };
}

/** 4. Module registry and RBAC contract. */
function registryFacts() {
  const src = read('src/shared/constants/moduleRegistry.ts');
  const modules = [];
  const blocks = src.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const code = (block.match(/code: '([a-z_0-9]+)'/) || [])[1];
    if (!code) continue;
    const officialName = (block.match(/officialName: '([^']+)'/) || [])[1];
    if (!officialName) continue;
    const name = (block.match(/\bname: '([^']+)'/) || [])[1];
    const category = (block.match(/category: '([a-z]+)'/) || [])[1];
    const routePath = (block.match(/routePath: '([^']+)'/) || [])[1];
    const description = (block.match(/description: '([^']+)'/) || [])[1];
    const isCore = /isCore: true/.test(block);
    const rolesBlock = (block.match(/defaultRoles: \[([^\]]*)\]/) || [])[1] || '';
    const defaultRoles = rolesBlock.split(',').map((r) => r.trim().replace(/'/g, '')).filter(Boolean);
    const featureBlock = block.split('features: [')[1] || '';
    const features = [...featureBlock.matchAll(/code: '([a-z_0-9]+)',\s*\n\s*name: '([^']+)'/g)]
      .map((m) => ({ code: m[1], name: m[2] }));
    modules.push({ code, name, officialName, category, routePath, description, isCore, defaultRoles, features });
  }
  const actionBlock = (src.split('export const ACTION_DEFINITIONS')[1] || '').split('export const SYSTEM_MODULE_REGISTRY')[0];
  const actions = [...actionBlock.matchAll(/\n  ([a-z]+): \{\s*\n\s*label: '([^']+)',\s*\n\s*description: '([^']+)'/g)]
    .map((m) => ({ code: m[1], label: m[2], description: m[3] }));
  const presetBlock = src.split('export const ROLE_CAPABILITY_PRESETS')[1] || '';
  const presets = [...presetBlock.matchAll(/\n  ([a-z_]+): \{\s*\n\s*label: '([^']+)',\s*\n\s*description: '([^']+)'/g)]
    .map((m) => ({ code: m[1], label: m[2], description: m[3] }));
  const rolesSrc = read('src/shared/constants/roles.ts');
  const roles = [...new Set([...rolesSrc.matchAll(/^  [A-Z_0-9]+: '([a-z_]+)',/gm)].map((m) => m[1]))];
  const displayNames = {};
  for (const m of rolesSrc.matchAll(/\[SYSTEM_ROLES\.([A-Z_0-9]+)\]: '([^']+)'/g)) displayNames[m[1]] = m[2];
  return {
    modules,
    featureCount: modules.reduce((n, m) => n + m.features.length, 0),
    actions,
    presets,
    roles,
    roleCount: roles.length,
    displayNames,
  };
}

/** 5. Hub catalogue as presented to staff. */
function hubFacts() {
  const src = read('src/modules/hub/pages/ModuleHubPage.tsx');
  const tiles = [];
  const re = /id: '([a-z]+)',\s*\n\s*name: '([^']+)',\s*\n\s*shortName: '([^']+)',\s*\n\s*description: '([^']+)',\s*\n\s*category: '([a-z]+)',/g;
  for (const m of src.matchAll(re)) {
    tiles.push({ id: m[1], name: m[2], shortName: m[3], description: m[4], category: m[5] });
  }
  const counts = {};
  for (const t of tiles) counts[t.category] = (counts[t.category] || 0) + 1;
  const subMenus = walk('src/modules/hub/pages/modules')
    .filter((f) => f.endsWith('SubMenu.tsx'))
    .map((f) => path.basename(f, '.tsx'))
    .sort();
  return { tiles, tileCount: tiles.length, categoryCounts: counts, subMenus };
}

/** 6. Route surface. */
function routeFacts() {
  const src = read('src/routes/routes.tsx');
  const paths = [...src.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
  const byPrefix = {};
  for (const p of paths) {
    const seg = p.split('/').filter(Boolean)[0] || '(root)';
    byPrefix[seg] = (byPrefix[seg] || 0) + 1;
  }
  const constants = read('src/shared/constants/routes.ts');
  return {
    declaredPaths: paths.length,
    uniquePaths: new Set(paths).size,
    byPrefix,
    lazyImports: (src.match(/lazy\(\(\) =>/g) || []).length,
    routeConstants: (constants.match(/^\s{2}[A-Z_0-9]+:/gm) || []).length,
    pathList: paths,
  };
}

/** 7. Per-module implementation evidence. */
function moduleEvidence(dirName) {
  const dir = `src/modules/${dirName}`;
  if (!exists(dir)) return null;
  const files = walk(dir).filter((f) => /\.tsx?$/.test(f));
  const pages = files.filter((f) => f.includes('/pages/'));
  const services = files.filter((f) => f.includes('/services/'));
  const components = files.filter((f) => f.includes('/components/'));
  const staticData = walk(`${dir}/data`);
  const tables = new Set();
  let dbFromCalls = 0;
  let localStoreHits = 0;
  const flags = { supabase: false, offline: false, audit: false, rbac: false, pdf: false, qr: false, localStorage: false, seed: false };
  for (const f of files) {
    const s = read(f);
    for (const m of s.matchAll(/supabase\s*\n?\s*\.from\(\s*['"`]([a-z_0-9]+)['"`]/g)) {
      tables.add(m[1]);
      dbFromCalls += 1;
    }
    localStoreHits += (s.match(/localStorage\.(get|set|remove)Item/g) || []).length;
    if (/services\/supabase|@supabase\/supabase-js/.test(s)) flags.supabase = true;
    if (/offlineAdapter|offlineQueue|offlineFetch|offlinePreloader/.test(s)) flags.offline = true;
    if (/audit_logs|auditService|logAudit/.test(s)) flags.audit = true;
    if (/usePermission|PermissionGate|rbacService|cylinderRbac|inventoryRbac/.test(s)) flags.rbac = true;
    if (/jspdf|pdf-lib|pdfHeader|autoTable/.test(s)) flags.pdf = true;
    if (/jsQR|jsqr|QRCode|qrcode/.test(s)) flags.qr = true;
    if (/localStorage\.(get|set|remove)Item/.test(s)) flags.localStorage = true;
    if (/getMockData|setMockData|_mock_|MOCK_|DEFAULT_[A-Z_]+_SEED|initMockData|SEED_DATA/i.test(s)) flags.seed = true;
  }
  // Persistence tier: where the module's records actually live.
  let persistence = 'reference-only';
  if (dbFromCalls > 0) persistence = 'database';
  else if (flags.localStorage) persistence = 'browser-local';
  else if (staticData.length > 0) persistence = 'static-bundle';
  return {
    dir: dirName,
    files: files.length,
    pages: pages.length,
    services: services.length,
    components: components.length,
    staticDataFiles: staticData.length,
    supabaseFromCalls: dbFromCalls,
    localStorageCalls: localStoreHits,
    tables: [...tables].sort(),
    tableCount: tables.size,
    persistence,
    flags,
    pageList: pages.map((p) => path.basename(p)),
  };
}

/** 8. Platform capability evidence. */
function platformFacts() {
  const offline = exists('src/services/offlinePreloader.ts') ? read('src/services/offlinePreloader.ts') : '';
  const prewarmed = [...new Set([...offline.matchAll(/\.from\('([a-z_0-9]+)'\)/g)].map((m) => m[1]))].sort();
  const services = walk('src/services').filter((f) => /\.tsx?$/.test(f)).map((f) => path.basename(f, '.ts'));
  const vite = read('vite.config.ts');
  const functionsDir = 'supabase/functions';
  return {
    offlineTables: prewarmed,
    offlineTableCount: prewarmed.length,
    offlineServices: services.filter((n) => /^offline/.test(n)),
    pwa: /VitePWA/.test(vite),
    serviceCount: services.length,
    edgeFunctions: exists(functionsDir)
      ? fs.readdirSync(path.join(ROOT, functionsDir), { withFileTypes: true })
          .filter((d) => d.isDirectory()).map((d) => d.name).sort()
      : [],
    ruleChecker: exists('scripts/check-rules.cjs'),
    governanceTests: walk('tests').filter((f) => /agent-|design-tokens/.test(f)).map((f) => path.basename(f)),
    productTests: walk('tests').filter((f) => f.includes('home-')).map((f) => path.basename(f)),
    backups: exists('backups/supabase')
      ? fs.readdirSync(path.join(ROOT, 'backups/supabase'), { withFileTypes: true })
          .filter((d) => d.isDirectory()).map((d) => d.name).sort()
      : [],
  };
}

/** Assemble the full evidence bundle. */
function collect() {
  const scale = scaleFacts();
  const evidence = {};
  for (const d of scale.moduleDirList) evidence[d] = moduleEvidence(d);
  return {
    generatedAt: new Date().toISOString(),
    release: releaseFacts(),
    scale,
    database: databaseFacts(),
    registry: registryFacts(),
    hub: hubFacts(),
    routes: routeFacts(),
    evidence,
    platform: platformFacts(),
  };
}

function main() {
  const args = process.argv.slice(2);
  const facts = collect();
  const outIndex = args.indexOf('--out');
  if (outIndex !== -1 && args[outIndex + 1]) {
    const target = path.resolve(ROOT, args[outIndex + 1]);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(facts, null, 2)}\n`);
  }
  if (!args.includes('--quiet')) {
    const f = facts;
    console.log(`release: ${f.release.releaseVersion} commit=${f.release.commit} build=${f.release.buildTimestamp} deps=${f.release.dependencies}`);
    console.log(`scale: codeFiles=${f.scale.codeFiles} tsx=${f.scale.components} loc=${f.scale.loc} moduleDirs=${f.scale.moduleDirs}`);
    console.log(`db: migrations=${f.database.migrationFiles} tables=${f.database.tables} policies=${f.database.policies} rls=${f.database.rlsEnabled} functions=${f.database.functions} triggers=${f.database.triggers}`);
    console.log(`registry: modules=${f.registry.modules.length} features=${f.registry.featureCount} actions=${f.registry.actions.length} presets=${f.registry.presets.length} roles=${f.registry.roleCount}`);
    console.log(`hub: tiles=${f.hub.tileCount} ${JSON.stringify(f.hub.categoryCounts)} subMenus=${f.hub.subMenus.length}`);
    console.log(`routes: declared=${f.routes.declaredPaths} unique=${f.routes.uniquePaths} lazy=${f.routes.lazyImports} constants=${f.routes.routeConstants}`);
    console.log(`platform: offlineTables=${f.platform.offlineTableCount} services=${f.platform.serviceCount} edge=${f.platform.edgeFunctions.join(',')} pwa=${f.platform.pwa} backups=${f.platform.backups.length}`);
    console.log('module | pages | svc | dbTables | persistence | offline | audit | rbac | pdf | qr | seed');
    for (const [k, v] of Object.entries(f.evidence)) {
      const g = v.flags;
      console.log(`${k} | ${v.pages} | ${v.services} | ${v.tableCount} | ${v.persistence} | ${g.offline} | ${g.audit} | ${g.rbac} | ${g.pdf} | ${g.qr} | ${g.seed}`);
    }
    const tiers = {};
    for (const v of Object.values(f.evidence)) tiers[v.persistence] = (tiers[v.persistence] || 0) + 1;
    console.log(`persistence tiers: ${JSON.stringify(tiers)}`);
    console.log(`actions: ${f.registry.actions.map((a) => a.code).join(', ')}`);
  }
  return 0;
}

module.exports = {
  ROOT, read, exists, walk, collect, main,
  releaseFacts, scaleFacts, databaseFacts, registryFacts, hubFacts, routeFacts, moduleEvidence, platformFacts,
};
if (require.main === module) process.exitCode = main();


