/**
 * scripts/harmonize-components-depth.cjs
 *
 * Deterministic batch script to harmonize components in src/components,
 * src/pages, and remaining module pages with the Modern Depth Design System tokens
 * (bg-surface, bg-subtle, border-border-default, text-text-primary/secondary/muted,
 * translucent dark-compatible status badges).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'src', 'components'),
  path.join(ROOT_DIR, 'src', 'pages'),
  path.join(ROOT_DIR, 'src', 'modules')
];

const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  '_archived_app',
  '_archived_features',
  '.playwright-mcp',
  'three',
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
      // Skip physical paper print views which simulate white paper forms
      if (entry.name.includes('PrintView')) continue;
      list.push(fullPath);
    }
  }
  return list;
}

const allFiles = TARGET_DIRS.flatMap(dir => getSourceFiles(dir));
// Deduplicate file list
const uniqueFiles = Array.from(new Set(allFiles));

console.log(`Auditing and harmonizing ${uniqueFiles.length} files across H.O.M.E. components & pages...`);

const REPLACEMENTS = [
  // 1. Stage Badges & Clinical Accents (Translucent Modern Depth Badges)
  // Store / Available (Emerald)
  { regex: /\bbg-emerald-50\/[0-9]+\b/g, replacement: 'bg-emerald-500/10', name: 'bg-emerald-50/x -> bg-emerald-500/10' },
  { regex: /\bbg-emerald-50\b(?![\/-])/g, replacement: 'bg-emerald-500/10', name: 'bg-emerald-50 -> bg-emerald-500/10' },
  { regex: /\bborder-emerald-200(\/[0-9]+)?\b/g, replacement: 'border-emerald-500/20', name: 'border-emerald-200 -> border-emerald-500/20' },
  { regex: /\btext-emerald-(900|950)\b/g, replacement: 'text-emerald-400 dark:text-emerald-300 font-bold', name: 'text-emerald-950 -> text-emerald-400' },
  { regex: /\btext-emerald-800\b/g, replacement: 'text-emerald-400', name: 'text-emerald-800 -> text-emerald-400' },

  // Ward In-Use (Blue)
  { regex: /\bbg-blue-50\/[0-9]+\b/g, replacement: 'bg-blue-500/10', name: 'bg-blue-50/x -> bg-blue-500/10' },
  { regex: /\bbg-blue-50\b(?![\/-])/g, replacement: 'bg-blue-500/10', name: 'bg-blue-50 -> bg-blue-500/10' },
  { regex: /\bborder-blue-200(\/[0-9]+)?\b/g, replacement: 'border-blue-500/20', name: 'border-blue-200 -> border-blue-500/20' },
  { regex: /\btext-blue-(900|950)\b/g, replacement: 'text-blue-400 dark:text-blue-300 font-bold', name: 'text-blue-950 -> text-blue-400' },
  { regex: /\btext-blue-800\b/g, replacement: 'text-blue-400', name: 'text-blue-800 -> text-blue-400' },

  // Empty / Depleted (Amber)
  { regex: /\bbg-amber-50\/[0-9]+\b/g, replacement: 'bg-amber-500/10', name: 'bg-amber-50/x -> bg-amber-500/10' },
  { regex: /\bbg-amber-50\b(?![\/-])/g, replacement: 'bg-amber-500/10', name: 'bg-amber-50 -> bg-amber-500/10' },
  { regex: /\bborder-amber-200(\/[0-9]+)?\b/g, replacement: 'border-amber-500/20', name: 'border-amber-200 -> border-amber-500/20' },
  { regex: /\btext-amber-(900|950)\b/g, replacement: 'text-amber-400 dark:text-amber-300 font-bold', name: 'text-amber-950 -> text-amber-400' },
  { regex: /\btext-amber-800\b/g, replacement: 'text-amber-400', name: 'text-amber-800 -> text-amber-400' },

  // Supplier / Returned (Indigo / Purple)
  { regex: /\bbg-(indigo|purple)-50\/[0-9]+\b/g, replacement: 'bg-indigo-500/10', name: 'bg-indigo-50/x -> bg-indigo-500/10' },
  { regex: /\bbg-(indigo|purple)-50\b(?![\/-])/g, replacement: 'bg-indigo-500/10', name: 'bg-indigo-50 -> bg-indigo-500/10' },
  { regex: /\bborder-(indigo|purple)-200(\/[0-9]+)?\b/g, replacement: 'border-indigo-500/20', name: 'border-indigo-200 -> border-indigo-500/20' },
  { regex: /\btext-(indigo|purple)-(900|950)\b/g, replacement: 'text-indigo-400 dark:text-indigo-300 font-bold', name: 'text-indigo-950 -> text-indigo-400' },
  { regex: /\btext-(indigo|purple)-800\b/g, replacement: 'text-indigo-400', name: 'text-indigo-800 -> text-indigo-400' },

  // Rose (Critical / Return actions)
  { regex: /\bbg-rose-50\/[0-9]+\b/g, replacement: 'bg-rose-500/10', name: 'bg-rose-50/x -> bg-rose-500/10' },
  { regex: /\bbg-rose-50\b(?![\/-])/g, replacement: 'bg-rose-500/10', name: 'bg-rose-50 -> bg-rose-500/10' },
  { regex: /\bborder-rose-200(\/[0-9]+)?\b/g, replacement: 'border-rose-500/20', name: 'border-rose-200 -> border-rose-500/20' },
  { regex: /\btext-rose-(900|950)\b/g, replacement: 'text-rose-400 dark:text-rose-300 font-bold', name: 'text-rose-950 -> text-rose-400' },
  { regex: /\btext-rose-800\b/g, replacement: 'text-rose-400', name: 'text-rose-800 -> text-rose-400' },

  // Teal (Clinical accent)
  { regex: /\bbg-teal-50\/[0-9]+\b/g, replacement: 'bg-accent-base/10', name: 'bg-teal-50/x -> bg-accent-base/10' },
  { regex: /\bbg-teal-50\b(?![\/-])/g, replacement: 'bg-accent-base/10', name: 'bg-teal-50 -> bg-accent-base/10' },
  { regex: /\bborder-teal-200(\/[0-9]+)?\b/g, replacement: 'border-accent-base/20', name: 'border-teal-200 -> border-accent-base/20' },

  // 2. Inverted White Backgrounds & Variations
  { regex: /\bbg-white\b(?![\/-])/g, replacement: 'bg-surface', name: 'bg-white -> bg-surface' },
  { regex: /\bbg-white\/(80|90)\b/g, replacement: 'bg-surface', name: 'bg-white/80-90 -> bg-surface' },
  { regex: /\bhover:bg-white\b/g, replacement: 'hover:bg-surface', name: 'hover:bg-white -> hover:bg-surface' },
  { regex: /\bfocus:bg-white\b/g, replacement: 'focus:bg-surface', name: 'focus:bg-white -> focus:bg-surface' },

  // 3. Light Subdued Surfaces
  { regex: /\bbg-(slate|gray|zinc)-50\/[0-9]+\b/g, replacement: 'bg-subtle/50', name: 'bg-slate-50/x -> bg-subtle/50' },
  { regex: /\bbg-(slate|gray|zinc)-50\b(?![\/-])/g, replacement: 'bg-subtle/50', name: 'bg-slate-50 -> bg-subtle/50' },
  { regex: /\bbg-(slate|gray|zinc)-100\/[0-9]+\b/g, replacement: 'bg-subtle', name: 'bg-slate-100/x -> bg-subtle' },
  { regex: /\bbg-(slate|gray|zinc)-100\b(?![\/-])/g, replacement: 'bg-subtle', name: 'bg-slate-100 -> bg-subtle' },
  { regex: /\bbg-(slate|gray|zinc)-200\b(?![\/-])/g, replacement: 'bg-subtle', name: 'bg-slate-200 -> bg-subtle' },
  { regex: /\bhover:bg-(slate|gray|zinc)-50\/[0-9]+\b/g, replacement: 'hover:bg-subtle/50', name: 'hover:bg-slate-50/x -> hover:bg-subtle/50' },
  { regex: /\bhover:bg-(slate|gray|zinc)-50\b/g, replacement: 'hover:bg-subtle', name: 'hover:bg-slate-50 -> hover:bg-subtle' },
  { regex: /\bhover:bg-(slate|gray|zinc)-100(\/[0-9]+)?\b/g, replacement: 'hover:bg-subtle', name: 'hover:bg-slate-100 -> hover:bg-subtle' },
  { regex: /\bhover:bg-(slate|gray|zinc)-200(\/[0-9]+)?\b/g, replacement: 'hover:bg-subtle', name: 'hover:bg-slate-200 -> hover:bg-subtle' },
  { regex: /\bgroup-hover:bg-(slate|gray|zinc)-50\b/g, replacement: 'group-hover:bg-subtle', name: 'group-hover:bg-slate-50 -> group-hover:bg-subtle' },

  // 4. Borders & Dividers
  { regex: /\bborder-(slate|gray|zinc)-200(\/[0-9]+)?\b/g, replacement: 'border-border-default', name: 'border-slate-200 -> border-border-default' },
  { regex: /\bborder-(slate|gray|zinc)-100(\/[0-9]+)?\b/g, replacement: 'border-border-subtle', name: 'border-slate-100 -> border-border-subtle' },
  { regex: /\bborder-(slate|gray|zinc)-300(\/[0-9]+)?\b/g, replacement: 'border-border-default', name: 'border-slate-300 -> border-border-default' },
  { regex: /\bhover:border-(slate|gray|zinc)-300\b/g, replacement: 'hover:border-border-default/80', name: 'hover:border-slate-300 -> hover:border-border-default/80' },
  { regex: /\bdivide-(slate|gray|zinc)-200(\/[0-9]+)?\b/g, replacement: 'divide-border-default', name: 'divide-slate-200 -> divide-border-default' },
  { regex: /\bdivide-(slate|gray|zinc)-100(\/[0-9]+)?\b/g, replacement: 'divide-border-subtle', name: 'divide-slate-100 -> divide-border-subtle' },
  { regex: /\bring-(slate|gray|zinc)-200(\/[0-9]+)?\b/g, replacement: 'ring-border-default', name: 'ring-slate-200 -> ring-border-default' },

  // 5. Inverted Dark Text -> Semantic Text Tokens
  { regex: /\btext-(slate|gray|zinc)-900\b(?![\/-])/g, replacement: 'text-text-primary', name: 'text-900 -> text-text-primary' },
  { regex: /\btext-(slate|gray|zinc)-800\b(?![\/-])/g, replacement: 'text-text-primary', name: 'text-800 -> text-text-primary' },
  { regex: /\btext-(slate|gray|zinc)-700\b(?![\/-])/g, replacement: 'text-text-secondary', name: 'text-700 -> text-text-secondary' },
  { regex: /\btext-(slate|gray|zinc)-600\b(?![\/-])/g, replacement: 'text-text-secondary', name: 'text-600 -> text-text-secondary' },
  { regex: /\btext-(slate|gray|zinc)-500\b(?![\/-])/g, replacement: 'text-text-muted', name: 'text-500 -> text-text-muted' },
  { regex: /\bhover:text-(slate|gray|zinc)-900\b/g, replacement: 'hover:text-text-primary', name: 'hover:text-slate-900 -> hover:text-text-primary' },
  { regex: /\bhover:text-(slate|gray|zinc)-800\b/g, replacement: 'hover:text-text-primary', name: 'hover:text-slate-800 -> hover:text-text-primary' },
  { regex: /\bhover:text-(slate|gray|zinc)-700\b/g, replacement: 'hover:text-text-secondary', name: 'hover:text-slate-700 -> hover:text-text-secondary' },
  { regex: /\bhover:text-(slate|gray|zinc)-600\b/g, replacement: 'hover:text-text-secondary', name: 'hover:text-slate-600 -> hover:text-text-secondary' },
  { regex: /\bplaceholder:text-(slate|gray|zinc)-400\b/g, replacement: 'placeholder:text-text-muted', name: 'placeholder:400 -> placeholder:text-muted' },
  { regex: /\bplaceholder:text-(slate|gray|zinc)-500\b/g, replacement: 'placeholder:text-text-muted', name: 'placeholder:500 -> placeholder:text-muted' }
];

let modifiedCount = 0;
let totalMatches = 0;

for (const filePath of uniqueFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileMatches = 0;

  for (const rule of REPLACEMENTS) {
    const matches = (content.match(rule.regex) || []).length;
    if (matches > 0) {
      content = content.replace(rule.regex, rule.replacement);
      fileMatches += matches;
      totalMatches += matches;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
    console.log(`✓ Harmonized (${fileMatches} replacements): ${path.relative(ROOT_DIR, filePath)}`);
  }
}

console.log(`\n🎉 Harmonization Complete!`);
console.log(`- Files processed: ${uniqueFiles.length}`);
console.log(`- Files modified: ${modifiedCount}`);
console.log(`- Total tokens harmonized: ${totalMatches}`);
