const fs = require('fs');
const path = require('path');

// 1. Restyle LoginPage.tsx
const loginPath = path.join(__dirname, '..', 'src', 'modules', 'auth', 'pages', 'LoginPage.tsx');
let loginCode = fs.readFileSync(loginPath, 'utf8');

// Replace MedicalMesh3D import with LazyHero3D
loginCode = loginCode.replace(
  "import { MedicalMesh3D } from '../components/MedicalMesh3D'",
  "import { LazyHero3D } from '@/components/three/LazyHero3D'"
);

// Replace MedicalMesh3D component usage with LazyHero3D
loginCode = loginCode.replace(
  /<MedicalMesh3D\s*\/>/g,
  '<LazyHero3D />'
);

fs.writeFileSync(loginPath, loginCode, 'utf8');
console.log('✓ Successfully restyled LoginPage.tsx with LazyHero3D');

// 2. Restyle ModuleHubPage.tsx
const hubPath = path.join(__dirname, '..', 'src', 'modules', 'hub', 'pages', 'ModuleHubPage.tsx');
let hubCode = fs.readFileSync(hubPath, 'utf8');

// Add LazyHero3D import if not present
if (!hubCode.includes("import { LazyHero3D }")) {
  hubCode = hubCode.replace(
    "import { CURRENT_SYSTEM_VERSION } from '@/config/systemReleases'",
    "import { CURRENT_SYSTEM_VERSION } from '@/config/systemReleases'\nimport { LazyHero3D } from '@/components/three/LazyHero3D'"
  );
}

// Add LazyHero3D behind background
if (!hubCode.includes('<LazyHero3D />')) {
  hubCode = hubCode.replace(
    '<div className="relative z-10 w-full flex flex-col items-center">',
    '<LazyHero3D />\n      <div className="relative z-10 w-full flex flex-col items-center">'
  );
}

// Upgrade ModuleCard styling to Emil Kowalski 3D Depth
hubCode = hubCode.replace(
  /className="group flex flex-col justify-between p-4 rounded-2xl bg-surface hover:bg-surface-hover active:scale-\[0\.98\] border border-border-default hover:border-border-strong hover:shadow-soft transition-all duration-150 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base shadow-soft relative overflow-hidden"/g,
  'className="group flex flex-col justify-between p-4 rounded-2xl bg-surface/95 backdrop-blur-[2px] hover:-translate-y-1 active:scale-[0.98] border border-border-default hover:border-sky-500/35 transition-transform duration-200 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base shadow-elevation-1 hover:shadow-elevation-2 relative overflow-hidden"'
);

// Upgrade ModuleCompactCard styling
hubCode = hubCode.replace(
  /className="group flex items-center gap-2\.5 p-2\.5 rounded-xl bg-surface hover:bg-surface-hover active:bg-surface-subtle border border-border-default hover:border-border-strong transition-colors cursor-pointer text-left select-none min-h-\[54px\] shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base"/g,
  'className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-surface/95 hover:-translate-y-0.5 active:scale-[0.98] border border-border-default hover:border-sky-500/35 transition-transform duration-200 cursor-pointer text-left select-none min-h-[54px] shadow-elevation-1 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base"'
);

// Upgrade Executive greeting card
hubCode = hubCode.replace(
  'bg-surface border border-border-default rounded-2xl p-5 sm:p-6 shadow-soft transition-colors duration-150',
  'bg-surface/90 backdrop-blur-md border border-border-default rounded-2xl p-5 sm:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow duration-200'
);

// Upgrade Operations toolbar
hubCode = hubCode.replace(
  'bg-surface border border-border-default rounded-xl p-2.5 sm:p-3 shadow-2xs transition-colors duration-150',
  'bg-surface/90 backdrop-blur-md border border-border-default rounded-xl p-2.5 sm:p-3 shadow-elevation-1'
);

fs.writeFileSync(hubPath, hubCode, 'utf8');
console.log('✓ Successfully restyled ModuleHubPage.tsx with 3D Depth & LazyHero3D');
