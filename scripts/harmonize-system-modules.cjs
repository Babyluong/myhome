// scripts/harmonize-system-modules.cjs
// Harmonizes styling and color tokens across remaining modules in H.O.M.E. ecosystem

const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { from, to, desc } of replacements) {
    if (typeof from === 'string') {
      if (!content.includes(from)) {
        console.warn(`[WARN] In ${path.basename(filePath)}: Could not find snippet for "${desc}"`);
      } else {
        content = content.replace(from, to);
        console.log(`[OK] In ${path.basename(filePath)}: Replaced "${desc}"`);
      }
    } else if (from instanceof RegExp) {
      if (!from.test(content)) {
        console.warn(`[WARN] In ${path.basename(filePath)}: Regex did not match for "${desc}"`);
      } else {
        content = content.replace(from, to);
        console.log(`[OK] In ${path.basename(filePath)}: Replaced regex "${desc}"`);
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[SAVED] ${filePath}`);
  } else {
    console.log(`[NO CHANGES] ${filePath}`);
  }
}

// --------------------------------------------------------------------------
// 1. UserListPage.tsx
// --------------------------------------------------------------------------
const userListPath = path.join(__dirname, '..', 'src', 'modules', 'admin', 'pages', 'users', 'UserListPage.tsx');
if (fs.existsSync(userListPath)) {
  let userListContent = fs.readFileSync(userListPath, 'utf8');

  // Add ModulePageHeader import if not present
  if (!userListContent.includes("import { ModulePageHeader }")) {
    userListContent = userListContent.replace(
      /import { formatDate, cn } from '@\/lib\/utils'/,
      `import { formatDate, cn } from '@/lib/utils'\nimport { ModulePageHeader } from '@/shared/components/ui/ModulePageHeader'`
    );
  }

  // Replace Header Gradient
  const headerGradientRegex = /\{\/\* Header with Gradient \*\/\}[\s\S]*?<\/motion\.div>\s*(?=\{\/\* Statistics Cards)/;
  const newHeader = `{/* Module Page Header */}
      <ModulePageHeader
        badge="CENTRAL ADMINISTRATION"
        title="User Management"
        description="Manage hospital system users, roles, organizational units, and access permissions."
        icon={<Users className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={isLoading}
              className="border-border-default text-text-secondary hover:bg-subtle text-xs"
              leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(\`\${ROUTES.ADMIN_USERS}/new\`)}
              className="bg-accent-base hover:bg-accent-dark text-white font-semibold text-xs shadow-xs"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New User
            </Button>
          </div>
        }
      />\n\n      `;

  userListContent = userListContent.replace(headerGradientRegex, newHeader);

  // Replace stat cards container
  userListContent = userListContent.replace(
    /className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow"/g,
    'className="bg-surface rounded-xl border border-border-default shadow-xs p-4 transition-all"'
  );

  // Replace stat card values and labels
  userListContent = userListContent.replace(/text-slate-900(?=<\/p>)/g, 'text-text-primary');
  userListContent = userListContent.replace(/text-slate-600(?=<\/p>)/g, 'text-text-muted');

  // Replace stat card icons
  userListContent = userListContent.replace(/bg-success-100 rounded-lg flex items-center justify-center/g, 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center');
  userListContent = userListContent.replace(/bg-slate-100 rounded-lg flex items-center justify-center/g, 'bg-subtle text-text-muted rounded-lg flex items-center justify-center');
  userListContent = userListContent.replace(/bg-error-100 rounded-lg flex items-center justify-center/g, 'bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center');
  userListContent = userListContent.replace(/bg-amber-100 rounded-lg flex items-center justify-center/g, 'bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center');
  userListContent = userListContent.replace(/bg-primary-100 rounded-lg flex items-center justify-center/g, 'bg-accent-base/10 text-accent-base rounded-lg flex items-center justify-center');

  // Replace Filters card
  userListContent = userListContent.replace(
    /className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"/,
    'className="bg-surface rounded-xl border border-border-default shadow-xs p-5"'
  );

  // Replace Bulk Actions
  userListContent = userListContent.replace(
    /className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between shadow-sm"/,
    'className="bg-subtle border border-border-default rounded-xl p-4 flex items-center justify-between shadow-xs"'
  );

  // Replace Table container and header
  userListContent = userListContent.replace(
    /className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"/,
    'className="bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden"'
  );
  userListContent = userListContent.replace(
    /className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white"/,
    'className="p-4 sm:p-5 border-b border-border-default bg-subtle/40"'
  );
  userListContent = userListContent.replace(
    /className="border-t border-slate-200 bg-slate-50\/50"/,
    'className="border-t border-border-default bg-subtle/30"'
  );

  fs.writeFileSync(userListPath, userListContent, 'utf8');
  console.log('[SAVED] UserListPage.tsx');
}

// --------------------------------------------------------------------------
// 2. MyAdminDashboard.tsx
// --------------------------------------------------------------------------
const myAdminPath = path.join(__dirname, '..', 'src', 'modules', 'hub', 'pages', 'modules', 'admin', 'MyAdminDashboard.tsx');
if (fs.existsSync(myAdminPath)) {
  let myAdminContent = fs.readFileSync(myAdminPath, 'utf8');

  myAdminContent = myAdminContent.replace('text-slate-100', 'text-text-primary');
  myAdminContent = myAdminContent.replace(
    'className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80"',
    'className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-default"'
  );
  myAdminContent = myAdminContent.replace(
    'className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 flex-shrink-0 shadow-sm"',
    'className="w-11 h-11 rounded-xl bg-surface border border-border-default flex items-center justify-center text-accent-base flex-shrink-0 shadow-xs"'
  );
  myAdminContent = myAdminContent.replace(
    '<h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">MyAdmin</h1>',
    '<h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">MyAdmin</h1>'
  );
  myAdminContent = myAdminContent.replace(
    'className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-teal-400 border border-slate-700 uppercase tracking-wide"',
    'className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent-base/10 text-accent-base border border-accent-base/20 uppercase tracking-wide"'
  );
  myAdminContent = myAdminContent.replace(
    'className="text-slate-400 text-xs sm:text-sm mt-0.5"',
    'className="text-text-muted text-xs sm:text-sm mt-0.5"'
  );
  myAdminContent = myAdminContent.replace(
    'className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold bg-slate-900 text-teal-400 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"',
    'className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold bg-surface text-accent-base border border-border-default hover:bg-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base/50"'
  );
  myAdminContent = myAdminContent.replace(
    'className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-medium"',
    'className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-surface border border-border-default text-xs text-text-secondary font-medium"'
  );
  myAdminContent = myAdminContent.replace(
    'border-b border-slate-800 flex overflow-x-auto',
    'border-b border-border-default flex overflow-x-auto'
  );
  myAdminContent = myAdminContent.replace(
    `isActive
                    ? 'text-white bg-slate-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'`,
    `isActive
                    ? 'text-accent-base bg-surface font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-primary hover:bg-subtle/50'`
  );
  myAdminContent = myAdminContent.replace(
    'bg-teal-400',
    'bg-accent-base'
  );
  myAdminContent = myAdminContent.replace(
    'text-teal-400',
    'text-accent-base'
  );

  fs.writeFileSync(myAdminPath, myAdminContent, 'utf8');
  console.log('[SAVED] MyAdminDashboard.tsx');
}

// --------------------------------------------------------------------------
// 3. InventoryOverviewPage.tsx
// --------------------------------------------------------------------------
const invOverviewPath = path.join(__dirname, '..', 'src', 'modules', 'inventory', 'pages', 'inventory', 'InventoryOverviewPage.tsx');
if (fs.existsSync(invOverviewPath)) {
  let invContent = fs.readFileSync(invOverviewPath, 'utf8');

  if (!invContent.includes("import { ModulePageHeader }")) {
    invContent = invContent.replace(
      /import { Table, Spinner, Input, Badge, Button } from '@\/components\/ui'/,
      `import { Table, Spinner, Input, Badge, Button } from '@/components/ui'\nimport { ModulePageHeader } from '@/shared/components/ui/ModulePageHeader'`
    );
  }

  // Root container
  invContent = invContent.replace(
    'className="p-6 md:p-8 space-y-8 text-slate-800"',
    'className="w-full space-y-6 text-text-primary"'
  );

  // Replace Luxury Executive Header Banner with ModulePageHeader
  const headerBannerRegex = /\{\/\* LUXURY EXECUTIVE HEADER BANNER \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*(?=\{\/\* Metrics Grid)/;
  const newInvHeader = `{/* Standard Module Header */}
      <ModulePageHeader
        badge={language === 'ms' ? 'EKOSISTEM INVENTORI KKM' : 'MOH INVENTORY ECOSYSTEM'}
        title={language === 'ms' ? 'Inventori Stor Farmasi' : 'Pharmacy Store Inventory'}
        description={
          language === 'ms'
            ? 'Paparan ekosistem inventori masa-nyata bagi bekalan ubat dan bukan ubat mengikut standard Tatacara Pengurusan Stor KKM.'
            : 'Real-time inventory ecosystem view for drug and non-drug supplies following MOH Store Management Procedures standards.'
        }
        icon={<Package className="w-5 h-5 text-accent-base" />}
        actions={
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <StoreLocationSelector />
            <Button
              onClick={() => navigate('/pharmacy/inventory/ledger?openScan=true')}
              className="bg-accent-base hover:bg-accent-dark text-white rounded-lg font-semibold text-xs gap-1.5 px-3.5 py-2 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              {language === 'ms' ? 'Imbas & Transaksi QR' : 'QR Scan & Transaction'}
            </Button>
            {isLogisticsUser ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pharmacy/inventory/drugs')}
                  className="rounded-lg border-border-default text-text-secondary hover:bg-subtle font-semibold text-xs px-3 py-2"
                >
                  {language === 'ms' ? 'Katalog Ubat' : 'Drug Catalog'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pharmacy/inventory/non-drugs')}
                  className="rounded-lg border-border-default text-text-secondary hover:bg-subtle font-semibold text-xs px-3 py-2"
                >
                  {language === 'ms' ? 'Bukan Ubat' : 'Non-Drug'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pharmacy/inventory/facility-drugs')}
                  className="rounded-lg border-border-default text-text-secondary hover:bg-subtle font-semibold text-xs px-3 py-2"
                >
                  {language === 'ms' ? 'Inventori Ubat' : 'Facility Drugs'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pharmacy/inventory/facility-non-drugs')}
                  className="rounded-lg border-border-default text-text-secondary hover:bg-subtle font-semibold text-xs px-3 py-2"
                >
                  {language === 'ms' ? 'Inventori Bukan Ubat' : 'Facility Non-Drugs'}
                </Button>
              </>
            )}
          </div>
        }
      />\n\n      `;
  invContent = invContent.replace(headerBannerRegex, newInvHeader);

  // Replace Metrics cards
  invContent = invContent.replace(
    /className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm border-l-4 border-l-slate-500 flex items-center justify-between"/,
    'className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between"'
  );
  invContent = invContent.replace(
    /className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm border-l-4 border-l-orange-500 flex items-center justify-between"/,
    'className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between"'
  );
  invContent = invContent.replace(
    /className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm border-l-4 border-l-amber-500 flex items-center justify-between"/,
    'className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between"'
  );
  invContent = invContent.replace(
    /className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm border-l-4 border-l-indigo-500 flex items-center justify-between"/,
    'className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between"'
  );
  invContent = invContent.replace(
    /className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm border-l-4 border-l-teal-500 flex items-center justify-between"/,
    'className="bg-surface border border-border-default rounded-xl p-4 shadow-xs flex items-center justify-between"'
  );

  // Replace Metrics labels & values
  invContent = invContent.replace(/text-slate-400 uppercase tracking-wider block/g, 'text-text-muted uppercase tracking-wider block');
  invContent = invContent.replace(/text-2xl font-black text-slate-800/g, 'text-2xl font-bold text-text-primary');

  // Replace Left & Right cards
  invContent = invContent.replace(
    'className="bg-white border border-slate-100 rounded-3xl shadow-soft p-6 space-y-6"',
    'className="bg-surface border border-border-default rounded-xl shadow-xs p-5 sm:p-6 space-y-5"'
  );
  invContent = invContent.replace(
    'border-b border-slate-50 pb-5',
    'border-b border-border-default pb-4'
  );
  invContent = invContent.replace(
    'font-black text-slate-800 text-lg flex items-center gap-2',
    'font-bold text-text-primary text-base flex items-center gap-2'
  );

  // Filter tabs
  invContent = invContent.replace(
    `activeTab === tab.id 
                      ? 'bg-slate-800 border-slate-800 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-100'`,
    `activeTab === tab.id 
                      ? 'bg-accent-base border-accent-base text-white shadow-xs' 
                      : 'bg-subtle hover:bg-subtle/80 text-text-secondary border-border-default'`
  );

  // Table wrapper
  invContent = invContent.replace(
    'className="border border-slate-100 rounded-2xl overflow-hidden"',
    'className="border border-border-default rounded-xl overflow-hidden"'
  );
  invContent = invContent.replace(
    'className="bg-slate-50/50"',
    'className="bg-subtle/50 border-b border-border-default"'
  );
  invContent = invContent.replace(
    /className="text-slate-500 font-bold text-xs py-3.5"/g,
    'className="text-text-muted font-semibold text-xs py-3"'
  );
  invContent = invContent.replace(
    'className="divide-y divide-slate-100"',
    'className="divide-y divide-border-default"'
  );
  invContent = invContent.replace(
    'hover:bg-slate-50/30 transition-colors',
    'hover:bg-subtle/30 transition-colors'
  );

  // Mobile list
  invContent = invContent.replace(
    'className="md:hidden divide-y divide-slate-100 bg-white"',
    'className="md:hidden divide-y divide-border-default bg-surface"'
  );

  // Purchase Suggestions Card (Right)
  invContent = invContent.replace(
    'className="bg-gradient-to-br from-white to-slate-50 border border-slate-150 rounded-3xl shadow-md p-5 space-y-4 relative overflow-hidden"',
    'className="bg-surface border border-border-default rounded-xl shadow-xs p-5 space-y-4 relative overflow-hidden"'
  );
  // remove rainbow top stripe
  invContent = invContent.replace(
    '<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />',
    ''
  );
  invContent = invContent.replace(
    'font-black text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3',
    'font-bold text-text-primary text-sm flex items-center gap-2 border-b border-border-default pb-3'
  );
  invContent = invContent.replace(
    /className="bg-white border border-slate-100 rounded-2xl p-3.5 space-y-2 shadow-soft hover:shadow-md transition-all"/g,
    'className="bg-subtle/30 border border-border-default rounded-lg p-3 space-y-2 transition-all"'
  );

  fs.writeFileSync(invOverviewPath, invContent, 'utf8');
  console.log('[SAVED] InventoryOverviewPage.tsx');
}

// --------------------------------------------------------------------------
// 4. PriviledgingHeader.tsx & PriviledgingDashboardPage.tsx
// --------------------------------------------------------------------------
const privHeaderPath = path.join(__dirname, '..', 'src', 'modules', 'mypriviledging', 'components', 'PriviledgingHeader.tsx');
if (fs.existsSync(privHeaderPath)) {
  let privHContent = fs.readFileSync(privHeaderPath, 'utf8');

  privHContent = privHContent.replace(
    'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-xs',
    'bg-surface border border-border-default rounded-xl p-4 md:p-5 shadow-xs'
  );
  privHContent = privHContent.replace(
    'w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0 shadow-2xs',
    'w-11 h-11 rounded-xl bg-accent-base/10 border border-accent-base/20 flex items-center justify-center text-accent-base shrink-0 shadow-xs'
  );
  privHContent = privHContent.replace(
    'text-slate-900 dark:text-white tracking-tight',
    'text-text-primary tracking-tight'
  );
  privHContent = privHContent.replace(
    'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    'bg-accent-base/10 text-accent-base border border-accent-base/20'
  );
  privHContent = privHContent.replace(
    'text-xs text-slate-500 dark:text-slate-400 mt-0.5',
    'text-xs text-text-muted mt-0.5'
  );
  privHContent = privHContent.replace(
    'bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80',
    'bg-subtle p-1 rounded-lg border border-border-default'
  );
  privHContent = privHContent.replace(
    `!isAdminMode
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-200 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'`,
    `!isAdminMode
                    ? 'bg-surface text-accent-base font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-primary'`
  );
  privHContent = privHContent.replace(
    `isAdminMode
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-200 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'`,
    `isAdminMode
                    ? 'bg-surface text-accent-base font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-primary'`
  );

  fs.writeFileSync(privHeaderPath, privHContent, 'utf8');
  console.log('[SAVED] PriviledgingHeader.tsx');
}

const privDashPath = path.join(__dirname, '..', 'src', 'modules', 'mypriviledging', 'pages', 'PriviledgingDashboardPage.tsx');
if (fs.existsSync(privDashPath)) {
  let privDashContent = fs.readFileSync(privDashPath, 'utf8');

  // Staff Profile Switcher Bar
  privDashContent = privDashContent.replace(
    'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs',
    'bg-surface border border-border-default rounded-xl p-4 mb-6 shadow-xs'
  );
  privDashContent = privDashContent.replace(
    'w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-sm',
    'w-10 h-10 rounded-xl bg-subtle border border-border-default flex items-center justify-center text-text-primary font-bold text-sm'
  );
  privDashContent = privDashContent.replace(
    'text-xs text-slate-500 uppercase font-semibold tracking-wider',
    'text-xs text-text-muted uppercase font-semibold tracking-wider'
  );
  privDashContent = privDashContent.replace(
    'text-sm font-bold text-slate-900 dark:text-white',
    'text-sm font-bold text-text-primary'
  );
  privDashContent = privDashContent.replace(
    'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    'bg-accent-base/10 text-accent-base border border-accent-base/20'
  );
  privDashContent = privDashContent.replace(
    'text-xs text-slate-500 dark:text-slate-400',
    'text-xs text-text-muted'
  );
  privDashContent = privDashContent.replace(
    'px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200',
    'px-3 py-1.5 bg-canvas border border-border-default rounded-lg text-xs font-medium text-text-primary'
  );

  // Quick Action Cards (4 cards)
  privDashContent = privDashContent.replace(
    /className="group p-4 md:p-5 bg-white dark:bg-slate-900 border border-slate-200\/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl cursor-pointer transition-all shadow-xs hover:shadow-sm"/g,
    'className="group p-4 md:p-5 bg-surface border border-border-default hover:border-accent-base/40 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm"'
  );
  privDashContent = privDashContent.replace(
    /text-sm font-bold text-slate-900 dark:text-white/g,
    'text-sm font-bold text-text-primary'
  );
  privDashContent = privDashContent.replace(
    /text-xs text-slate-500 dark:text-slate-400 mt-1/g,
    'text-xs text-text-muted mt-1'
  );
  privDashContent = privDashContent.replace(
    'text-base font-bold text-slate-900 dark:text-white flex items-center gap-2',
    'text-base font-bold text-text-primary flex items-center gap-2'
  );
  privDashContent = privDashContent.replace(
    'text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1',
    'text-xs text-accent-base hover:underline font-semibold flex items-center gap-1'
  );
  privDashContent = privDashContent.replace(
    'w-4 h-4 text-emerald-700 dark:text-emerald-400',
    'w-4 h-4 text-accent-base'
  );

  fs.writeFileSync(privDashPath, privDashContent, 'utf8');
  console.log('[SAVED] PriviledgingDashboardPage.tsx');
}

console.log('[ALL DONE] Modules harmonized.');
