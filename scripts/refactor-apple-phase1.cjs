const fs = require('fs');
const path = require('path');

console.log('=== Starting Apple Cupertino Design System Phase 1 Refactor ===');

// ==========================================
// 1. UPDATE src/index.css DESIGN TOKENS
// ==========================================
function updateIndexCss() {
  const filePath = 'src/index.css';
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Light Theme tokens
  const lightTokensTarget = /\/\* Light Theme[^\*]*\*\/\s*--bg-canvas: [^;]+;\s*--bg-surface: [^;]+;\s*--bg-subtle: [^;]+;\s*--bg-muted: [^;]+;\s*--bg-inset: [^;]+;\s*--bg-hover: [^;]+;\s*--border-default: [^;]+;\s*--border-subtle: [^;]+;\s*--border-strong: [^;]+;\s*--text-primary: [^;]+;\s*--text-secondary: [^;]+;\s*--text-muted: [^;]+;\s*--text-disabled: [^;]+;\s*--accent-base: [^;]+;\s*--accent-hover: [^;]+;\s*--accent-active: [^;]+;\s*--accent-subtle: [^;]+;\s*--accent-foreground: [^;]+;\s*--accent-decor: [^;]+;\s*--ink-button: [^;]+;\s*--ink-button-hover: [^;]+;\s*--ink-button-text: [^;]+;/;

  const appleLightTokens = `/* Light Theme — Apple Cupertino Classic */
    --bg-canvas: #f5f5f7;
    --bg-surface: #ffffff;
    --bg-subtle: #f0f0f2;
    --bg-muted: #e5e5ea;
    --bg-inset: #f2f2f7;
    --bg-hover: #ebebed;

    --border-default: rgba(0, 0, 0, 0.08);
    --border-subtle: rgba(0, 0, 0, 0.04);
    --border-strong: rgba(0, 0, 0, 0.16);

    --text-primary: #1d1d1f;
    --text-secondary: #424245;
    --text-muted: #86868b;
    --text-disabled: #aeaeb2;

    --accent-base: #0071e3;
    --accent-hover: #0077ed;
    --accent-active: #0062c4;
    --accent-subtle: rgba(0, 113, 227, 0.08);
    --accent-foreground: #ffffff;
    --accent-decor: #2997ff;

    --ink-button: #1d1d1f;
    --ink-button-hover: #333336;
    --ink-button-text: #ffffff;`;

  // Replace Dark Theme tokens
  const darkTokensTarget = /\/\* Dark Theme[^\*]*\*\/\s*--bg-canvas: [^;]+;\s*--bg-surface: [^;]+;\s*--bg-subtle: [^;]+;\s*--bg-muted: [^;]+;\s*--bg-inset: [^;]+;\s*--bg-hover: [^;]+;\s*--border-default: [^;]+;\s*--border-subtle: [^;]+;\s*--border-strong: [^;]+;\s*--text-primary: [^;]+;\s*--text-secondary: [^;]+;\s*--text-muted: [^;]+;\s*--text-disabled: [^;]+;\s*--accent-base: [^;]+;\s*--accent-hover: [^;]+;\s*--accent-active: [^;]+;\s*--accent-subtle: [^;]+;\s*--accent-foreground: [^;]+;\s*--accent-decor: [^;]+;\s*--ink-button: [^;]+;\s*--ink-button-hover: [^;]+;\s*--ink-button-text: [^;]+;/;

  const appleDarkTokens = `/* Dark Theme — Apple Dark Mode (macOS / iOS) */
    --bg-canvas: #000000;
    --bg-surface: #1c1c1e;
    --bg-subtle: #2c2c2e;
    --bg-muted: #3a3a3c;
    --bg-inset: #161618;
    --bg-hover: #2c2c2e;

    --border-default: rgba(255, 255, 255, 0.12);
    --border-subtle: rgba(255, 255, 255, 0.06);
    --border-strong: rgba(255, 255, 255, 0.2);

    --text-primary: #f5f5f7;
    --text-secondary: #a1a1a6;
    --text-muted: #86868b;
    --text-disabled: #636366;

    --accent-base: #2997ff;
    --accent-hover: #40a9ff;
    --accent-active: #0071e3;
    --accent-subtle: rgba(41, 151, 255, 0.16);
    --accent-foreground: #ffffff;
    --accent-decor: #2997ff;

    --ink-button: #f5f5f7;
    --ink-button-hover: #ffffff;
    --ink-button-text: #1c1c1e;`;

  if (lightTokensTarget.test(content)) {
    content = content.replace(lightTokensTarget, appleLightTokens);
  }
  if (darkTokensTarget.test(content)) {
    content = content.replace(darkTokensTarget, appleDarkTokens);
  }

  // Ensure Apple font stack in body
  content = content.replace(
    /@apply font-sans antialiased bg-canvas;/,
    '@apply font-sans antialiased bg-canvas text-text-primary;'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ src/index.css updated with Apple Cupertino tokens');
}

// ==========================================
// 2. UPDATE tailwind.config.js FONTS & COLORS
// ==========================================
function updateTailwindConfig() {
  const filePath = 'tailwind.config.js';
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Set Apple fonts stack first
  content = content.replace(
    /sans: \[[^\]]+\],/,
    "sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],"
  );

  // Set Apple Blue primary scale
  const primaryScaleRegex = /primary: \{\s*50: '[^']+',\s*100: '[^']+',\s*200: '[^']+',\s*300: '[^']+',\s*400: '[^']+',\s*500: '[^']+',\s*600: '[^']+',\s*700: '[^']+',\s*800: '[^']+',\s*900: '[^']+',\s*950: '[^']+',\s*\}/;

  const applePrimaryScale = `primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2997FF',
          600: '#0071E3',
          700: '#0077ED',
          800: '#0062C4',
          900: '#004F9E',
          950: '#002B57',
        }`;

  if (primaryScaleRegex.test(content)) {
    content = content.replace(primaryScaleRegex, applePrimaryScale);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ tailwind.config.js updated with Apple typography and primary scale');
}

// ==========================================
// 3. UPDATE MainLayout.tsx & ModulePageHeader.tsx
// ==========================================
function updateLayoutShell() {
  // MainLayout.tsx
  const mainLayoutPath = 'src/shared/components/layout/MainLayout.tsx';
  if (fs.existsSync(mainLayoutPath)) {
    let content = fs.readFileSync(mainLayoutPath, 'utf8');
    content = content.replace(/selection:bg-teal-500\/20 selection:text-teal-800 dark:selection:text-teal-300/g, 'selection:bg-accent-base/20 selection:text-accent-base');
    content = content.replace(/border-teal-500\/20 border-t-teal-600/g, 'border-accent-base/20 border-t-accent-base');
    fs.writeFileSync(mainLayoutPath, content, 'utf8');
    console.log('✓ MainLayout.tsx modernized for Apple theme');
  }

  // ModulePageHeader.tsx
  const headerPath = 'src/shared/components/ui/ModulePageHeader.tsx';
  if (fs.existsSync(headerPath)) {
    let content = fs.readFileSync(headerPath, 'utf8');
    content = content.replace(/rounded-xl bg-surface border border-border-default shadow-2xs/g, 'rounded-2xl bg-surface border border-border-default shadow-soft');
    content = content.replace(/p-2\.5 sm:p-3 rounded-lg bg-accent-subtle text-accent-base/g, 'p-2.5 sm:p-3 rounded-xl bg-accent-subtle text-accent-base');
    content = content.replace(/px-2 py-0\.5 rounded-md text-\[10px\]/g, 'px-2.5 py-0.5 rounded-full text-[10px]');
    fs.writeFileSync(headerPath, content, 'utf8');
    console.log('✓ ModulePageHeader.tsx upgraded to Apple rounded-2xl & soft shadows');
  }
}

// ==========================================
// 4. UPDATE Header.tsx & Sidebar.tsx
// ==========================================
function updateHeaderAndSidebar() {
  // Header.tsx
  const headerFile = 'src/shared/components/layout/Header.tsx';
  if (fs.existsSync(headerFile)) {
    let content = fs.readFileSync(headerFile, 'utf8');
    // Upgrade header backdrop blur to Apple HIG standard
    content = content.replace('bg-surface/90 backdrop-blur-md', 'bg-surface/80 backdrop-blur-xl');
    // Upgrade button interactions
    content = content.replace(/rounded-lg transition-colors duration-150 flex-shrink-0/g, 'rounded-xl transition-all duration-150 active:scale-[0.98] flex-shrink-0');
    // Upgrade module pill to Apple pill
    content = content.replace('rounded-md text-xs font-semibold bg-accent-subtle', 'rounded-full text-xs font-semibold bg-accent-subtle');
    content = content.replace('rounded-md text-[10px] font-medium bg-accent-subtle', 'rounded-full text-[10px] font-medium bg-accent-subtle');
    fs.writeFileSync(headerFile, content, 'utf8');
    console.log('✓ Header.tsx upgraded with Apple frosted glass & pills');
  }

  // Sidebar.tsx
  const sidebarFile = 'src/shared/components/layout/Sidebar.tsx';
  if (fs.existsSync(sidebarFile)) {
    let content = fs.readFileSync(sidebarFile, 'utf8');
    content = content.replace('bg-surface/95 backdrop-blur-md', 'bg-surface/80 backdrop-blur-xl');
    content = content.replace('bg-surface border-r border-border-default', 'bg-surface/90 backdrop-blur-xl border-r border-border-default');
    // Smooth out sidebar navigation items
    content = content.replace(/rounded-lg text-xs font-medium transition-colors/g, 'rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.98]');
    fs.writeFileSync(sidebarFile, content, 'utf8');
    console.log('✓ Sidebar.tsx upgraded with Apple frosted glass & tactile items');
  }
}

// ==========================================
// 5. UPDATE LoginPage.tsx
// ==========================================
function updateLoginPage() {
  const filePath = 'src/modules/auth/pages/LoginPage.tsx';
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace serif headline with Apple SF Pro bold typography
  content = content.replace(
    /<h2 className="font-serif text-4xl xl:text-5xl 2xl:text-6xl font-normal tracking-tight text-text-primary leading-\[1\.14\]">\s*Welcome back to <span className="italic font-normal">MyHome<\/span> Ecosystem\.\s*<\/h2>/,
    `<h2 className="font-sans text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight text-text-primary leading-[1.12]">
            Healthcare Operations, <span className="text-accent-base">Reimagined.</span>
          </h2>`
  );

  // Modernize mobile header headline
  content = content.replace(
    /<h1 className="font-serif text-lg font-normal text-text-primary tracking-tight mt-0\.5">\s*Hospital Operation Management Ecosystem\s*<\/h1>/,
    `<h1 className="font-sans text-lg font-bold text-text-primary tracking-tight mt-0.5">
              H.O.M.E. Ecosystem
            </h1>`
  );

  // Upgrade badges to Apple rounded-full
  content = content.replace(
    'inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-accent-subtle',
    'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle'
  );

  // Modernize stat counters
  content = content.replace(
    /font-mono tracking-tight text-text-primary/g,
    'font-sans tabular-nums font-bold tracking-tight text-text-primary'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ LoginPage.tsx modernized to Apple Cupertino style');
}

// ==========================================
// 6. UPDATE ModuleHubPage.tsx
// ==========================================
function updateModuleHubPage() {
  const filePath = 'src/modules/hub/pages/ModuleHubPage.tsx';
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace greeting font-serif with Apple bold typography
  content = content.replace(
    /<h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary tracking-tight leading-tight">/,
    '<h2 className="font-sans text-3xl sm:text-4xl font-bold text-text-primary tracking-tight leading-tight">'
  );

  // Executive greeting card styling -> Apple rounded-2xl
  content = content.replace(
    /rounded-xl p-4 sm:p-5 shadow-2xs transition-colors duration-150/,
    'rounded-2xl p-5 sm:p-6 shadow-soft transition-colors duration-150'
  );

  // Category segmented control -> Apple pill styling
  content = content.replace(
    /rounded-lg p-0\.5 overflow-x-auto scrollbar-none/g,
    'rounded-full p-1 overflow-x-auto scrollbar-none bg-subtle/80 backdrop-blur-md'
  );
  content = content.replace(
    /px-3 py-1\.5 rounded-md text-xs font-medium transition-colors/g,
    'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150'
  );

  // ModuleCard component -> Apple rounded-2xl card with tactile press
  content = content.replace(
    /rounded-xl bg-surface hover:bg-surface-hover active:bg-surface-subtle border border-border-default hover:border-border-strong hover:shadow-xs transition-colors duration-150 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base shadow-2xs relative overflow-hidden/,
    'rounded-2xl bg-surface hover:bg-surface-hover active:scale-[0.98] border border-border-default hover:border-border-strong hover:shadow-soft transition-all duration-150 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base shadow-soft relative overflow-hidden'
  );

  // App icon styling on mobile
  content = content.replace(
    /rounded-xl bg-surface border \$\{style\.border\} \$\{style\.bg\} flex items-center justify-center shadow-2xs group-active:border-accent-base\/50 transition-colors/,
    'rounded-2xl bg-surface border ${style.border} ${style.bg} flex items-center justify-center shadow-soft group-active:scale-95 transition-all'
  );

  // List view item styling
  content = content.replace(
    /rounded-xl overflow-hidden divide-y divide-border-default shadow-2xs/,
    'rounded-2xl overflow-hidden divide-y divide-border-default shadow-soft'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ ModuleHubPage.tsx transformed with Apple App Store card aesthetics');
}

// Run all refactor functions
updateIndexCss();
updateTailwindConfig();
updateLayoutShell();
updateHeaderAndSidebar();
updateLoginPage();
updateModuleHubPage();

console.log('=== All Phase 1 Apple Transformations Complete ===');
