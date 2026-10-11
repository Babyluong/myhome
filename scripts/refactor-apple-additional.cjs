const fs = require('fs');

console.log('--- Harmonizing Remaining MyFormulari Pages to Apple HIG ---');

// 1. AntimicrobialGuidelinePage.tsx
function transformAntimicrobial() {
  const filePath = 'src/modules/myformulari/pages/AntimicrobialGuidelinePage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove top stripe
  content = content.replace(
    /<div className="absolute top-0 left-0 w-full h-1\.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" \/>\s*/g,
    ''
  );

  // Header styling
  content = content.replace(
    'rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden',
    'rounded-2xl p-6 shadow-xs relative overflow-hidden'
  );
  content = content.replace(
    'w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl shadow-md flex items-center justify-center flex-shrink-0',
    'w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0'
  );
  content = content.replace(
    '<ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-200" />',
    '<ShieldCheck className="w-6 h-6 text-emerald-400" />'
  );

  // AMS Protocol Banner -> Apple HIG Frosted Card
  const amsBannerRegex = /<div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-md">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const appleAmsReplacement = `<div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                  Polisi Antimicrobial Stewardship (AMS) Hospital Lawas
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                72-Hour Timeout mandatori bagi semua antibiotik spektrum luas (Broad-Spectrum). Rujuk pakar bagi antibiotik 'Access, Watch, Reserve (AWaRe)'.
              </p>
            </div>
          </div>
        </div>
      </div>`;

  if (amsBannerRegex.test(content)) {
    content = content.replace(amsBannerRegex, appleAmsReplacement);
    console.log('✓ Replaced AntimicrobialGuidelinePage AMS banner with Apple HIG frosted card');
  } else {
    console.warn('! AMS banner regex did not match');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

// 2. DrugAlternativesPage.tsx
function transformDrugAlternatives() {
  const filePath = 'src/modules/myformulari/pages/DrugAlternativesPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove top stripe
  content = content.replace(
    /<div className="absolute top-0 left-0 w-full h-1\.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600" \/>\s*/g,
    ''
  );

  // Header styling
  content = content.replace(
    'rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden',
    'rounded-2xl p-6 shadow-xs relative overflow-hidden'
  );
  content = content.replace(
    'p-3.5 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl shadow-lg flex-shrink-0',
    'w-11 h-11 bg-accent-subtle border border-accent-base/20 text-accent-base rounded-xl flex items-center justify-center shrink-0'
  );

  // Lawas Supply Disruption Notice Banner -> Apple HIG Frosted Card
  const disruptionBannerRegex = /<div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">[\s\S]*?<\/div>\s*<\/div>/;
  const appleDisruptionReplacement = `<div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Pusat Pemantauan Logistik &amp; Gangguan Bekalan Hospital Lawas</span>
                </span>
              </div>
              <span className="text-[10px] text-text-muted bg-subtle px-2.5 py-0.5 rounded-full border border-border-default self-start sm:self-auto font-medium">
                Hospital Lawas &bull; Ubat &amp; Bukan Ubat
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
                Daftar Gangguan Bekalan Semasa &amp; Protokol Penukaran Item Alternatif
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-4xl">
                Modul ini digunakan oleh Pegawai Farmasi dan Pengurusan Stor Hospital Lawas untuk memantau sebarang gangguan bekalan aktif (ubat farmaseutikal mahupun bahan pakai buang/bukan ubat), tarikh anggaran bekalan kembali stabil (ETA), serta mengesyorkan alternatif terapeutik atau fungsi setaraf yang sedia ada di fasiliti.
              </p>
            </div>
          </div>`;

  if (disruptionBannerRegex.test(content)) {
    content = content.replace(disruptionBannerRegex, appleDisruptionReplacement);
    console.log('✓ Replaced DrugAlternativesPage disruption banner with Apple HIG frosted card');
  } else {
    console.warn('! Disruption banner regex did not match');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

transformAntimicrobial();
transformDrugAlternatives();
console.log('--- Harmonization of Remaining Pages Complete ---');
