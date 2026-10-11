const fs = require('fs');
const path = require('path');

console.log('===> Starting Oxygen Dashboard Depth & Ergonomics Refactor...');

// 1. Refactor CylinderOfflineBanner.tsx
const bannerPath = path.resolve('src/components/oxygen/CylinderOfflineBanner.tsx');
let bannerCode = fs.readFileSync(bannerPath, 'utf8');

// Modern Depth floating offline pill
bannerCode = bannerCode.replace(
  'className="flex items-center justify-between gap-2 text-xs text-slate-600 bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 mb-1 shadow-elevation-1"',
  'className="flex items-center justify-between gap-2 text-xs text-text-secondary bg-surface border border-border-default rounded-xl px-3.5 py-2 mb-2 shadow-elevation-1"'
);
bannerCode = bannerCode.replace(
  'className="font-semibold text-slate-900 shrink-0 text-[11px] sm:text-xs"',
  'className="font-bold text-text-primary shrink-0 text-[11px] sm:text-xs"'
);
bannerCode = bannerCode.replace(
  'className="text-slate-300 hidden sm:inline"',
  'className="text-border-default hidden sm:inline"'
);
bannerCode = bannerCode.replace(
  'className="text-slate-500 truncate hidden sm:inline text-xs"',
  'className="text-text-muted truncate hidden sm:inline text-xs"'
);
bannerCode = bannerCode.replace(
  'className="text-[10px] font-mono font-medium text-slate-600 sm:hidden bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0"',
  'className="text-[10px] font-mono font-semibold text-text-secondary sm:hidden bg-subtle px-2 py-0.5 rounded-md border border-border-default shrink-0"'
);
bannerCode = bannerCode.replace(
  'className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer text-xs active:scale-95 transition-[transform,opacity,box-shadow,border-color]"',
  'className="text-accent-base hover:text-accent-hover font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer text-xs active:scale-95 transition-colors"'
);

fs.writeFileSync(bannerPath, bannerCode, 'utf8');
console.log('✓ Successfully updated CylinderOfflineBanner.tsx');

// 2. Refactor OxygenDashboardPage.tsx
const pagePath = path.resolve('src/modules/mycylinder/pages/oxygen/OxygenDashboardPage.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');
let lines = pageCode.split('\n');

// 2A: Add isRightSidebarOpen state
const stateIdx = lines.findIndex(l => l.includes("const [ledgerViewMode, setLedgerViewMode] = useState<'detailed' | 'monthly'>('detailed')"));
if (stateIdx === -1) throw new Error('Could not find ledgerViewMode state line');
lines.splice(stateIdx + 1, 0, "  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)");
console.log('✓ Added isRightSidebarOpen state');

// 2B: Modern Depth Vote Code Filter Bar icon & buttons
const voteIconIdx = lines.findIndex(l => l.includes('<Database className="w-4 h-4" />'));
if (voteIconIdx !== -1 && lines[voteIconIdx - 1].includes('bg-teal-50')) {
  lines[voteIconIdx - 1] = '              <div className="w-8 h-8 rounded-lg bg-accent-base/10 border border-accent-base/20 flex items-center justify-center text-accent-base shrink-0">';
}

// 2C: Replace the 5 Financial KPI Cards
const kpiStartIdx = lines.findIndex(l => l.includes('<div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">'));
if (kpiStartIdx === -1) throw new Error('Could not find kpiStartIdx');

let kpiEndIdx = -1;
for (let i = kpiStartIdx; i < kpiStartIdx + 180; i++) {
  if (lines[i].includes('MODERN ACTION BAR')) {
    kpiEndIdx = i;
    break;
  }
}
// Find closing </div> before kpiEndIdx
let kpiDivEndIdx = -1;
for (let i = kpiEndIdx - 1; i >= kpiStartIdx; i--) {
  if (lines[i].trim() === '</div>' && lines[i - 1].includes('</div>')) {
    kpiDivEndIdx = i;
    break;
  }
}
if (kpiDivEndIdx === -1) throw new Error('Could not find kpiDivEndIdx');

const newKpiBlock = `            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
              {/* Card 1: Total Allocation */}
              <div className="col-span-1 order-2 lg:order-1 bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 shadow-elevation-1 hover:border-border-default/80 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block truncate">
                      {language === 'ms' ? 'JUMLAH PERUNTUKAN' : 'TOTAL ALLOCATION'}
                    </span>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono tabular-nums text-text-primary tracking-tight mt-1 truncate">
                      {fmt(displayAllocation)}
                    </h4>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent-base/10 border border-accent-base/20 rounded-lg flex items-center justify-center text-accent-base shrink-0">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center gap-1.5 text-[10px] font-semibold text-text-muted truncate">
                  <Database className="w-3 h-3 text-accent-base shrink-0" />
                  <span className="truncate">{displayVoteBadge}</span>
                </div>
              </div>

              {/* Card 2: Total Expenses */}
              <div className="col-span-1 order-3 lg:order-2 bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 shadow-elevation-1 hover:border-border-default/80 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block truncate">
                      {language === 'ms' ? 'PERBELANJAAN SEBENAR' : 'ACTUAL EXPENSES'}
                    </span>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono tabular-nums text-text-primary tracking-tight mt-1 truncate">
                      {fmt(displayExpenses)}
                    </h4>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center text-rose-400 shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center gap-1 text-[10px] font-semibold text-rose-400 truncate">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span className="truncate">{language === 'ms' ? 'Isian Semula Gas' : 'Gas Refills'}</span>
                </div>
              </div>

              {/* Card 3: Liabilities */}
              <div className="col-span-1 order-4 lg:order-3 bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 shadow-elevation-1 hover:border-border-default/80 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block truncate">
                      {language === 'ms' ? 'TANGGUNGAN PO/SO' : 'LIABILITIES'}
                    </span>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono tabular-nums text-text-primary tracking-tight mt-1 truncate">
                      {fmt(displayLiabilities)}
                    </h4>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-sky-500/10 border border-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 shrink-0">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border-subtle text-[10px] font-semibold text-text-muted truncate">
                  {language === 'ms' ? 'Pesanan Belum Selesai' : 'Committed PO / SO'}
                </div>
              </div>

              {/* Card 4 on Mobile (Order First) / Card 4 on Desktop (Net Current Balance) */}
              <div className={\`col-span-2 order-first lg:order-4 lg:col-span-1 bg-surface border rounded-xl p-3.5 sm:p-4 shadow-elevation-1 transition-colors \${
                isOverBudget ? 'border-rose-500/50' : 'border-border-default'
              }\`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      {language === 'ms' ? 'CURRENT BALANCE BERSIH' : 'NET CURRENT BALANCE'}
                    </span>
                    <h4 className={\`text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight mt-1 \${
                      isOverBudget ? 'text-rose-400' : 'text-text-primary'
                    }\`}>
                      {fmt(displayBalance)}
                    </h4>
                  </div>
                  <div className={\`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border \${
                    isOverBudget ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }\`}>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Health Badge & Utilization Progress */}
                <div className="mt-2.5 pt-2 border-t border-border-subtle space-y-1.5">
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className={\`inline-flex items-center gap-1 font-semibold \${
                      isOverBudget ? 'text-rose-400' : 'text-emerald-400'
                    }\`}>
                      <span className={\`w-1.5 h-1.5 rounded-full \${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}\`}></span>
                      {isOverBudget ? (language === 'ms' ? 'Defisit Melebihi Had' : 'Deficit Overdraft') : (language === 'ms' ? 'Peruntukan Sihat' : 'Healthy Allocation')}
                    </span>
                    <span className="font-mono font-semibold text-text-muted">
                      {utilizationPct}% {language === 'ms' ? 'digunakan' : 'used'}
                    </span>
                  </div>
                  {/* Utilization Progress Bar */}
                  <div className="h-1.5 w-full bg-subtle rounded-full overflow-hidden flex border border-border-default/50">
                    <div 
                      className="bg-accent-base h-full transition-colors" 
                      style={{ width: \`\${Math.min(100, displayAllocation > 0 ? (displayExpenses / displayAllocation) * 100 : 0)}%\` }} 
                      title={\`Belanja: \${fmt(displayExpenses)}\`}
                    />
                    <div 
                      className="bg-sky-400 h-full transition-colors" 
                      style={{ width: \`\${Math.min(100 - (displayAllocation > 0 ? (displayExpenses / displayAllocation) * 100 : 0), displayAllocation > 0 ? (displayLiabilities / displayAllocation) * 100 : 0)}%\` }} 
                      title={\`Tanggungan: \${fmt(displayLiabilities)}\`}
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Loan Charges */}
              <div className="col-span-1 order-5 lg:order-5 bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 shadow-elevation-1 hover:border-border-default/80 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block truncate">
                      {language === 'ms' ? 'CAJ PINJAMAN' : 'LOAN CHARGES'}
                    </span>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono tabular-nums text-text-primary tracking-tight mt-1 truncate">
                      {fmt(displayLoanCharges)}
                    </h4>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 shrink-0">
                    <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[10px] font-mono text-text-muted font-semibold truncate">
                    {fmt(systemSettings?.loan_cylinder_rate || 18.36)}/sil
                  </span>
                </div>
              </div>
            </div>`;

lines.splice(kpiStartIdx, kpiDivEndIdx - kpiStartIdx + 1, ...newKpiBlock.split('\n'));
console.log('✓ Successfully replaced KPI Cards block');

// Join back to string for surgical token replacements
pageCode = lines.join('\n');

// 2D: Replace hardcoded `#008f76` in vote and action buttons
pageCode = pageCode.replaceAll("bg-[#008f76] text-white shadow-elevation-1 font-bold", "bg-accent-base text-white shadow-elevation-1 font-bold");
pageCode = pageCode.replaceAll("bg-[#008f76] hover:bg-[#007a65] active:bg-[#006e5b] text-white", "bg-accent-base hover:bg-accent-hover text-white");
pageCode = pageCode.replaceAll("bg-[#008f76] hover:bg-[#007a65] text-white", "bg-accent-base hover:bg-accent-hover text-white");
pageCode = pageCode.replaceAll("bg-[#008f76] text-white", "bg-accent-base text-white");

// 2E: Action Bar buttons
pageCode = pageCode.replace(
  'className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-semibold shadow-elevation-1 active:scale-[0.98] transition-colors flex items-center justify-center gap-2 cursor-pointer"',
  'className="px-4 py-2.5 bg-surface hover:bg-subtle text-text-primary border border-border-default rounded-xl text-xs font-semibold shadow-elevation-1 active:scale-[0.98] transition-colors flex items-center justify-center gap-2 cursor-pointer"'
);
pageCode = pageCode.replace(
  'className="w-4 h-4 text-teal-400"',
  'className="w-4 h-4 text-accent-base"'
);
pageCode = pageCode.replace(
  'className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 border border-purple-200/80 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"',
  'className="px-4 py-2.5 bg-subtle hover:bg-subtle/80 text-text-secondary border border-border-default rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"'
);
pageCode = pageCode.replace(
  'className="w-4 h-4 text-purple-600"',
  'className="w-4 h-4 text-accent-base"'
);

// 2F: Add Collapsible Sidebar Toggle Button next to Combine Month
const combineMonthStr = `<span>{language === 'ms' ? 'Gabung Bulan' : 'Combine Month'}</span>
                </button>`;
const combineMonthReplacement = `<span>{language === 'ms' ? 'Gabung Bulan' : 'Combine Month'}</span>
                </button>

                {/* Collapsible Panel Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className={\`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border active:scale-95 cursor-pointer \${
                    isRightSidebarOpen
                      ? 'bg-subtle text-text-primary border-border-default hover:bg-subtle/80'
                      : 'bg-surface text-text-muted border-border-default hover:text-text-primary'
                  }\`}
                  title={isRightSidebarOpen ? (language === 'ms' ? 'Sembunyi Panel Pembekal' : 'Hide Supplier Panel') : (language === 'ms' ? 'Papar Panel Pembekal' : 'Show Supplier Panel')}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isRightSidebarOpen ? (language === 'ms' ? 'Sembunyi Sisi' : 'Hide Sidebar') : (language === 'ms' ? 'Papar Sisi' : 'Show Sidebar')}</span>
                </button>`;

if (pageCode.includes(combineMonthStr)) {
  pageCode = pageCode.replace(combineMonthStr, combineMonthReplacement);
  console.log('✓ Added Collapsible Panel toggle button');
}

// 2G: Detailed Table Contrast & Column width fixes
pageCode = pageCode.replace(
  'max-w-[160px]',
  'min-w-[160px] max-w-[260px]'
);
pageCode = pageCode.replace(
  '<span className={`truncate block ${isLoanOnly ? "text-purple-700" : "text-teal-600"}`} title={rec.delivery_order_no}>{rec.delivery_order_no}</span>',
  '<span className={`truncate block font-mono font-bold ${isLoanOnly ? "text-amber-400" : "text-accent-base"}`} title={rec.delivery_order_no}>{rec.delivery_order_no}</span>'
);
pageCode = pageCode.replace(
  '<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[8.5px] font-black tracking-wider uppercase w-max">',
  '<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[8.5px] font-bold tracking-wider uppercase w-max">'
);
pageCode = pageCode.replace(
  'px-3 py-3 text-purple-700 font-semibold whitespace-nowrap text-xs',
  'px-3 py-3 text-text-muted font-mono tabular-nums whitespace-nowrap text-xs'
);
// FIX THE INVISIBLE TEXT BUG (text-slate-950 on dark background)
pageCode = pageCode.replaceAll(
  'text-slate-950 font-black whitespace-nowrap text-xs',
  'text-text-primary font-mono tabular-nums font-bold whitespace-nowrap text-xs'
);
pageCode = pageCode.replaceAll(
  'text-slate-950 font-black text-sm whitespace-nowrap',
  'text-text-primary font-mono tabular-nums font-bold text-xs whitespace-nowrap'
);

// Translucent status badges
pageCode = pageCode.replaceAll(
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
);
pageCode = pageCode.replaceAll(
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-amber-500/10 text-amber-400 border border-amber-500/25'
);
pageCode = pageCode.replaceAll(
  'bg-amber-50 text-amber-800 border-amber-300',
  'bg-amber-500/10 text-amber-400 border border-amber-500/25'
);

// 2H: Monthly View thead and row token polish
pageCode = pageCode.replace(
  'thead className="bg-teal-50/70 text-[10px] font-black text-teal-900 uppercase tracking-widest border-b border-teal-100"',
  'thead className="bg-subtle text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border-default"'
);
pageCode = pageCode.replaceAll('hover:bg-teal-50/30', 'hover:bg-subtle/50');
pageCode = pageCode.replaceAll('bg-teal-50 text-teal-700 border border-teal-200/80', 'bg-accent-base/10 text-accent-base border border-accent-base/20');
pageCode = pageCode.replaceAll('bg-blue-50 text-blue-700 border border-blue-200/80', 'bg-sky-500/10 text-sky-400 border border-sky-500/20');
pageCode = pageCode.replaceAll('bg-purple-50 text-purple-700 border border-purple-200/80', 'bg-amber-500/10 text-amber-400 border border-amber-500/20');

// 2I: Sidebar Wrapper & Collapsible implementation
const sidebarStartTarget = `          {/* RIGHT SIDE: SIDEBAR WIDGETS (Compact width so table doesn't need horizontal scroll) */}
          <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 space-y-6">`;

const sidebarStartReplacement = `          {/* RIGHT SIDE: SIDEBAR WIDGETS (Collapsible Drawer with Modern Depth standard) */}
          {isRightSidebarOpen && (
          <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 space-y-5 transition-[transform,opacity] duration-200">`;

if (pageCode.includes(sidebarStartTarget)) {
  pageCode = pageCode.replace(sidebarStartTarget, sidebarStartReplacement);
  console.log('✓ Replaced sidebar start');
}

// Adjust button
pageCode = pageCode.replace(
  'className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-lg text-[10px] font-bold tracking-wider transition-colors flex items-center gap-1 active:scale-95 border border-sky-100 shrink-0 cursor-pointer"',
  'className="px-2.5 py-1 bg-accent-base/10 hover:bg-accent-base/20 text-accent-base rounded-lg text-[10px] font-bold tracking-wider transition-colors flex items-center gap-1 active:scale-95 border border-accent-base/20 shrink-0 cursor-pointer"'
);

// Sidebar loan rate
pageCode = pageCode.replace(
  'className="flex items-center justify-between py-2 border-t border-purple-100 hover:bg-purple-50 px-2 rounded-lg transition-colors mt-1 bg-purple-50/60 gap-2"',
  'className="flex items-center justify-between py-2 border-t border-border-subtle hover:bg-subtle/50 px-2 rounded-lg transition-colors mt-1 bg-subtle/40 gap-2"'
);
pageCode = pageCode.replace(
  'className="text-[11px] font-black text-purple-700 tracking-tight uppercase truncate"',
  'className="text-[11px] font-bold text-text-secondary tracking-tight uppercase truncate"'
);
pageCode = pageCode.replace(
  'className="font-mono text-xs font-black text-purple-700 shrink-0 whitespace-nowrap"',
  'className="font-mono text-xs font-bold text-text-primary shrink-0 whitespace-nowrap"'
);

// Close sidebar wrapper before Real Cylinder Live List Table
const sidebarEndTarget = `            {/* Sidebar content end */}
            
          </div>
        </div>

        {/* Real Cylinder Live List Table (Audited mini list) */}`;

const sidebarEndReplacement = `            {/* Sidebar content end */}
            
          </div>
          )}
        </div>

        {/* Real Cylinder Live List Table (Audited mini list) */}`;

if (pageCode.includes(sidebarEndTarget)) {
  pageCode = pageCode.replace(sidebarEndTarget, sidebarEndReplacement);
  console.log('✓ Successfully closed collapsible sidebar wrapper');
}

// Re-theme Widget B (Government Warrant)
pageCode = pageCode.replace(
  `                <div className={\`border rounded-xl p-4 sm:p-5 shadow-elevation-1 relative overflow-hidden transition-colors duration-150
                  \${isOverBudget 
                    ? 'bg-rose-50/60 border-rose-200' 
                    : 'bg-emerald-50/50 border-emerald-200/90'}\`}`,
  '                <div className="bg-surface border border-border-default rounded-xl p-4 sm:p-5 shadow-elevation-1 relative overflow-hidden transition-colors duration-150"'
);
pageCode = pageCode.replace(
  `                  <div className={\`flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-2.5
                    \${isOverBudget ? 'text-rose-700' : 'text-emerald-700'}\`}`,
  `                  <div className={\`flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-2.5 \${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}\`}`
);
pageCode = pageCode.replace(
  'className="w-4 h-4 text-emerald-500 animate-pulse"',
  'className="w-4 h-4 text-emerald-400"'
);
pageCode = pageCode.replace(
  `                  <p className={\`text-[10.5px] font-semibold leading-relaxed \${isOverBudget ? 'text-rose-700' : 'text-emerald-800'}\`}>`,
  '                  <p className="text-[11px] font-medium leading-relaxed text-text-secondary">'
);
pageCode = pageCode.replace(
  'className={`w-full rounded-full h-2 overflow-hidden shadow-inner ${isOverBudget ? \'bg-rose-100\' : \'bg-emerald-100\'}`}',
  'className="w-full rounded-full h-1.5 overflow-hidden bg-subtle border border-border-default/50"'
);

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log('✓ Successfully updated OxygenDashboardPage.tsx!');
console.log('===> Refactor completed successfully in 1 deterministic pass!');
