// scripts/refactor-formulari-depth.cjs
// Deterministic refactoring script to align MyFormulari subpages with H.O.M.E. Depth Design System
// Eliminates rainbow gradients, purple/indigo slop, jarring white backgrounds in dark mode, and skittle KPI colors.

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');

function updateFile(relativePath, transforms) {
  const fullPath = path.resolve(rootDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[ERROR] File not found: ${fullPath}`);
    return false;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  for (const { search, replace, name } of transforms) {
    if (typeof search === 'string') {
      if (!content.includes(search)) {
        console.warn(`[WARN] Pattern not found in ${relativePath}: ${name || search.slice(0, 40)}`);
      } else {
        content = content.replace(search, replace);
      }
    } else if (search instanceof RegExp) {
      if (!search.test(content)) {
        console.warn(`[WARN] Regex not matching in ${relativePath}: ${name || search.toString().slice(0, 40)}`);
      } else {
        content = content.replace(search, replace);
      }
    }
  }

  if (content !== originalContent) {
    let written = false;
    for (let i = 0; i < 5; i++) {
      try {
        fs.writeFileSync(fullPath, content, 'utf8');
        written = true;
        break;
      } catch (err) {
        const start = Date.now();
        while (Date.now() - start < 100) {}
      }
    }
    if (written) {
      console.log(`[SUCCESS] Updated ${relativePath}`);
      return true;
    } else {
      console.error(`[FAIL] Could not write ${relativePath}`);
      return false;
    }
  } else {
    console.log(`[NO CHANGE] ${relativePath}`);
    return false;
  }
}

console.log('=== Completing MyFormulari Depth Design System Alignment ===');

// 1. AntimicrobialGuidelinePage.tsx
updateFile('src/modules/myformulari/pages/AntimicrobialGuidelinePage.tsx', [
  {
    name: 'Replace Header with ModulePageHeader',
    search: new RegExp(
      '\\{\\/\\* 1\\. TOP OFFICIAL KKM PORTAL HEADER \\*\\}\\r?\\n\\s*<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-surface border border-border-default rounded-2xl p-6 shadow-xs relative overflow-hidden">[\\s\\S]*?<span>Cetak<\\/span>\\r?\\n\\s*<\\/button>\\r?\\n\\s*<\\/div>\\r?\\n\\s*<\\/div>'
    ),
    replace: `{/* Standard Clinical Header */}
      <ModulePageHeader
        icon={ShieldCheck}
        title="National Antimicrobial Guidelines (NAG 2024)"
        description="National Antimicrobial Guideline 4th Edition (MOH) & Antimicrobial Stewardship (AMS) Portal Lawas Hospital"
        badges={[
          { label: syncMeta.edition, variant: 'neutral' },
          { label: '17 Adult (A1–A17) • 14 Paediatric (B1–B14)', variant: 'accent' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="px-3.5 py-2 bg-surface hover:bg-subtle text-text-primary text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-border-default shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-text-muted" />
              <span>{showGuide ? 'Tutup Panduan' : 'Panduan Pengguna'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCalculator()}
              className="px-3.5 py-2 bg-accent-base hover:bg-accent-hover text-accent-foreground text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Kalkulator Dos</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-secondary text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
              <span>Penyegerakan</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-surface hover:bg-subtle border border-border-default text-text-secondary text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-text-muted" />
              <span>Cetak</span>
            </button>
          </div>
        }
      />`
  }
]);

// 2. NAGClinicalMonograph.tsx (Card 3 and Callouts)
updateFile('src/modules/myformulari/components/NAGClinicalMonograph.tsx', [
  {
    name: 'CARD 3: Penicillin Allergy Option - remove glare',
    search: new RegExp(
      '<div className="p-5 rounded-3xl bg-amber-50\\/80 border-2 border-amber-300 shadow-elevation-1 space-y-3 flex flex-col justify-between">[\\s\\S]*?\\* \\{guideline\\.penicillinAllergyOption\\.remarks\\}\\r?\\n\\s*<\\/p>\\r?\\n\\s*<\\/div>\\r?\\n\\s*\\)\\}\\r?\\n\\s*<\\/div>'
    ),
    replace: `<div className="p-5 rounded-2xl bg-surface border border-amber-500/30 dark:bg-slate-900/60 dark:border-amber-500/30 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        If Penicillin Allergy
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Safety Warning
                    </span>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                    {guideline.penicillinAllergyOption.regimen}
                  </div>

                  <div className="text-xs leading-relaxed bg-subtle dark:bg-slate-950/60 p-3.5 rounded-xl border border-border-default font-medium space-y-1">
                    <strong className="text-text-primary block text-[11px] uppercase tracking-wider font-semibold">
                      Dosage &amp; Route:
                    </strong>
                    <span className="text-text-secondary">{guideline.penicillinAllergyOption.routeAndDose}</span>
                  </div>
                </div>

                {guideline.penicillinAllergyOption.remarks && (
                  <div className="pt-3 border-t border-border-subtle">
                    <p className="text-[11px] text-text-muted italic leading-relaxed">
                      * {guideline.penicillinAllergyOption.remarks}
                    </p>
                  </div>
                )}
              </div>`
  },
  {
    name: 'Paediatric formula callout banner',
    search: 'p-4 bg-cyan-50/90 border-2 border-cyan-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
    replace: 'p-4 bg-surface border border-sky-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs'
  },
  {
    name: 'Paediatric formula button',
    search: 'bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-black text-xs shadow-elevation-1',
    replace: 'bg-accent-base hover:bg-accent-hover text-accent-foreground rounded-xl font-bold text-xs shadow-xs'
  },
  {
    name: 'Oral Step-down callout banner',
    search: 'p-5 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 border-2 border-indigo-200 rounded-3xl text-xs space-y-2.5 shadow-elevation-1',
    replace: 'p-5 bg-surface border border-border-default rounded-2xl text-xs space-y-2.5 shadow-xs'
  },
  {
    name: 'Oral Step-down header text',
    search: 'font-black text-indigo-950 flex items-center gap-2 text-xs sm:text-sm',
    replace: 'font-bold text-text-primary flex items-center gap-2 text-xs sm:text-sm'
  },
  {
    name: 'Oral Step-down icon color',
    search: 'text-indigo-600 flex-shrink-0',
    replace: 'text-sky-500 flex-shrink-0'
  }
]);

// 3. PRNHotlineCard.tsx clean remaining items
updateFile('src/modules/myformulari/components/PRNHotlineCard.tsx', [
  {
    name: 'Emergency lines cards clean',
    search: 'hover:border-indigo-400/40 rounded-2xl p-4 transition-colors',
    replace: 'border-border-default hover:border-border-strong rounded-xl p-4 transition-colors'
  }
]);

console.log('=== Refactoring Script Finished ===');
