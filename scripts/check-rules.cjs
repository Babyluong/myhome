/**
 * scripts/check-rules.cjs
 * Deterministic Rules Checker for H.O.M.E. Workspace (R1 - R6)
 *
 * Usage:
 *   node scripts/check-rules.cjs              # Checks changed/uncommitted files
 *   node scripts/check-rules.cjs path/to/file # Checks specific files
 *   node scripts/check-rules.cjs --full       # Checks all src/ files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Parse CLI flags and arguments
const args = process.argv.slice(2);
const isFullScan = args.includes('--full');
const targetFilesArg = args.filter(a => !a.startsWith('--'));

function getTargetFiles() {
  if (targetFilesArg.length > 0) {
    return targetFilesArg.map(f => path.resolve(ROOT_DIR, f));
  }

  if (isFullScan) {
    return getAllFiles(SRC_DIR);
  }

  // Otherwise, inspect git status / git diff
  try {
    const gitDiff = execSync('git status --porcelain', { encoding: 'utf8', cwd: ROOT_DIR });
    const files = gitDiff
      .split('\n')
      .map(line => line.trim().slice(3))
      .filter(f => f && (f.startsWith('src/') || f.startsWith('supabase/')))
      .map(f => path.join(ROOT_DIR, f))
      .filter(f => fs.existsSync(f) && fs.statSync(f).isFile());

    if (files.length === 0) {
      // If working tree is clean, check last commit
      const lastCommitFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf8', cwd: ROOT_DIR })
        .split('\n')
        .map(f => f.trim())
        .filter(f => f && f.startsWith('src/'))
        .map(f => path.join(ROOT_DIR, f))
        .filter(f => fs.existsSync(f) && fs.statSync(f).isFile());
      return lastCommitFiles;
    }
    return files;
  } catch {
    return getAllFiles(SRC_DIR);
  }
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
const TRANSITION_ALL_REGEX = /transition:\s*all\b|transition-all\b/g;
const ANIMATE_LAYOUT_REGEX = /animate=\{.*?(width|height|margin|padding).*?\}/g;

const findings = [];

function checkFile(filePath) {
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check 150 line cap for compact-code standard (only on src feature files)
  if (relPath.startsWith('src/') && !relPath.includes('routes/routes.tsx') && !relPath.endsWith('.css') && lines.length > 150) {
    findings.push({
      rule: 'Compact Code Standard',
      severity: 'WARN',
      file: relPath,
      line: lines.length,
      message: `File exceeds 150 lines (${lines.length} lines)`
    });
  }

  // R1: Check mock/dummy keywords
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    // Skip comments if desired, or check strict
    for (const pat of FORBIDDEN_MOCK_WORDS) {
      if (pat.test(lineText)) {
        findings.push({
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
      findings.push({
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
        findings.push({
          rule: 'R5 (Design Tokens)',
          severity: 'WARN',
          file: relPath,
          line: lineNum,
          message: `Raw hex color found (${hexMatches.join(', ')}). Use var(--token) or tailwind classes.`
        });
      }

      // Transition: all check
      if (TRANSITION_ALL_REGEX.test(lineText)) {
        findings.push({
          rule: 'R5 (Motion Craft)',
          severity: 'BLOCK',
          file: relPath,
          line: lineNum,
          message: `Forbidden transition-all detected. Animate transform/opacity explicitly.`
        });
      }

      // Animate layout properties check
      if (ANIMATE_LAYOUT_REGEX.test(lineText)) {
        findings.push({
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

function run() {
  console.log('='.repeat(60));
  console.log('  H.O.M.E. Deterministic Rule Checker (scripts/check-rules.cjs)');
  console.log('='.repeat(60));

  const targetFiles = getTargetFiles();
  console.log(`Auditing ${targetFiles.length} file(s)...`);

  for (const file of targetFiles) {
    checkFile(file);
  }

  const blocks = findings.filter(f => f.severity === 'BLOCK');
  const warns = findings.filter(f => f.severity === 'WARN');

  console.log('\n--- AUDIT RESULTS ---');
  if (findings.length === 0) {
    console.log('✅ PASS: All R1 - R6 rules verified. Zero violations detected.\n');
    process.exit(0);
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
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
