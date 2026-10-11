/**
 * scripts/fix-contrast-tokens.cjs
 * Deterministic batch script to overhaul table contrast, eliminate faux-glassmorphism
 * (bg-white/40-70 washes), and enforce semantic design tokens across H.O.M.E.
 */

const fs = require('fs');
const path = require('path');

let modifiedFiles = 0;
let totalChanges = 0;

function updateFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { from, to } of transforms) {
    if (typeof from === 'string') {
      if (content.includes(from)) {
        content = content.split(from).join(to);
      }
    } else if (from instanceof RegExp) {
      content = content.replace(from, to);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    console.log(`[UPDATED] ${filePath}`);
  }
}

// =========================================================================
// 1. SPECIFIC HIGH-IMPACT FIXES: User Reported Screens (MyCylinder)
// =========================================================================

// 1.1 CylinderDispatchTable.tsx (Screenshot 1)
updateFile('src/components/oxygen/CylinderDispatchTable.tsx', [
  // Outer container: eliminate bg-white/70 backdrop-blur-xl
  {
    from: 'bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden mt-6',
    to: 'bg-surface rounded-2xl border border-border-default shadow-xs overflow-hidden mt-6'
  },
  {
    from: 'border-b border-slate-200 bg-slate-50/50',
    to: 'border-b border-border-default bg-subtle/40'
  },
  // Filter inputs
  {
    from: 'border border-slate-200 rounded-xl bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
    to: 'border border-border-default rounded-xl bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-base/20 focus:border-accent-base'
  },
  {
    from: 'border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-[transform,opacity,box-shadow,border-color] appearance-none font-semibold cursor-pointer',
    to: 'border border-border-default rounded-xl bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-base/20 focus:border-accent-base transition-[transform,opacity,box-shadow,border-color] appearance-none font-semibold cursor-pointer'
  },
  {
    from: 'border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-[transform,opacity,box-shadow,border-color] appearance-none cursor-pointer',
    to: 'border border-border-default rounded-xl bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-base/20 focus:border-accent-base transition-[transform,opacity,box-shadow,border-color] appearance-none cursor-pointer'
  },
  {
    from: 'border border-slate-200 rounded-xl bg-white text-xs text-slate-600 focus:outline-none',
    to: 'border border-border-default rounded-xl bg-surface text-xs text-text-primary focus:outline-none'
  },
  {
    from: '<span className="text-slate-400 text-xs">to</span>',
    to: '<span className="text-text-muted font-bold text-xs">to</span>'
  },
  // Desktop Table Header: eliminate faint text-slate-400
  {
    from: '<tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/20">',
    to: '<tr className="border-b border-border-default text-xs font-bold text-text-secondary uppercase tracking-wider bg-subtle/50">'
  },
  // Desktop Table Body: eliminate text-slate-600
  {
    from: '<tbody className="divide-y divide-slate-100 text-sm text-slate-600">',
    to: '<tbody className="divide-y divide-border-default text-sm text-text-secondary">'
  },
  {
    from: 'className="hover:bg-slate-50/60 transition-colors cursor-pointer"',
    to: 'className="hover:bg-subtle/60 transition-colors cursor-pointer"'
  },
  // Requester & Issuer text
  {
    from: '<div className="font-medium text-slate-700">{req.requester.full_name}</div>',
    to: '<div className="font-bold text-text-primary">{req.requester.full_name}</div>'
  },
  {
    from: '<div className="text-xs text-slate-400">{req.requester.jawatan}</div>',
    to: '<div className="text-xs text-text-muted font-medium">{req.requester.jawatan}</div>'
  },
  {
    from: '<div className="font-medium text-slate-700">{req.issuer.full_name}</div>',
    to: '<div className="font-bold text-text-primary">{req.issuer.full_name}</div>'
  },
  {
    from: '<div className="text-xs text-slate-400">{req.issuer.jawatan}</div>',
    to: '<div className="text-xs text-text-muted font-medium">{req.issuer.jawatan}</div>'
  },
  {
    from: '<span className="text-slate-400 italic">Pending issue</span>',
    to: '<span className="text-text-muted italic font-medium">Pending issue</span>'
  },
  {
    from: '<span className="text-slate-400 font-italic">Manual Issue</span>',
    to: '<span className="text-text-muted italic font-medium">Manual Issue</span>'
  },
  // Items summary
  {
    from: '{itm.quantity_requested}x {itm.size_code}',
    to: '{itm.quantity_requested}x {itm.size_code}'
  },
  {
    from: '<div key={idx} className="font-semibold text-slate-700 text-xs">',
    to: '<div key={idx} className="font-bold text-text-primary text-xs">'
  },
  // Date/Time
  {
    from: '<td className="px-6 py-4 text-xs font-medium">',
    to: '<td className="px-6 py-4 text-xs font-semibold text-text-secondary">'
  },
  // Empty state
  {
    from: '<td colSpan={8} className="px-6 py-12 text-center text-slate-400">',
    to: '<td colSpan={8} className="px-6 py-12 text-center text-text-muted font-medium">'
  },
  // Mobile Card View inside CylinderDispatchTable
  {
    from: 'bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-[transform,opacity,box-shadow,border-color] duration-200 cursor-pointer space-y-4',
    to: 'bg-surface rounded-2xl border border-border-default p-5 shadow-xs hover:border-border-strong transition-[transform,opacity,box-shadow,border-color] duration-200 cursor-pointer space-y-4'
  },
  {
    from: 'bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center justify-between',
    to: 'bg-subtle/50 rounded-xl p-3 border border-border-subtle flex items-center justify-between'
  },
  {
    from: 'font-semibold text-slate-800 text-xs flex items-center gap-1 mt-0.5 flex-wrap',
    to: 'font-bold text-text-primary text-xs flex items-center gap-1 mt-0.5 flex-wrap'
  },
  {
    from: 'font-semibold text-slate-700',
    to: 'font-bold text-text-primary'
  },
  {
    from: 'border-t border-slate-100',
    to: 'border-t border-border-subtle'
  },
  // Pagination & Footer
  {
    from: 'text-xs text-slate-500 font-medium',
    to: 'text-xs text-text-muted font-medium'
  },
  {
    from: 'border border-slate-200 rounded-xl bg-white text-slate-600',
    to: 'border border-border-default rounded-xl bg-surface text-text-secondary'
  }
]);

// 1.2 StoreUsageBalanceTable.tsx (Screenshot 2)
updateFile('src/components/oxygen/StoreUsageBalanceTable.tsx', [
  // Outer table wrapper: eliminate bg-white/40 backdrop-blur-xl
  {
    from: 'bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl overflow-hidden relative',
    to: 'bg-surface border border-border-default rounded-2xl shadow-xs overflow-hidden relative'
  },
  // Date filters
  {
    from: 'px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner',
    to: 'px-3 py-1.5 bg-surface border border-border-default rounded-xl text-xs text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent-base/20'
  },
  {
    from: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl shadow-sm transition-[transform,opacity,box-shadow,border-color] active:scale-95',
    to: 'bg-surface hover:bg-subtle border border-border-default text-text-secondary rounded-xl shadow-xs transition-[transform,opacity,box-shadow,border-color] active:scale-95'
  },
  {
    from: 'bg-white/70 hover:bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-[transform,opacity,box-shadow,border-color] shadow-sm',
    to: 'bg-surface hover:bg-subtle border border-border-default text-text-secondary hover:text-text-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-[transform,opacity,box-shadow,border-color] shadow-xs'
  },
  // Table Header
  {
    from: '<tr className="border-b border-slate-200/60 bg-slate-50/40 text-slate-600 font-extrabold text-[11px] uppercase tracking-wider">',
    to: '<tr className="border-b border-border-default bg-subtle/50 text-text-secondary font-bold text-[11px] uppercase tracking-wider">'
  },
  {
    from: '<th className="py-4 px-5 text-center bg-emerald-50/50 text-emerald-900 border-x border-emerald-100">',
    to: '<th className="py-4 px-5 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-x border-emerald-500/20 font-bold">'
  },
  // Table Body
  {
    from: '<tbody className="divide-y divide-slate-200/40 text-slate-700 font-medium text-xs">',
    to: '<tbody className="divide-y divide-border-default text-text-secondary font-medium text-xs">'
  },
  {
    from: 'className="hover:bg-white/40 transition-colors duration-200"',
    to: 'className="hover:bg-subtle/50 transition-colors duration-200"'
  },
  // Cylinder Name
  {
    from: '<div className="font-extrabold text-slate-900 text-sm">{row.display_name}</div>',
    to: '<div className="font-extrabold text-text-primary text-sm">{row.display_name}</div>'
  },
  // Baki Pembukaan: eliminate invisible text-slate-600
  {
    from: '<td className="py-4 px-4 text-center font-bold text-slate-600 tabular-nums">',
    to: '<td className="py-4 px-4 text-center font-bold text-text-primary tabular-nums">'
  },
  // Refill Diterima: high contrast emerald in dark
  {
    from: '<td className="py-4 px-4 text-center font-extrabold text-emerald-600 tabular-nums">',
    to: '<td className="py-4 px-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">'
  },
  // Pengeluaran Wad: eliminate invisible dark blue in dark mode
  {
    from: '<td className="py-4 px-4 text-center font-extrabold text-blue-600 tabular-nums">',
    to: '<td className="py-4 px-4 text-center font-extrabold text-blue-600 dark:text-sky-400 tabular-nums">'
  },
  // Sedia Ada di Stor (Penuh)
  {
    from: '<td className="py-4 px-5 text-center bg-emerald-50/40 border-x border-emerald-100">',
    to: '<td className="py-4 px-5 text-center bg-emerald-500/5 border-x border-emerald-500/20">'
  },
  {
    from: 'className="bg-emerald-100/80 border border-emerald-300 text-emerald-900 px-3.5 py-1.5 rounded-xl font-black text-sm shadow-sm inline-block tabular-nums"',
    to: 'className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-xl font-black text-sm shadow-xs inline-block tabular-nums"'
  },
  {
    from: 'text-emerald-700 font-bold pt-0.5',
    to: 'text-emerald-700 dark:text-emerald-300 font-bold pt-0.5'
  },
  // Pemulangan Pembekal: eliminate invisible dark purple in dark mode
  {
    from: '<div className="font-extrabold text-purple-700 tabular-nums">',
    to: '<div className="font-extrabold text-purple-600 dark:text-purple-400 tabular-nums">'
  },
  {
    from: '<span className="text-[10px] text-slate-400 font-bold block">\n                        Silinder Kosong',
    to: '<span className="text-[10px] text-text-muted font-bold block">\n                        Silinder Kosong'
  },
  {
    from: '<span className="text-[10px] text-slate-400 font-bold block">Silinder Kosong</span>',
    to: '<span className="text-[10px] text-text-muted font-bold block">Silinder Kosong</span>'
  },
  // Lokasi & Pegangan
  {
    from: 'bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-left min-w-[130px]',
    to: 'bg-subtle/50 border border-border-default px-2.5 py-1.5 rounded-xl text-left min-w-[130px]'
  },
  {
    from: '<span className="text-blue-700">Wad: {row.in_use || 0}</span>',
    to: '<span className="text-blue-600 dark:text-sky-400">Wad: {row.in_use || 0}</span>'
  },
  {
    from: '<span className="text-purple-700">Pembekal: {row.with_supplier || 0}</span>',
    to: '<span className="text-purple-600 dark:text-purple-400">Pembekal: {row.with_supplier || 0}</span>'
  },
  {
    from: '<span className="text-slate-800 border-t border-slate-200 pt-0.5">',
    to: '<span className="text-text-primary border-t border-border-default pt-0.5 font-bold">'
  },
  // Mobile cards in StoreUsageBalanceTable
  {
    from: 'bg-white/40 border border-white/20 rounded-2xl p-4 shadow-sm space-y-3',
    to: 'bg-surface border border-border-default rounded-2xl p-4 shadow-xs space-y-3'
  },
  {
    from: 'bg-white/60 p-2 rounded-xl border border-slate-100',
    to: 'bg-subtle/50 p-2 rounded-xl border border-border-subtle'
  },
  {
    from: 'text-slate-400 uppercase tracking-wider block',
    to: 'text-text-muted uppercase tracking-wider block'
  },
  {
    from: 'font-bold text-slate-700',
    to: 'font-bold text-text-primary'
  },
  // Top 5 Telemetry pill cards: give them bg-surface base
  {
    from: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-3.5 shadow-sm space-y-1',
    to: 'bg-surface bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-3.5 shadow-xs space-y-1'
  },
  {
    from: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-3.5 shadow-sm space-y-1',
    to: 'bg-surface bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-3.5 shadow-xs space-y-1'
  },
  {
    from: 'bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 rounded-2xl p-3.5 shadow-sm space-y-1',
    to: 'bg-surface bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 rounded-2xl p-3.5 shadow-xs space-y-1'
  },
  {
    from: 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-3.5 shadow-sm space-y-1',
    to: 'bg-surface bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-3.5 shadow-xs space-y-1'
  },
  {
    from: 'bg-gradient-to-br from-slate-900/5 to-slate-900/10 border border-slate-900/15 rounded-2xl p-3.5 shadow-sm space-y-1',
    to: 'bg-surface border border-border-default rounded-2xl p-3.5 shadow-xs space-y-1'
  }
]);

// 1.3 CylinderDispatchKpiCards.tsx (Top of Screenshot 1)
updateFile('src/components/oxygen/CylinderDispatchKpiCards.tsx', [
  {
    from: 'className={`relative overflow-hidden bg-white rounded-2xl p-5 border ${card.border} shadow-sm hover:shadow-md hover:scale-[1.01] transition-[transform,opacity,box-shadow,border-color] duration-300`}',
    to: 'className={`relative overflow-hidden bg-surface rounded-2xl p-5 border border-border-default hover:border-border-strong shadow-xs hover:scale-[1.01] transition-[transform,opacity,box-shadow,border-color] duration-300`}'
  },
  {
    from: 'text-slate-600 font-bold text-xs uppercase tracking-wider mb-1',
    to: 'text-text-muted font-bold text-xs uppercase tracking-wider mb-1'
  },
  {
    from: 'text-3xl font-extrabold text-slate-900 tracking-tight',
    to: 'text-3xl font-extrabold text-text-primary tracking-tight'
  },
  {
    from: 'text-slate-600 font-semibold text-[11px] mt-1',
    to: 'text-text-secondary font-semibold text-[11px] mt-1'
  },
  {
    from: 'relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between',
    to: 'relative overflow-hidden bg-surface rounded-2xl p-5 border border-border-default shadow-xs flex flex-col justify-between'
  }
]);

// 1.4 UnitDistributionTable.tsx
updateFile('src/components/oxygen/UnitDistributionTable.tsx', [
  // Outer table wrapper
  {
    from: 'bg-white/50 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-xl overflow-hidden',
    to: 'bg-surface border border-border-default rounded-2xl shadow-xs overflow-hidden'
  },
  // Table Header: faint text-slate-400
  {
    from: '<tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-400 font-extrabold text-xs uppercase tracking-wider">',
    to: '<tr className="border-b border-border-default bg-subtle/50 text-text-secondary font-bold text-xs uppercase tracking-wider">'
  },
  {
    from: 'text-[9px] text-slate-400 font-bold mt-1',
    to: 'text-[9px] text-text-muted font-bold mt-1'
  },
  // Search box
  {
    from: 'bg-white/65 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400',
    to: 'bg-surface border border-border-default rounded-xl text-text-primary placeholder:text-text-muted'
  },
  // Desktop table body
  {
    from: 'table className="w-full text-left border-collapse text-slate-700 font-semibold text-sm"',
    to: 'table className="w-full text-left border-collapse text-text-secondary font-semibold text-sm"'
  },
  {
    from: 'font-extrabold text-slate-800 text-sm',
    to: 'font-extrabold text-text-primary text-sm'
  },
  {
    from: 'font-extrabold text-slate-900',
    to: 'font-extrabold text-text-primary'
  },
  // KPI summary cards
  {
    from: 'className={`bg-gradient-to-br ${card.color} border backdrop-blur-xl rounded-3xl p-5 shadow-lg flex items-center justify-between transition-[transform,opacity,box-shadow,border-color] duration-300 hover:scale-[1.02]`}',
    to: 'className={`bg-surface bg-gradient-to-br ${card.color} border border-border-default rounded-2xl p-5 shadow-xs flex items-center justify-between transition-[transform,opacity,box-shadow,border-color] duration-300 hover:scale-[1.02]`}'
  },
  {
    from: 'text-slate-500 uppercase tracking-wider',
    to: 'text-text-muted uppercase tracking-wider'
  },
  {
    from: 'text-3xl font-extrabold text-slate-800 tracking-tight',
    to: 'text-3xl font-extrabold text-text-primary tracking-tight'
  },
  {
    from: 'text-[11px] font-semibold text-slate-500',
    to: 'text-[11px] font-semibold text-text-muted'
  }
]);

// 1.5 StoreBalanceGrid.tsx
updateFile('src/components/oxygen/StoreBalanceGrid.tsx', [
  {
    from: 'bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4',
    to: 'bg-surface border border-border-default rounded-2xl p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4'
  },
  {
    from: 'bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white',
    to: 'bg-surface border border-border-default rounded-xl pl-10 pr-9 py-2 text-xs font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-base/20 focus:border-accent-base'
  },
  {
    from: 'bg-slate-50 border border-slate-200/80 p-1 rounded-xl shrink-0',
    to: 'bg-subtle/50 border border-border-default p-1 rounded-xl shrink-0'
  },
  {
    from: 'bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs shrink-0',
    to: 'bg-subtle/50 p-1 rounded-xl border border-border-default text-xs shrink-0'
  }
]);

// 1.6 OxygenDashboardPage.tsx
updateFile('src/modules/mycylinder/pages/oxygen/OxygenDashboardPage.tsx', [
  {
    from: 'bg-white/70 backdrop-blur-xl',
    to: 'bg-surface'
  },
  {
    from: 'bg-white/40 backdrop-blur-xl',
    to: 'bg-surface'
  },
  {
    from: 'bg-white/50 backdrop-blur-sm',
    to: 'bg-surface'
  }
]);

// =========================================================================
// 2. SYSTEM-WIDE AUTOMATED TRANSFORMS (Active files across src/)
// =========================================================================

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('_archived') && file !== 'node_modules' && file !== '.git') {
        results = results.concat(walk(fullPath));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const allActiveFiles = walk('src');

allActiveFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // 1. Replace faint table header text-slate-400 with high-contrast text-text-secondary
  // Matches: <th className="...text-slate-400..." or <th className={`...text-slate-400...`}
  content = content.replace(/(<th[^>]*className=["'`][^"'`]*?)\btext-slate-400\b([^"'`]*?["'`])/g, (match, prefix, suffix) => {
    return `${prefix}text-text-secondary font-bold${suffix}`;
  });

  // 2. Replace the classic faint table header row pattern:
  // text-slate-400 uppercase tracking-wider
  content = content.replace(/\btext-slate-400(\s+(?:font-[a-z]+\s+)?(?:uppercase\s+)?tracking-wider)/g, 'text-text-secondary font-bold$1');

  // 3. Replace washed-out table card containers with bg-surface
  content = content.replace(/\bbg-white\/(?:40|50|60|70)\s+backdrop-blur-(?:sm|md|xl)\b/g, 'bg-surface');

  // 4. In table rows, replace text-slate-600 on numbers / body with text-text-primary or text-text-secondary
  // Matches: <td className="...text-slate-600...tabular-nums..."
  content = content.replace(/(<td[^>]*className=["'`][^"'`]*?)\btext-slate-600\b([^"'`]*?tabular-nums[^"'`]*?["'`])/g, (match, prefix, suffix) => {
    return `${prefix}text-text-primary${suffix}`;
  });

  // 5. Replace empty table state: <td colSpan={...} className="...text-slate-400...
  content = content.replace(/(<td[^>]*colSpan[^>]*className=["'`][^"'`]*?)\btext-slate-400\b([^"'`]*?["'`])/g, (match, prefix, suffix) => {
    return `${prefix}text-text-muted font-medium${suffix}`;
  });

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    modifiedFiles++;
    console.log(`[GLOBAL UPDATED] ${f}`);
  }
});

console.log(`\nOverhaul complete! Modified ${modifiedFiles} files.`);
