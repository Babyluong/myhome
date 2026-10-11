const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'modules', 'hub', 'pages', 'ModuleHubPage.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

console.log('Transforming ModuleHubPage.tsx...');

// 1. Correct typo: MyPriviledging -> MyPrivileging in module registry
const typoOld = `    id: 'priviledging',
    name: 'MyPriviledging',`;
const typoNew = `    id: 'priviledging',
    name: 'MyPrivileging',`;

if (!content.includes(typoOld)) {
  console.error('Failed to locate typo target');
  process.exit(1);
}
content = content.replace(typoOld, typoNew);

// 2. Compact Executive Shift Greeting Bar
const oldGreetingBlock = `          {/* Executive Shift Greeting & System Quick-Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/90 backdrop-blur-md border border-border-default rounded-2xl p-5 sm:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow duration-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-subtle text-text-secondary border border-border-default text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {user?.hospital?.hospital_name || 'Hospital Lawas'}
                </span>
                <span className="text-xs text-text-muted font-medium">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <h2 className="font-sans text-3xl sm:text-4xl font-bold text-text-primary tracking-tight leading-tight">
                {greeting}, {user?.full_name || 'there'}
              </h2>
            </div>

            {/* Quick Actions & Live System Status */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start sm:self-auto">
              
              {/* System Admin Broadcast Notice Trigger (Restricted to System Admin) */}
              {isSystemAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAdminBroadcastModal(true)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/25 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 min-h-[36px]"
                  title="Broadcast system update or maintenance notification"
                >
                  <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Notice</span>
                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[9px] font-bold uppercase">
                    Admin
                  </span>
                </button>
              )}


              {/* Real Database Active Staff Count */}
              <div className="flex items-center gap-2 bg-surface border border-border-default rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-text-secondary min-h-[36px]">
                <Users className="w-3.5 h-3.5 text-accent-base" />
                <span className="font-bold font-mono text-text-primary">{totalStaffCount !== null ? totalStaffCount : '—'}</span>
                <span className="text-[10px] text-text-muted font-medium uppercase">Staff</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              </div>
            </div>
          </div>`;

const newGreetingBlock = `          {/* Unified Executive Operations Bar (High Clinical Density) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/90 backdrop-blur-md border border-border-default rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-elevation-1">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-subtle text-text-secondary border border-border-default text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user?.hospital?.hospital_name || 'Hospital Lawas'}
              </span>
              <span className="text-xs text-text-muted font-medium hidden xs:inline">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-border-default hidden xs:inline">|</span>
              <h2 className="font-sans text-base sm:text-lg font-bold text-text-primary tracking-tight">
                {greeting}, {user?.full_name || 'there'}
              </h2>
            </div>

            {/* Quick Actions & Staff Count */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {isSystemAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAdminBroadcastModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/25 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-medium transition-colors duration-150 flex items-center gap-1.5"
                  title="Broadcast system update or maintenance notification"
                >
                  <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Notice</span>
                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[9px] font-bold uppercase">
                    Admin
                  </span>
                </button>
              )}

              <div className="flex items-center gap-1.5 bg-subtle border border-border-default rounded-lg px-2.5 py-1 text-xs text-text-secondary">
                <Users className="w-3.5 h-3.5 text-accent-base" />
                <span className="font-bold font-mono text-text-primary">{totalStaffCount !== null ? totalStaffCount : '—'}</span>
                <span className="text-[10px] text-text-muted font-medium uppercase">Staff</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              </div>
            </div>
          </div>`;

if (!content.includes(oldGreetingBlock)) {
  console.error('Failed to locate oldGreetingBlock');
  process.exit(1);
}
content = content.replace(oldGreetingBlock, newGreetingBlock);

// 3. Add Quick Launch calculation hook in ModuleHubPage
const hookTarget = `  const filteredModules = useMemo(() => {`;
const quickLaunchHook = `  // High-frequency quick launch modules for instant muscle-memory access
  const quickLaunchModules = useMemo(() => {
    const quickIds = ['formulari', 'suhu', 'prepacking', 'kunci']
    return quickIds
      .map((id) => MODULES.find((m) => m.id === id))
      .filter(Boolean) as ModuleItem[]
  }, [])

  const filteredModules = useMemo(() => {`;

if (!content.includes(hookTarget)) {
  console.error('Failed to locate hookTarget');
  process.exit(1);
}
content = content.replace(hookTarget, quickLaunchHook);

// 4. Insert Quick Launch strip into grouped view
const groupedTarget = `          ) : viewMode === 'grouped' && selectedCategory === 'all' ? (
            /* Domain Grouped Sections (Tailored with Native App Icons for Phone + Operations Cards for Desktop) */
            <div className="space-y-6 sm:space-y-8">
              
              {/* Group 1: Clinical & Pharmacy */}`;

const groupedWithQuickLaunch = `          ) : viewMode === 'grouped' && selectedCategory === 'all' ? (
            /* Domain Grouped Sections (Tailored with Native App Icons for Phone + Operations Cards for Desktop) */
            <div className="space-y-6 sm:space-y-8">
              
              {/* Quick Launch Strip (High Clinical & Operational Frequency) */}
              {!searchQuery.trim() && (
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border-default/60">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent-base" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Quick Launch
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-accent-subtle text-accent-base">
                        {quickLaunchModules.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted font-medium hidden sm:inline">
                      Frequently accessed clinical &amp; operational tools
                    </span>
                  </div>

                  {/* Mobile: 4-Col App Grid */}
                  <div className="grid grid-cols-4 gap-1 xs:gap-2 sm:hidden">
                    {quickLaunchModules.map((module) => (
                      <ModuleAppIcon key={\`quick-\${module.id}\`} module={module} onClick={() => handleCardClick(module)} />
                    ))}
                  </div>

                  {/* Desktop: Sleek 4-Col Quick Launch Cards */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {quickLaunchModules.map((module) => (
                      <QuickLaunchCard key={\`quick-\${module.id}\`} module={module} onClick={() => handleCardClick(module)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Group 1: Clinical & Pharmacy */}`;

if (!content.includes(groupedTarget)) {
  console.error('Failed to locate groupedTarget');
  process.exit(1);
}
content = content.replace(groupedTarget, groupedWithQuickLaunch);

// 5. Clean List View redundant "Open Module" label
const oldListCta = `                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] font-medium text-text-muted group-hover:text-text-primary transition-colors hidden sm:inline">
                        Open Module
                      </span>
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-colors" />
                    </div>`;

const newListCta = `                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-base group-hover:translate-x-0.5 transition-colors" />
                    </div>`;

if (!content.includes(oldListCta)) {
  console.error('Failed to locate oldListCta');
  process.exit(1);
}
content = content.replace(oldListCta, newListCta);

// 6. Replace ModuleCard with modern depth tactile card + Add QuickLaunchCard
const oldModuleCardBlock = `interface ModuleCardProps {
  module: ModuleItem
  onClick: () => void
  language?: 'ms' | 'en'
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const Icon = module.icon
  const style = ACCENT_STYLES[module.accent] || ACCENT_STYLES.teal

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group flex flex-col justify-between p-4 rounded-2xl bg-surface/95 backdrop-blur-[2px] hover:-translate-y-1 active:scale-[0.98] border border-border-default hover:border-sky-500/35 transition-transform duration-200 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base shadow-elevation-1 hover:shadow-elevation-2 relative overflow-hidden"
    >
      <div>
        {/* Card Header: Icon & Domain Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className={\`w-10 h-10 rounded-lg bg-surface-subtle border \${style.border} \${style.bg} \${style.hoverBorder} flex items-center justify-center shrink-0 transition-colors\`}>
            <Icon className={\`w-5 h-5 \${style.text} group-hover:scale-105 transition-transform duration-150\`} />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-surface-subtle text-text-muted border border-border-default">
              {module.category === 'clinical' ? 'Clinical' : module.category === 'logistics' ? 'Logistics' : 'Admin'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Active Module" />
          </div>
        </div>

        {/* Card Body: Module Name & Description */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent-base transition-colors tracking-tight leading-snug">
            {module.name}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1 min-h-[32px]">
            {module.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Subtle launch action cue */}
      <div className="mt-3.5 pt-2.5 border-t border-border-default flex items-center justify-between text-xs text-text-muted group-hover:text-text-primary transition-colors">
        <span className="font-medium">
          Open Module
        </span>
        <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-text-muted group-hover:text-text-primary" />
      </div>
    </div>
  )
}`;

const newModuleCardBlock = `interface ModuleCardProps {
  module: ModuleItem
  onClick: () => void
  language?: 'ms' | 'en'
}

/**
 * Compact Quick Launch Card (Clinical Top Tier)
 */
const QuickLaunchCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const Icon = module.icon
  const style = ACCENT_STYLES[module.accent] || ACCENT_STYLES.teal

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group flex items-center gap-3 p-3 rounded-xl bg-surface/95 hover:bg-surface-elevated border border-border-default border-t-white/10 dark:border-t-white/15 hover:border-accent-base/40 shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base"
    >
      <div className={\`w-9 h-9 rounded-lg bg-surface-subtle border \${style.border} \${style.bg} \${style.hoverBorder} flex items-center justify-center shrink-0 transition-colors shadow-sm\`}>
        <Icon className={\`w-4.5 h-4.5 \${style.text} group-hover:scale-105 transition-transform duration-150\`} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-text-primary group-hover:text-accent-base transition-colors truncate leading-tight">
          {module.name}
        </h4>
        <p className="text-[11px] text-text-muted truncate mt-0.5">
          {module.shortName || module.description}
        </p>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-text-muted/50 group-hover:text-accent-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
    </div>
  )
}

/**
 * Desktop Structured Operations Card (Modern Depth Standard)
 */
const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const Icon = module.icon
  const style = ACCENT_STYLES[module.accent] || ACCENT_STYLES.teal

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group relative flex flex-col justify-between p-4 rounded-xl bg-surface/95 hover:bg-surface-elevated backdrop-blur-sm border border-border-default border-t-white/10 dark:border-t-white/15 hover:border-accent-base/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base shadow-elevation-1 hover:shadow-elevation-2 overflow-hidden"
    >
      <div>
        {/* Card Header: Icon & Subtle Launch Cue */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={\`w-11 h-11 rounded-xl bg-surface-subtle border \${style.border} \${style.bg} \${style.hoverBorder} flex items-center justify-center shrink-0 transition-all duration-200 shadow-sm\`}>
            <Icon className={\`w-5.5 h-5.5 \${style.text} group-hover:scale-110 transition-transform duration-200\`} />
          </div>

          <div className="w-7 h-7 rounded-lg bg-surface-subtle/80 border border-border-default/60 flex items-center justify-center text-text-muted group-hover:text-accent-base group-hover:border-accent-base/40 group-hover:bg-accent-subtle/30 transition-all duration-200">
            <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Card Body: Module Name & Description */}
        <div>
          <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-base transition-colors tracking-tight leading-snug">
            {module.name}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1.5 min-h-[32px]">
            {module.description}
          </p>
        </div>
      </div>
    </div>
  )
}`;

if (!content.includes(oldModuleCardBlock)) {
  console.error('Failed to locate oldModuleCardBlock');
  process.exit(1);
}
content = content.replace(oldModuleCardBlock, newModuleCardBlock);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully refactored ModuleHubPage.tsx with Modern Depth & Compact Ergonomics!');
