const fs = require('fs');
const path = require('path');

// 1. Update LoginForm.tsx
const loginFormPath = path.join(__dirname, '..', 'src', 'shared', 'components', 'forms', 'LoginForm.tsx');
let loginFormCode = fs.readFileSync(loginFormPath, 'utf8');

// Replace button styling to use accent design tokens instead of ink
const oldButtonRegex = /className=\{cn\(\s*'w-full h-11 text-sm font-medium rounded-lg transition-colors duration-150',\s*'bg-ink text-ink-text hover:bg-ink-hover disabled:opacity-50 disabled:pointer-events-none',\s*'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',\s*'shadow-elevation-1 active:scale-\[0\.99\] flex items-center justify-center gap-2 cursor-pointer border border-border-default'\s*\)\}/;

const newButtonCode = `className={cn(
            'w-full h-11 text-sm font-semibold rounded-lg transition-all duration-150',
            'bg-accent-base text-accent-foreground hover:bg-accent-hover hover:shadow-elevation-2 active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            'shadow-elevation-1 flex items-center justify-center gap-2 cursor-pointer border border-accent-hover/30',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}`;

if (oldButtonRegex.test(loginFormCode)) {
  loginFormCode = loginFormCode.replace(oldButtonRegex, newButtonCode);
  fs.writeFileSync(loginFormPath, loginFormCode, 'utf8');
  console.log('✓ Successfully updated LoginForm.tsx submit button to clinical accent');
} else {
  console.log('Notice: LoginForm button regex did not match, checking alternative pattern');
  loginFormCode = loginFormCode.replace(
    /'bg-ink text-ink-text hover:bg-ink-hover disabled:opacity-50 disabled:pointer-events-none'/,
    `'bg-accent-base text-accent-foreground hover:bg-accent-hover hover:shadow-elevation-2 disabled:opacity-50 disabled:pointer-events-none'`
  );
  fs.writeFileSync(loginFormPath, loginFormCode, 'utf8');
  console.log('✓ Applied fallback replacement in LoginForm.tsx');
}

// 2. Update LoginPage.tsx
const loginPagePath = path.join(__dirname, '..', 'src', 'modules', 'auth', 'pages', 'LoginPage.tsx');
let loginPageCode = fs.readFileSync(loginPagePath, 'utf8');

// A. Add ambient backdrop lighting
const rootDivTarget = `<div className="min-h-screen flex bg-canvas text-primary relative selection:bg-accent-subtle selection:text-accent-base transition-colors duration-150">`;
const rootDivReplacement = `<div className="min-h-screen flex bg-canvas text-primary relative selection:bg-accent-subtle selection:text-accent-base transition-colors duration-150 overflow-hidden">
      {/* Ambient Clinical Lighting Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] rounded-full bg-accent-base/10 blur-[130px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent-decor/8 blur-[140px]" />
        <div className="absolute top-[35%] left-[35%] w-[35%] h-[35%] rounded-full bg-accent-subtle blur-[160px]" />
      </div>`;

if (loginPageCode.includes(rootDivTarget)) {
  loginPageCode = loginPageCode.replace(rootDivTarget, rootDivReplacement);
}

// B. Upgrade Left Panel Status Badge & Headline
loginPageCode = loginPageCode.replace(
  `<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent-base border border-accent-base/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Integrated Healthcare Operating System</span>
          </div>`,
  `<div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>System Gateway: Operational • 256-Bit Encrypted</span>
          </div>`
);

// C. Upgrade Stat KPI Tiles in Left Panel
const oldStatsTarget = `<div className="grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Facility</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-sans tabular-nums font-bold tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.facilitiesCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Official Registry</span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Registered Staff</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-sans tabular-nums font-bold tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.staffCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Active Accounts</span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Core Modules</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-sans tabular-nums font-bold tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.modulesCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Integrated Services</span>
            </div>
          </div>`;

const newStatsReplacement = `<div className="grid grid-cols-3 gap-3.5 xl:gap-5">
            <div className="p-3.5 xl:p-4 rounded-xl bg-surface/70 dark:bg-surface/50 border border-border-default backdrop-blur-sm shadow-elevation-1">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-accent-base" />
                <span>Facilities</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-sans tabular-nums tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.facilitiesCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Official Registry</span>
            </div>

            <div className="p-3.5 xl:p-4 rounded-xl bg-surface/70 dark:bg-surface/50 border border-border-default backdrop-blur-sm shadow-elevation-1">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1.5">
                <Users className="w-3.5 h-3.5 text-accent-base" />
                <span>Registered Staff</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-sans tabular-nums tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.staffCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Active Accounts</span>
            </div>

            <div className="p-3.5 xl:p-4 rounded-xl bg-surface/70 dark:bg-surface/50 border border-border-default backdrop-blur-sm shadow-elevation-1">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-accent-base" />
                <span>Core Modules</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold font-sans tabular-nums tracking-tight text-text-primary">
                {stats.isLoading ? '...' : (stats.modulesCount ?? '—')}
              </p>
              <span className="text-[11px] text-text-muted">Integrated Services</span>
            </div>
          </div>`;

if (loginPageCode.includes(oldStatsTarget)) {
  loginPageCode = loginPageCode.replace(oldStatsTarget, newStatsReplacement);
}

// D. Upgrade Right Panel Card Container with subtle backdrop depth and top hairline
loginPageCode = loginPageCode.replace(
  `<div className="flex-1 flex flex-col justify-center px-4 sm:px-8 xl:px-12 py-8 max-w-[460px] w-full mx-auto">
          <div className="bg-surface border border-border-default rounded-xl p-6 sm:p-8 shadow-xs">`,
  `<div className="flex-1 flex flex-col justify-center px-4 sm:px-8 xl:px-12 py-8 max-w-[460px] w-full mx-auto relative">
          {/* Subtle Ambient Radial Highlight behind card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-accent-base/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 bg-surface/90 dark:bg-surface/80 backdrop-blur-xl border border-border-default rounded-2xl p-6 sm:p-8 shadow-elevation-2 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-accent-base/60 before:to-transparent">`
);

// E. Add Trust Footnote inside the login card
loginPageCode = loginPageCode.replace(
  `{/* Bottom Actions - Request System Access */}`,
  `{/* Institutional Trust Footnote */}
            <div className="mt-4 pt-3 border-t border-border-default/60 flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-base flex-shrink-0" />
              <span>Protected by MOH Single Sign-On Security Gateway</span>
            </div>

            {/* Bottom Actions - Request System Access */}`
);

fs.writeFileSync(loginPagePath, loginPageCode, 'utf8');
console.log('✓ Successfully restyled LoginPage.tsx with Option A Split-Screen Polish');
