/**
 * scripts/refactor-procurement-depth.cjs
 * Deterministic batch refactor for H.O.M.E. Procurement Module
 * Replaces muddy dark-mode pastel washes, over-rounded 40px radii,
 * and high-contrast status badges across all procurement pages.
 */

const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/modules/procurement/pages/procurement/PurchaseOrderListPage.tsx',
  'src/modules/procurement/pages/procurement/LPOListPage.tsx',
  'src/modules/procurement/pages/procurement/ReceivingPage.tsx',
  'src/modules/procurement/pages/procurement/OrderTrackingPage.tsx',
  'src/modules/procurement/pages/procurement/SupplierPerformancePage.tsx',
  'src/modules/procurement/pages/procurement/PenaltyPage.tsx',
  'src/modules/procurement/pages/procurement/CreditNoteAuditPage.tsx',
];

console.log('🚀 Starting Procurement Module Modern Depth Refactoring...\n');

let totalChanges = 0;

targetFiles.forEach((relPath) => {
  const filePath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${relPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Eradicate 40px / 32px bubble radii on containers and tables
  content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-2xl');
  content = content.replace(/rounded-\[2rem\]/g, 'rounded-xl');
  content = content.replace(/rounded-\[1\.5rem\]/g, 'rounded-xl');

  // 2. Eradicate light-mode shadow halos on dark backgrounds
  content = content.replace(/shadow-xl shadow-slate-100\/40/g, 'shadow-sm');
  content = content.replace(/shadow-xl shadow-slate-200\/30/g, 'shadow-sm');
  content = content.replace(/shadow-xl shadow-indigo-100\/30/g, 'shadow-sm');
  content = content.replace(/shadow-xl shadow-emerald-100\/30/g, 'shadow-sm');
  content = content.replace(/shadow-xl shadow-amber-100\/30/g, 'shadow-sm');
  content = content.replace(/shadow-xl shadow-violet-100\/30/g, 'shadow-sm');
  content = content.replace(/shadow-xl shadow-sky-100\/30/g, 'shadow-sm');
  content = content.replace(/shadow-\[0_4px_20px_-4px_rgba\(0,0,0,0\.02\)\]/g, 'shadow-sm');

  // 3. KPI Card Surface Uniformity: Replace muddy pastel card backgrounds with clean bg-surface
  content = content.replace(
    /bg-indigo-50\/40\s+border-2\s+border-indigo-100\/70/g,
    'bg-surface border border-border-default hover:border-cyan-500/30'
  );
  content = content.replace(
    /bg-emerald-50\/50\s+border-2\s+border-emerald-100/g,
    'bg-surface border border-border-default hover:border-emerald-500/30'
  );
  content = content.replace(
    /bg-emerald-50\/40\s+border-2\s+border-emerald-100\/70/g,
    'bg-surface border border-border-default hover:border-emerald-500/30'
  );
  content = content.replace(
    /bg-amber-50\/50\s+border-2\s+border-amber-100/g,
    'bg-surface border border-border-default hover:border-amber-500/30'
  );
  content = content.replace(
    /bg-amber-50\/40\s+border-2\s+border-amber-100\/70/g,
    'bg-surface border border-border-default hover:border-amber-500/30'
  );
  content = content.replace(
    /bg-amber-50\/30\s+border\s+border-amber-200/g,
    'bg-surface border border-border-default hover:border-amber-500/30'
  );
  content = content.replace(
    /bg-indigo-50\/30\s+border\s+border-indigo-200/g,
    'bg-surface border border-border-default hover:border-cyan-500/30'
  );
  content = content.replace(
    /bg-violet-50\/40\s+border-2\s+border-violet-100\/70/g,
    'bg-surface border border-border-default hover:border-purple-500/30'
  );
  content = content.replace(
    /bg-sky-50\/40\s+border-2\s+border-sky-100\/70/g,
    'bg-surface border border-border-default hover:border-sky-500/30'
  );
  content = content.replace(
    /bg-subtle\/50\s+border-2\s+border-border-subtle/g,
    'bg-surface border border-border-default hover:border-slate-500/40'
  );

  // 4. Inverted Dark-on-Dark Text (Unreadable in dark mode)
  content = content.replace(/text-indigo-950/g, 'text-text-primary');
  content = content.replace(/text-indigo-900/g, 'text-text-primary');
  content = content.replace(/text-amber-950/g, 'text-text-primary');
  content = content.replace(/text-amber-900/g, 'text-text-primary');
  content = content.replace(/text-violet-950/g, 'text-text-primary');
  content = content.replace(/text-emerald-950/g, 'text-text-primary');

  // 5. KPI Icon Container refinement (clean 44px container with modern depth accents)
  content = content.replace(
    /w-12 h-12 bg-indigo-100 border border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-700 shadow-sm/g,
    'w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-xs shrink-0'
  );
  content = content.replace(
    /w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm/g,
    'w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shadow-xs shrink-0'
  );
  content = content.replace(
    /w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm/g,
    'w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shadow-xs shrink-0'
  );
  content = content.replace(
    /w-12 h-12 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-700 shadow-sm/g,
    'w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shadow-xs shrink-0'
  );
  content = content.replace(
    /w-12 h-12 bg-violet-100 border border-violet-200 rounded-2xl flex items-center justify-center text-violet-700 shadow-sm/g,
    'w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 shadow-xs shrink-0'
  );
  content = content.replace(
    /w-12 h-12 bg-subtle border border-border-default rounded-2xl flex items-center justify-center text-text-secondary shadow-sm/g,
    'w-11 h-11 bg-slate-500/10 border border-slate-500/20 rounded-xl flex items-center justify-center text-slate-300 shadow-xs shrink-0'
  );
  content = content.replace(
    /w-12 h-12 bg-surface border border-border-default rounded-2xl flex items-center justify-center text-text-secondary/g,
    'w-11 h-11 bg-slate-500/10 border border-slate-500/20 rounded-xl flex items-center justify-center text-slate-300'
  );

  // 6. Calm table status badge pills from blinding light fills to dark-depth glows
  content = content.replace(
    /bg-emerald-50 border-emerald-100 text-emerald-700/g,
    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  );
  content = content.replace(
    /bg-amber-50 border-amber-100 text-amber-700/g,
    'bg-amber-500/10 border-amber-500/20 text-amber-400'
  );
  content = content.replace(
    /bg-rose-50 border-rose-100 text-rose-700/g,
    'bg-rose-500/10 border-rose-500/20 text-rose-400'
  );
  content = content.replace(
    /bg-indigo-50 border-indigo-100 text-indigo-700/g,
    'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
  );
  content = content.replace(
    /bg-blue-50 border-blue-100 text-blue-700/g,
    'bg-sky-500/10 border-sky-500/20 text-sky-400'
  );

  // 7. Category pills inside tables
  content = content.replace(
    /bg-indigo-50 border border-indigo-100\/60 rounded-lg text-\[10px\] font-bold text-indigo-600/g,
    'bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[10px] font-bold text-cyan-400'
  );

  function safeWrite(file, data) {
    for (let i = 0; i < 5; i++) {
      try {
        fs.writeFileSync(file, data, 'utf8');
        return true;
      } catch (err) {
        if (i === 4) throw err;
        const start = Date.now();
        while (Date.now() - start < 150) {} // 150ms backoff
      }
    }
  }

  if (content !== original) {
    safeWrite(filePath, content);
    totalChanges++;
    console.log(`✅ Refactored: ${relPath}`);
  } else {
    console.log(`ℹ️ No changes needed: ${relPath}`);
  }
});

console.log(`\n🎉 Complete! Modified ${totalChanges} files.`);
