const fs = require('fs');
const path = require('path');

console.log('--- Starting Apple HIG Transformation for MyFormulari ---');

// 1. Transform LasaListPage.tsx
function transformLasaListPage() {
  const filePath = 'src/modules/myformulari/pages/LasaListPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove top decorative gradient bar
  content = content.replace(
    /<div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600" \/>\s*/g,
    ''
  );

  // Replace header panel classes & styling
  content = content.replace(
    'rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden',
    'rounded-2xl p-6 shadow-xs relative overflow-hidden'
  );
  content = content.replace(
    'p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg flex-shrink-0',
    'w-11 h-11 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0'
  );
  content = content.replace(
    '<AlertTriangle className="w-8 h-8" />',
    '<AlertTriangle className="w-6 h-6" />'
  );
  content = content.replace(
    'px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase rounded-full',
    'px-2.5 py-0.5 bg-subtle text-text-secondary border border-border-default text-[10px] font-semibold uppercase rounded-full'
  );
  content = content.replace(
    'px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer',
    'px-3.5 py-2 bg-surface hover:bg-subtle text-text-primary border border-border-default text-xs font-medium rounded-xl shadow-2xs flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer'
  );
  content = content.replace(
    'px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer',
    'px-3.5 py-2 bg-surface hover:bg-subtle text-text-primary border border-border-default text-xs font-medium rounded-xl shadow-2xs flex items-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer'
  );

  // Replace KPI Stats Counter Bar
  content = content.replace(
    /<div className="bg-surface p-5 rounded-3xl border border-border-default shadow-xs flex items-center gap-4">\s*<div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">\s*<Layers className="w-6 h-6" \/>\s*<\/div>\s*<div>\s*<span className="text-\[11px\] font-bold text-slate-400 uppercase tracking-wider block">Total LASA Pairs<\/span>\s*<span className="text-2xl font-black text-text-primary">\{stats\.total\} Pairs<\/span>\s*<\/div>\s*<\/div>/g,
    `<div className="bg-surface p-4 rounded-2xl border border-border-default flex items-center gap-3.5 hover:border-white/20 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Total LASA Pairs</span>
            <span className="text-xl font-bold text-text-primary tabular-nums">{stats.total} Pairs</span>
          </div>
        </div>`
  );

  content = content.replace(
    /<div className="bg-surface p-5 rounded-3xl border border-rose-200\/80 shadow-xs flex items-center gap-4">\s*<div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">\s*<AlertOctagon className="w-6 h-6" \/>\s*<\/div>\s*<div>\s*<span className="text-\[11px\] font-bold text-rose-500 uppercase tracking-wider block">Fatal \/ Critical Risk<\/span>\s*<span className="text-2xl font-black text-rose-700">\{stats\.critical\} Pairs<\/span>\s*<\/div>\s*<\/div>/g,
    `<div className="bg-surface p-4 rounded-2xl border border-border-default flex items-center gap-3.5 hover:border-white/20 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">Fatal / Critical Risk</span>
            <span className="text-xl font-bold text-text-primary tabular-nums">{stats.critical} Pairs</span>
          </div>
        </div>`
  );

  content = content.replace(
    /<div className="bg-surface p-5 rounded-3xl border border-border-default shadow-xs flex items-center gap-4">\s*<div className="p-3 bg-subtle text-text-secondary rounded-2xl">\s*<Flame className="w-6 h-6" \/>\s*<\/div>\s*<div>\s*<span className="text-\[11px\] font-bold text-slate-400 uppercase tracking-wider block">MOH High Alert \(HAM\)<\/span>\s*<span className="text-2xl font-black text-text-primary">\{stats\.hamCount\} Items<\/span>\s*<\/div>\s*<\/div>/g,
    `<div className="bg-surface p-4 rounded-2xl border border-border-default flex items-center gap-3.5 hover:border-white/20 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-subtle text-text-muted flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">MOH High Alert (HAM)</span>
            <span className="text-xl font-bold text-text-primary tabular-nums">{stats.hamCount} Items</span>
          </div>
        </div>`
  );

  content = content.replace(
    /<div className="bg-surface p-5 rounded-3xl border border-border-default shadow-xs flex items-center gap-4">\s*<div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">\s*<ShieldCheck className="w-6 h-6" \/>\s*<\/div>\s*<div>\s*<span className="text-\[11px\] font-bold text-slate-400 uppercase tracking-wider block">MOH Clinical Domains<\/span>\s*<span className="text-2xl font-black text-blue-700">\{stats\.categoriesCount\} Domains<\/span>\s*<\/div>\s*<\/div>/g,
    `<div className="bg-surface p-4 rounded-2xl border border-border-default flex items-center gap-3.5 hover:border-white/20 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-subtle text-text-muted flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">MOH Clinical Domains</span>
            <span className="text-xl font-bold text-text-primary tabular-nums">{stats.categoriesCount} Domains</span>
          </div>
        </div>`
  );

  // Replace the giant solid orange Educational Banner with Apple HIG Frosted Glass Card
  const orangeBannerRegex = /<div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const appleBannerReplacement = `<div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>MOH &amp; ISMP Medication Safety Standards</span>
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-subtle text-text-muted border border-border-default rounded-full text-[10px] font-semibold uppercase tracking-wider self-start sm:self-auto">
            Reduces Medication Errors by up to 70%
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
          TALL-Man Lettering Principles &amp; Ward Segregation SOPs
        </h2>

        <p className="text-xs text-text-muted leading-relaxed max-w-4xl">
          TALL-Man Lettering utilizes capitalized lettering to emphasize spelling differences between medications with confusable look-alike or sound-alike names (e.g. <strong className="text-text-primary">DOBUTamine</strong> vs <strong className="text-text-primary">DOPAmine</strong>, <strong className="text-text-primary">cefOTAXime</strong> vs <strong className="text-text-primary">cefTRIAXone</strong>). Medications in this registry mandate physical segregation protocols across hospital wards and pharmacy storage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <span className="text-xs font-semibold block text-text-primary">1. Medication Labels &amp; Bins</span>
            <span className="text-[11px] text-text-muted leading-relaxed block">Must be printed with TALL-Man on shelf bin tags, emergency crash carts, and ward unit-dose labels.</span>
          </div>

          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <span className="text-xs font-semibold block text-text-primary">2. Strict Physical Segregation</span>
            <span className="text-[11px] text-text-muted leading-relaxed block">LASA pairs must never be stored side-by-side. Utilize physical dividers and yellow LASA auxiliary labels.</span>
          </div>

          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <span className="text-xs font-semibold block text-text-primary">3. Independent Double-Check (IDC)</span>
            <span className="text-[11px] text-text-muted leading-relaxed block">Two healthcare personnel (nurses/pharmacists) must verify the full drug name, strength, and patient prior to administration.</span>
          </div>
        </div>
      </div>`;

  if (orangeBannerRegex.test(content)) {
    content = content.replace(orangeBannerRegex, appleBannerReplacement);
    console.log('✓ Replaced LasaListPage orange banner with Apple HIG frosted card');
  } else {
    console.warn('! Orange banner regex did not match in LasaListPage');
  }

  // Update Category Pills
  content = content.replace(
    /\? 'bg-amber-500 text-white shadow-md shadow-amber-500\/20'/g,
    "? 'bg-surface text-text-primary shadow-2xs border border-white/10 font-semibold'"
  );
  content = content.replace(
    /: 'bg-surface text-slate-400 hover:text-text-primary hover:bg-subtle\/50 border-border-default'/g,
    ": 'bg-subtle/50 text-text-muted hover:text-text-primary hover:bg-subtle border-border-default'"
  );

  // Update Drug Card container
  content = content.replace(
    'className="bg-surface rounded-3xl border border-border-default p-6 shadow-sm hover:shadow-md transition-shadow duration-150 space-y-4 flex flex-col justify-between"',
    'className="bg-surface rounded-2xl border border-border-default p-5 shadow-xs hover:border-white/20 transition-all duration-150 space-y-3.5 flex flex-col justify-between"'
  );

  // Update Drug Pair Comparison Box inside card
  content = content.replace(
    'bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 p-4 rounded-2xl border border-amber-200/80 space-y-3',
    'bg-subtle/30 p-3.5 rounded-xl border border-border-default/60 space-y-2.5'
  );
  content = content.replace(
    'p-3.5 bg-surface rounded-2xl border border-amber-300/80 shadow-xs text-center space-y-1',
    'p-3 bg-surface rounded-lg border border-border-default text-center space-y-1'
  );
  content = content.replace(
    'p-3.5 bg-surface rounded-2xl border border-rose-300/80 shadow-xs text-center space-y-1',
    'p-3 bg-surface rounded-lg border border-border-default text-center space-y-1'
  );

  // Update Risk callout
  content = content.replace(
    'text-text-secondary leading-relaxed bg-subtle/50 p-3 rounded-2xl border border-border-default text-xs',
    'text-text-secondary leading-relaxed bg-subtle/40 p-3 rounded-xl border border-border-default/60 text-xs'
  );
  content = content.replace(
    'text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200 leading-relaxed font-medium',
    'text-text-secondary bg-subtle/40 p-3 rounded-xl border border-border-default/60 leading-relaxed font-medium'
  );

  // Update modal header
  content = content.replace(
    'p-3 bg-amber-500 text-white rounded-2xl',
    'w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0'
  );
  content = content.replace(
    'p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2',
    'p-4 bg-subtle/40 rounded-xl border border-border-default/60 space-y-2'
  );
  content = content.replace(/text-amber-950/g, 'text-text-primary');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully transformed LasaListPage.tsx to Apple HIG');
}

// 2. Transform HamListPage.tsx
function transformHamListPage() {
  const filePath = 'src/modules/myformulari/pages/HamListPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove top decorative gradient bar
  content = content.replace(
    /<div className="absolute top-0 left-0 w-full h-1\.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" \/>\s*/g,
    ''
  );

  // Replace header panel
  content = content.replace(
    'rounded-3xl p-6 shadow-xl relative overflow-hidden',
    'rounded-2xl p-6 shadow-xs relative overflow-hidden'
  );
  content = content.replace(
    'p-3 bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-2xl shadow-md flex-shrink-0',
    'w-11 h-11 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center shrink-0'
  );
  content = content.replace(
    '<Flame className="w-7 h-7" />',
    '<Flame className="w-6 h-6" />'
  );

  // Replace Mandatory KKM Policy Banner with Apple HIG Frosted Card
  const crimsonBannerRegex = /<div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const appleCrimsonReplacement = `<div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>MOH Medication Safety Policy (Patient Safety Standard)</span>
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
          4 Mandatory Principles for Handling High Alert Medications (HAM) Across All Wards &amp; Units:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <Users className="w-4 h-4 text-rose-400 mb-1" />
            <h3 className="text-xs font-semibold text-text-primary">Independent Double-Check (IDC)</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Two independent staff must calculate doses, infusion pump rates, and verify patient identity prior to administration.
            </p>
          </div>

          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <ShieldAlert className="w-4 h-4 text-rose-400 mb-1" />
            <h3 className="text-xs font-semibold text-text-primary">Red Warning Auxiliary Labels</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              All HAM vials, syringes, and infusion bags must be affixed with red "HIGH ALERT" auxiliary labels.
            </p>
          </div>

          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <Lock className="w-4 h-4 text-rose-400 mb-1" />
            <h3 className="text-xs font-semibold text-text-primary">Dedicated Segregated Storage</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Unlock the locked box stock. Concentrated Potassium Chloride is strictly prohibited from general ward floor stock.
            </p>
          </div>

          <div className="p-3.5 bg-subtle/40 rounded-xl border border-border-default/60 space-y-1">
            <Activity className="w-4 h-4 text-rose-400 mb-1" />
            <h3 className="text-xs font-semibold text-text-primary">Electronic Infusion Smart Pumps</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Must utilize volumetric / syringe infusion smart pumps with strict rate guardrails.
            </p>
          </div>
        </div>
      </div>`;

  if (crimsonBannerRegex.test(content)) {
    content = content.replace(crimsonBannerRegex, appleCrimsonReplacement);
    console.log('✓ Replaced HamListPage crimson banner with Apple HIG frosted card');
  } else {
    console.warn('! Crimson banner regex did not match in HamListPage');
  }

  // Update filter ribbon
  content = content.replace(
    'className="bg-surface rounded-3xl border border-border-default shadow-sm p-5 space-y-4"',
    'className="bg-surface rounded-2xl border border-border-default shadow-xs p-4 space-y-3"'
  );

  // Update Drug Card container
  content = content.replace(
    'className={`bg-surface rounded-3xl border transition-colors duration-150 p-6 hover:shadow-lg cursor-pointer space-y-4 ${',
    'className={`bg-surface rounded-2xl border transition-all duration-150 p-5 hover:border-white/20 hover:shadow-md cursor-pointer space-y-3.5 active:scale-[0.99] ${'
  );

  // Fix the empty grey box / illegible precautions box bug!
  content = content.replace(
    /<div className="bg-rose-50\/50 p-4 rounded-2xl border border-rose-100 text-xs space-y-1\.5">\s*<strong className="text-rose-950 font-bold block uppercase tracking-wider text-\[11px\]">\s*Mandatory MOH Safety Precautions:\s*<\/strong>\s*<ul className="space-y-1 text-text-secondary">\s*\{drug\.hamPrecautions\.map\(\(pre, idx\) => \(\s*<li key=\{idx\} className="flex items-start gap-1\.5">\s*<span className="w-1\.5 h-1\.5 rounded-full bg-rose-500 mt-1\.5 shrink-0"><\/span>\s*<span>\{pre\}<\/span>\s*<\/li>\s*\)\)\}\s*<\/ul>\s*<\/div>/g,
    `<div className="bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/15 text-xs space-y-1.5">
                  <strong className="text-rose-400 font-semibold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Mandatory MOH Safety Precautions:</span>
                  </strong>
                  <ul className="space-y-1 text-text-secondary pl-0.5">
                    {drug.hamPrecautions.map((pre, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed">{pre}</span>
                      </li>
                    ))}
                  </ul>
                </div>`
  );

  // Update HAM Category tag on card top right
  content = content.replace(
    'text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full',
    'text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully transformed HamListPage.tsx to Apple HIG');
}

// 3. Transform DilutionProtocolPage.tsx
function transformDilutionProtocolPage() {
  const filePath = 'src/modules/myformulari/pages/DilutionProtocolPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove top decorative bar
  content = content.replace(
    /<div className="absolute top-0 left-0 w-full h-1\.5 bg-surface border border-border-default" \/>\s*/g,
    ''
  );

  // Update Header Card
  content = content.replace(
    'rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden',
    'rounded-2xl p-6 shadow-xs relative overflow-hidden'
  );
  content = content.replace(
    'p-3.5 bg-gradient-to-br from-teal-600 to-cyan-700 text-white rounded-2xl shadow-md flex-shrink-0',
    'w-11 h-11 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center shrink-0'
  );
  content = content.replace(
    '<Droplets className="w-8 h-8" />',
    '<Droplets className="w-6 h-6" />'
  );
  content = content.replace(
    'text-[10px] font-black uppercase tracking-wider bg-teal-100/90 text-teal-900 px-2.5 py-0.5 rounded-full flex items-center gap-1',
    'text-[10px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1'
  );

  // Replace muddy counter cards with Apple metric cells
  content = content.replace(
    /<div className="p-3 rounded-2xl bg-teal-50\/60 border border-teal-200\/70">\s*<p className="text-\[10px\] uppercase font-bold tracking-wider text-teal-700">Sekatan Cecair \(ICU\)<\/p>\s*<p className="text-xl font-black text-teal-900 mt-0\.5">\{stats\.fluidRestrictedCount\}<\/p>\s*<\/div>/g,
    `<div className="p-3.5 rounded-xl bg-surface border border-border-default">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-teal-400">Sekatan Cecair (ICU)</p>
              <p className="text-xl font-bold text-text-primary tabular-nums mt-0.5">{stats.fluidRestrictedCount}</p>
            </div>`
  );

  content = content.replace(
    /<div className="p-3 rounded-2xl bg-emerald-50\/60 border border-emerald-200\/70">\s*<p className="text-\[10px\] uppercase font-bold tracking-wider text-emerald-700">Sediaan Cecair \(Ready\)<\/p>\s*<p className="text-xl font-black text-emerald-900 mt-0\.5">\{stats\.liquidCount\}<\/p>\s*<\/div>/g,
    `<div className="p-3.5 rounded-xl bg-surface border border-border-default">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">Sediaan Cecair (Ready)</p>
              <p className="text-xl font-bold text-text-primary tabular-nums mt-0.5">{stats.liquidCount}</p>
            </div>`
  );

  content = content.replace(
    /<div className="p-3 rounded-2xl bg-amber-50\/60 border border-amber-200\/70">\s*<p className="text-\[10px\] uppercase font-bold tracking-wider text-amber-700">Serbuk Rekonstitusi<\/p>\s*<p className="text-xl font-black text-amber-900 mt-0\.5">\{stats\.powderCount\}<\/p>\s*<\/div>/g,
    `<div className="p-3.5 rounded-xl bg-surface border border-border-default">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-amber-400">Serbuk Rekonstitusi</p>
              <p className="text-xl font-bold text-text-primary tabular-nums mt-0.5">{stats.powderCount}</p>
            </div>`
  );

  content = content.replace(
    'p-3 rounded-2xl bg-subtle/50 border border-border-default',
    'p-3.5 rounded-xl bg-surface border border-border-default'
  );

  // Replace giant teal banner with Apple HIG Frosted Glass Card
  const tealBannerRegex = /<div className="bg-gradient-to-r from-slate-900 via-teal-950 to-cyan-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-teal-800\/40 flex flex-col md:flex-row md:items-center justify-between gap-4">[\s\S]*?<\/div>\s*<\/div>/;
  const appleTealReplacement = `<div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-teal-400 bg-teal-500/10 border border-teal-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Dokumen Rujukan Rasmi KKM (Official MOH Guidelines)</span>
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
              All protocols are extracted directly from MOH Pharmaceutical Services Programme with zero synthetic data to safeguard patient safety.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://pharmacy.moh.gov.my/sites/default/files/document-upload/update-dec-2025-april-2024-dilution-guide-fluid-restricted-critically-ill-adults.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-surface hover:bg-subtle text-text-primary border border-border-default transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              <span>Fluid-Restricted Guide (PDF)</span>
            </a>

            <a
              href="https://pharmacy.moh.gov.my/sites/default/files/document-upload/dilution-guideline-injectable-drugs-part-i-antimicrobial-april-2021-pdf.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-surface hover:bg-subtle text-text-primary border border-border-default transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Antimicrobial Guide (PDF)</span>
            </a>
          </div>
        </div>`;

  if (tealBannerRegex.test(content)) {
    content = content.replace(tealBannerRegex, appleTealReplacement);
    console.log('✓ Replaced DilutionProtocolPage teal banner with Apple HIG frosted card');
  } else {
    console.warn('! Teal banner regex did not match in DilutionProtocolPage');
  }

  // Update filter controls container
  content = content.replace(
    'className="bg-surface rounded-3xl border border-border-default shadow-xs p-5 space-y-4"',
    'className="bg-surface rounded-2xl border border-border-default shadow-xs p-4 space-y-3"'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully transformed DilutionProtocolPage.tsx to Apple HIG');
}

// 4. Transform DilutionCard.tsx
function transformDilutionCard() {
  const filePath = 'src/modules/myformulari/components/DilutionCard.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Container styling
  content = content.replace(
    'className="w-full bg-surface rounded-3xl border border-border-default shadow-sm hover:shadow-md transition-colors overflow-hidden text-text-primary"',
    'className="w-full bg-surface rounded-2xl border border-border-default shadow-xs hover:border-white/20 transition-all duration-150 overflow-hidden text-text-primary"'
  );

  // Remove top accent gradient bar
  content = content.replace(
    /<div className="h-2 w-full bg-surface border border-border-default" \/>\s*/g,
    ''
  );

  // Fix blinding white card header!
  content = content.replace(
    'p-6 sm:p-7 border-b border-border-subtle bg-gradient-to-b from-slate-50/70 to-white flex flex-col md:flex-row md:items-center justify-between gap-4',
    'p-5 sm:p-6 border-b border-border-default bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4'
  );

  // Fix text-teal-800 and text-teal-950 in header
  content = content.replace(
    'text-teal-800 bg-teal-50 border border-teal-200',
    'text-teal-400 bg-teal-500/10 border border-teal-500/20'
  );
  content = content.replace(
    'text-[10px] font-extrabold uppercase tracking-wider text-teal-900 bg-teal-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1',
    'text-[10px] font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1'
  );
  content = content.replace(
    'text-xs font-semibold text-teal-800 flex items-center gap-1.5',
    'text-xs font-medium text-text-muted flex items-center gap-1.5'
  );
  content = content.replace(
    '<strong className="text-teal-950 font-black">{drugName}</strong>',
    '<strong className="text-text-primary font-semibold">{drugName}</strong>'
  );

  // Fix the 4 Hero Clinical Metric Badges
  content = content.replace(
    'p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-subtle/50 border-b border-border-subtle',
    'p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-subtle/30 border-b border-border-default'
  );
  content = content.replace(
    /p-4 rounded-2xl bg-surface border border-border-default shadow-2xs space-y-1\.5/g,
    'p-3.5 rounded-xl bg-surface border border-border-default/60 space-y-1'
  );

  // Fix unreadable text-teal-900 in Metric 2
  content = content.replace(
    'text-xs font-black text-teal-900 leading-snug',
    'text-xs font-semibold text-text-primary leading-snug'
  );

  // Fix Administration Regimens container and titles
  content = content.replace(
    'p-5 rounded-2xl bg-cyan-50/40 border border-cyan-200/80 shadow-2xs space-y-2.5 flex flex-col justify-between',
    'p-4 rounded-xl bg-subtle/40 border border-border-default/80 space-y-2 flex flex-col justify-between'
  );
  content = content.replace(
    'text-xs font-extrabold text-cyan-950 leading-snug',
    'text-xs font-semibold text-text-primary leading-snug'
  );
  content = content.replace(
    'w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5',
    'w-5 h-5 rounded-full bg-accent-base/20 text-accent-base flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5'
  );

  // Fix highlighted text style in formatHighlightedText
  content = content.replace(
    'font-extrabold text-teal-900 bg-teal-100/60 px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5',
    'font-semibold text-accent-base bg-accent-subtle/30 px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5'
  );

  // Fix incompatible diluents callout
  content = content.replace(
    'mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 font-medium space-y-1',
    'mt-3 p-3.5 bg-rose-500/5 border border-rose-500/15 rounded-xl text-[11px] text-rose-300 font-medium space-y-1'
  );
  content = content.replace(
    'font-extrabold text-rose-950 uppercase tracking-wide block flex items-center gap-1',
    'font-semibold text-rose-400 uppercase tracking-wide block flex items-center gap-1'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully transformed DilutionCard.tsx to Apple HIG');
}

// Execute all transforms
transformLasaListPage();
transformHamListPage();
transformDilutionProtocolPage();
transformDilutionCard();

console.log('--- Apple HIG Transformation Complete ---');
