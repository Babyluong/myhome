/**
 * scripts/check-rules.cjs
 * Static pattern hints for H.O.M.E. (not live-data, auth, audit, or release verification)
 *
 * Usage:
 *   node scripts/check-rules.cjs              # Checks changed/uncommitted files
 *   node scripts/check-rules.cjs path/to/file # Checks specific files
 *   node scripts/check-rules.cjs --full       # Checks all src/ files
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { parsePorcelain } = require('./check-agent-boundaries.cjs');

const IGNORE_DIRS = [
  'node_modules',
  'dist',
  '.git',
  '.vercel',
  'scratch',
  '_archived_app',
  '_archived_features',
  '.playwright-mcp'
];

const ROOT_DIR = path.resolve(__dirname, '..');

function getTargetFiles(root = ROOT_DIR, args = process.argv.slice(2)) {
  const isFullScan = args.includes('--full');
  const targetFilesArg = args.filter(a => !a.startsWith('--'));
  const existingTargets = (files) => [...new Set(files)]
    .filter(f => f && (f.startsWith('src/') || f.startsWith('supabase/')))
    .map(f => path.join(root, f))
    .filter(f => fs.existsSync(f) && fs.statSync(f).isFile());
  if (targetFilesArg.length > 0) {
    return targetFilesArg.map(f => path.resolve(root, f));
  }

  if (isFullScan) {
    return getAllFiles(path.join(root, 'src'));
  }

  const status = execFileSync('git', ['-c', 'core.fsmonitor=false', 'status', '--porcelain=v1', '--untracked-files=all', '-z'], { cwd: root });
  const records = parsePorcelain(status);
  // Only a genuinely clean worktree may fall back to HEAD; unrelated modifications
  // or deletions do not justify claiming a different commit was checked.
  if (records.length) return existingTargets(records.flatMap(entry => entry.originalPath ? [entry.path, entry.originalPath] : [entry.path]));
  const committed = execFileSync('git', ['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', '-z', 'HEAD'], { cwd: root });
  return existingTargets(committed.toString('utf8').split('\0'));
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (/\.(ts|tsx|js|jsx|css)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const FORBIDDEN_MOCK_WORDS = [
  /\bfaker\b/i,
  /\blorem\s+ipsum\b/i,
  /\bmockData\b/,
  /\bdummyData\b/,
  /\bfakeData\b/
];

const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,8}\b/g;
const TRANSITION_ALL_REGEX = /transition:\s*all\b|transition-all\b/;
const ANIMATE_LAYOUT_REGEX = /animate=\{.*?(width|height|margin|padding).*?\}/;

const findings = [];

function checkFile(filePath, root = ROOT_DIR, output = findings) {
  const relPath = path.relative(root, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // R1: Check mock/dummy keywords
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    // Skip comments if desired, or check strict
    for (const pat of FORBIDDEN_MOCK_WORDS) {
      if (pat.test(lineText)) {
        output.push({
          rule: 'R1 (Real Data)',
          severity: 'BLOCK',
          file: relPath,
          line: lineNum,
          message: `Forbidden test/mock pattern detected: "${lineText.trim()}"`
        });
      }
    }

    // R2: Check localhost in src outside config
    if (lineText.includes('localhost') && !relPath.includes('config') && !relPath.includes('vite') && !relPath.includes('env')) {
      output.push({
        rule: 'R2 (Localhost/Prod Parity)',
        severity: 'BLOCK',
        file: relPath,
        line: lineNum,
        message: `Hardcoded "localhost" found: "${lineText.trim()}"`
      });
    }

    // R5: UI Checks (only for tsx/jsx component files)
    if (/\.(tsx|jsx)$/.test(relPath)) {
      // Hex colors check
      const hexMatches = lineText.match(HEX_COLOR_REGEX);
      if (hexMatches) {
        // Exclude allowed SVG inline icons or comments if needed
        output.push({
          rule: 'R5 (Design Tokens)',
          severity: 'WARN',
          file: relPath,
          line: lineNum,
          message: `Raw hex color found (${hexMatches.join(', ')}). Use var(--token) or tailwind classes.`
        });
      }

      // Transition: all check
      if (TRANSITION_ALL_REGEX.test(lineText)) {
        output.push({
          rule: 'R5 (Motion Craft)',
          severity: 'BLOCK',
          file: relPath,
          line: lineNum,
          message: `Forbidden transition-all detected. Animate transform/opacity explicitly.`
        });
      }

      // Animate layout properties check
      if (ANIMATE_LAYOUT_REGEX.test(lineText)) {
        output.push({
          rule: 'R5 (Motion Craft)',
          severity: 'BLOCK',
          file: relPath,
          line: lineNum,
          message: `Animated layout property (width/height/margin/padding) detected. Animate transform instead.`
        });
      }
    }
  });
}

function run(args = process.argv.slice(2), root = ROOT_DIR) {
  findings.length = 0;
  console.log('='.repeat(60));
  console.log('  H.O.M.E. static pattern checker (scripts/check-rules.cjs)');
  console.log('='.repeat(60));

  const targetFiles = getTargetFiles(root, args);
  console.log(`Auditing ${targetFiles.length} file(s)...`);

  for (const file of targetFiles) {
    checkFile(file, root);
  }

  const blocks = findings.filter(f => f.severity === 'BLOCK');
  const warns = findings.filter(f => f.severity === 'WARN');

  console.log('\n--- AUDIT RESULTS ---');
  if (findings.length === 0) {
    console.log(targetFiles.length ? 'PASS scope=STATIC_PATTERNS_ONLY: no matching violations; clinical data, authorization, audit and releases unverified.' : 'SKIP scope=STATIC_PATTERNS_ONLY: no applicable readable files.');
    return 0;
  }

  for (const f of findings) {
    const icon = f.severity === 'BLOCK' ? '❌ [BLOCK]' : '⚠️  [WARN]';
    console.log(`${icon} ${f.rule} in ${f.file}:${f.line}`);
    console.log(`   ${f.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${blocks.length} BLOCK(s), ${warns.length} WARNING(s)`);
  console.log('='.repeat(60));

  if (blocks.length > 0) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = { getTargetFiles, getAllFiles, checkFile, run };
if (require.main === module) {
  try { process.exitCode = run(); }
  catch (error) { console.error(`FAIL static checker: ${error.message}`); process.exitCode = 1; }
}
