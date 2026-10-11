/**
 * scripts/harmonize-system-styling.cjs
 *
 * Deterministic batch script to harmonize design tokens, colors, surfaces,
 * and borders across all H.O.M.E. modules and components to match the
 * MyPriviledging / Kunci benchmark (Dark slate canvas, hairline borders,
 * clean status badges, 0 unearned gradients).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'src', 'modules'),
  path.join(ROOT_DIR, 'src', 'shared', 'components')
];

const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  '_archived_app',
  '_archived_features',
  '.playwright-mcp',
  'tests'
];

function getSourceFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_PATTERNS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getSourceFiles(fullPath, list);
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      list.push(fullPath);
    }
  }
  return list;
}

const allFiles = TARGET_DIRS.flatMap(dir => getSourceFiles(dir));

console.log(`Auditing and harmonizing ${allFiles.length} files across H.O.M.E. ecosystem.`);

const REPLACEMENTS = [
  // 1. Inverted Backgrounds & Opacity variations
  { regex: /\bbg-white\b(?![\/-])/g, replacement: 'bg-surface', name: 'bg-white -> bg-surface' },
  { regex: /\bbg-(slate|gray|zinc)-50\/[0-9]+\b/g, replacement: 'bg-subtle/50', name: 'bg-slate-50/x -> bg-subtle/50' },
  { regex: /\bbg-(slate|gray|zinc)-50\b(?![\/-])/g, replacement: 'bg-subtle/50', name: 'bg-slate-50 -> bg-subtle/50' },
  { regex: /\bbg-(slate|gray|zinc)-100\/[0-9]+\b/g, replacement: 'bg-subtle', name: 'bg-slate-100/x -> bg-subtle' },
  { regex: /\bbg-(slate|gray|zinc)-100\b(?![\/-])/g, replacement: 'bg-subtle', name: 'bg-slate-100 -> bg-subtle' },
  { regex: /\bbg-(slate|gray|zinc)-200\b(?![\/-])/g, replacement: 'bg-subtle', name: 'bg-slate-200 -> bg-subtle' },

  // 2. Inverted Dark Text -> Semantic Text Tokens
  { regex: /\btext-(slate|gray|zinc)-900\b(?![\/-])/g, replacement: 'text-text-primary', name: 'text-900 -> text-text-primary' },
  { regex: /\btext-(slate|gray|zinc)-800\b(?![\/-])/g, replacement: 'text-text-primary', name: 'text-800 -> text-text-primary' },
  { regex: /\btext-(slate|gray|zinc)-700\b(?![\/-])/g, replacement: 'text-text-secondary', name: 'text-700 -> text-text-secondary' },
  { regex: /\btext-(slate|gray|zinc)-600\b(?![\/-])/g, replacement: 'text-text-muted', name: 'text-600 -> text-text-muted' },
  { regex: /\btext-(slate|gray|zinc)-500\b(?![\/-])/g, replacement: 'text-text-muted', name: 'text-500 -> text-text-muted' },

  // 3. Light Borders & Opacity variations
  { regex: /\bborder-(slate|gray|zinc)-200\/[0-9]+\b/g, replacement: 'border-border-default', name: 'border-200/x -> border-border-default' },
  { regex: /\bborder-(slate|gray|zinc)-200\b(?![\/-])/g, replacement: 'border-border-default', name: 'border-200 -> border-border-default' },
  { regex: /\bborder-(slate|gray|zinc)-300\/[0-9]+\b/g, replacement: 'border-border-default', name: 'border-300/x -> border-border-default' },
  { regex: /\bborder-(slate|gray|zinc)-300\b(?![\/-])/g, replacement: 'border-border-default', name: 'border-300 -> border-border-default' },
  { regex: /\bborder-(slate|gray|zinc)-100\b(?![\/-])/g, replacement: 'border-border-subtle', name: 'border-100 -> border-border-subtle' },

  // 4. Arbitrary Tailwind Hex Colors -> Unified Design Tokens
  { regex: /\btext-\[#00a68a\]\b/g, replacement: 'text-accent-base', name: 'text-[#00a68a] -> text-accent-base' },
  { regex: /\bborder-\[#00a68a\]\b/g, replacement: 'border-accent-base', name: 'border-[#00a68a] -> border-accent-base' },
  { regex: /\bbg-\[#00a68a\]\b/g, replacement: 'bg-accent-base', name: 'bg-[#00a68a] -> bg-accent-base' },
  { regex: /\bring-\[#00a68a\]\b/g, replacement: 'ring-accent-base', name: 'ring-[#00a68a] -> ring-accent-base' },
  { regex: /\bhover:bg-\[#00a68a\]\b/g, replacement: 'hover:bg-accent-hover', name: 'hover:bg-[#00a68a] -> hover:bg-accent-hover' },
  { regex: /\bhover:text-\[#00a68a\]\b/g, replacement: 'hover:text-accent-hover', name: 'hover:text-[#00a68a] -> hover:text-accent-hover' },
  { regex: /\bbg-\[#e6f7f4\]\b/g, replacement: 'bg-accent-subtle', name: 'bg-[#e6f7f4] -> bg-accent-subtle' },
  { regex: /\bbg-\[#(008f76|009278|007a65)\]\b/g, replacement: 'bg-accent-active', name: 'bg-teal-dark -> bg-accent-active' },
  { regex: /\bbg-\[#(f8fafc|F8FAFC|fcfdfe)\]\b/g, replacement: 'bg-surface', name: 'bg-light-hex -> bg-surface' },
  { regex: /\btext-\[#(334155|475569)\]\b/g, replacement: 'text-text-secondary', name: 'text-dark-hex -> text-text-secondary' },
  { regex: /\btext-\[#(94a3b8|64748b)\]\b/g, replacement: 'text-text-muted', name: 'text-muted-hex -> text-text-muted' },
  { regex: /\btext-\[#(0f172a|000000)\]\b/g, replacement: 'text-text-primary', name: 'text-black-hex -> text-text-primary' },

  // 5. AI-Slop Multi-Color Gradients -> Semantic Clean Surfaces / Accents
  { regex: /bg-gradient-to-r\s+from-slate-900\s+via-indigo-950\s+to-slate-900/g, replacement: 'bg-surface border border-border-default', name: 'slate-indigo banner gradient' },
  { regex: /bg-gradient-to-tr\s+from-slate-900\s+to-indigo-950(\s+border\s+border-slate-800\/80)?/g, replacement: 'bg-surface border border-border-default', name: 'slate-indigo tr gradient' },
  { regex: /bg-gradient-to-r\s+from-slate-900\s+to-indigo-950/g, replacement: 'bg-surface border border-border-default', name: 'slate-indigo r gradient' },
  { regex: /bg-gradient-to-r\s+from-slate-50\s+to-indigo-50\/10/g, replacement: 'bg-subtle/50', name: 'slate-indigo light gradient' },
  { regex: /bg-gradient-to-r\s+from-teal-500\s+to-emerald-600\s+hover:from-teal-600\s+hover:to-emerald-700/g, replacement: 'bg-accent-base hover:bg-accent-hover', name: 'teal-emerald button gradient' },
  { regex: /bg-gradient-to-r\s+from-teal-500\s+to-emerald-500\s+hover:from-teal-600\s+hover:to-emerald-600/g, replacement: 'bg-accent-base hover:bg-accent-hover', name: 'teal-emerald 500 gradient' },
  { regex: /bg-gradient-to-r\s+from-emerald-600\s+to-teal-700\s+hover:from-emerald-700\s+hover:to-teal-800/g, replacement: 'bg-accent-base hover:bg-accent-hover', name: 'emerald-teal button gradient' },
  { regex: /bg-gradient-to-r\s+from-emerald-500\s+to-teal-600\s+hover:from-emerald-600\s+hover:to-teal-700/g, replacement: 'bg-accent-base hover:bg-accent-hover', name: 'emerald-teal 500 gradient' },
  { regex: /bg-gradient-to-r\s+from-sky-500\s+to-blue-600\s+hover:from-sky-600\s+hover:to-blue-700/g, replacement: 'bg-accent-base hover:bg-accent-hover', name: 'sky-blue button gradient' },
  { regex: /bg-gradient-to-r\s+from-purple-600\s+to-indigo-600\s+hover:from-purple-700\s+hover:to-indigo-700/g, replacement: 'bg-accent-base hover:bg-accent-hover', name: 'purple-indigo button gradient' },
  { regex: /bg-gradient-to-r\s+from-indigo-500\s+to-purple-600\s+hover:from-indigo-600\s+hover:to-purple-700/g, replacement: 'bg-accent-base hover:bg-accent-hover', name: 'indigo-purple button gradient' },
  { regex: /bg-gradient-to-br\s+from-slate-950\s+via-slate-900\s+to-teal-950/g, replacement: 'bg-surface border border-border-default', name: 'slate-teal br gradient' },
  { regex: /bg-gradient-to-r\s+from-teal-500\s+via-cyan-500\s+to-indigo-600/g, replacement: 'bg-surface border border-border-default', name: 'teal-cyan-indigo gradient' },
  { regex: /bg-gradient-to-r\s+from-blue-500\s+via-indigo-500\s+to-cyan-400/g, replacement: 'bg-surface border border-border-default', name: 'blue-indigo-cyan gradient' },
  { regex: /bg-gradient-to-r\s+from-teal-400\s+via-\[#00a68a\]\s+to-emerald-500/g, replacement: 'bg-accent-base', name: 'teal-emerald hex gradient' }
];

let totalModifications = 0;
let modifiedFilesCount = 0;

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  let fileModCount = 0;

  for (const { regex, replacement } of REPLACEMENTS) {
    const matches = (content.match(regex) || []).length;
    if (matches > 0) {
      content = content.replace(regex, replacement);
      fileModCount += matches;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFilesCount++;
    totalModifications += fileModCount;
  }
}

console.log(`\n============================================================`);
console.log(`  Phase 2 Harmonization Applied:`);
console.log(`  - Files updated: ${modifiedFilesCount}`);
console.log(`  - Additional token replacements: ${totalModifications}`);
console.log(`============================================================\n`);
