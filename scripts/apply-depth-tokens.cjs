const fs = require('fs');
const path = require('path');

// 1. Update src/index.css
const cssPath = path.join(__dirname, '..', 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

const lightTokens = `    /* Modern Depth — Clinical Light Theme */
    --bg-canvas: #f8fafc;
    --bg-surface: #ffffff;
    --bg-elevated: #f1f5f9;
    --bg-subtle: #f1f5f9;
    --bg-muted: #e2e8f0;
    --bg-inset: #f8fafc;
    --bg-hover: #f1f5f9;

    --border-default: rgba(15, 23, 42, 0.08);
    --border-subtle: rgba(15, 23, 42, 0.04);
    --border-strong: rgba(15, 23, 42, 0.16);
    --border-interactive: rgba(14, 165, 233, 0.35);

    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --text-disabled: #94a3b8;

    --accent-base: #0ea5e9;
    --accent-hover: #0284c7;
    --accent-active: #0369a1;
    --accent-subtle: rgba(14, 165, 233, 0.08);
    --accent-foreground: #ffffff;
    --accent-teal: #0d9488;
    --accent-decor: #0ea5e9;

    --ink-button: #0f172a;
    --ink-button-hover: #1e293b;
    --ink-button-text: #ffffff;

    --elevation-1: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
    --elevation-2: 0 4px 14px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
    --elevation-3: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06);
    --shadow-card-3d: 0 10px 28px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.06);`;

const darkTokens = `  .dark,
  [data-theme="dark"] {
    /* Modern Depth — Clinical Dark Theme (Navy/Slate Foundation) */
    --bg-canvas: #070b14;
    --bg-surface: #0f172a;
    --bg-elevated: #1e293b;
    --bg-subtle: #1e293b;
    --bg-muted: #334155;
    --bg-inset: #090e1a;
    --bg-hover: #1e293b;

    --border-default: rgba(255, 255, 255, 0.08);
    --border-subtle: rgba(255, 255, 255, 0.04);
    --border-strong: rgba(255, 255, 255, 0.16);
    --border-interactive: rgba(56, 189, 248, 0.35);

    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --text-disabled: #475569;

    --accent-base: #38bdf8;
    --accent-hover: #0ea5e9;
    --accent-active: #0284c7;
    --accent-subtle: rgba(56, 189, 248, 0.12);
    --accent-foreground: #070b14;
    --accent-teal: #2dd4bf;
    --accent-decor: #38bdf8;

    --ink-button: #f8fafc;
    --ink-button-hover: #ffffff;
    --ink-button-text: #0f172a;

    --elevation-1: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3);
    --elevation-2: 0 4px 16px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4);
    --elevation-3: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    --shadow-card-3d: 0 12px 32px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08);
  }`;

// Replace light theme tokens block
css = css.replace(
  /\/\* Light Theme — Apple Cupertino Classic \*\/[\s\S]*?--ink-button-text: #ffffff;\n\s*\}/,
  `${lightTokens}\n  }`
);

// Replace dark theme tokens block
css = css.replace(
  /\.dark \{[\s\S]*?\/\* Dark Theme — Apple Dark Mode \(macOS \/ iOS\) \*\/[\s\S]*?--ink-button-text: #1c1c1e;\n\s*\}/,
  darkTokens
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('✓ Updated src/index.css tokens');

// 2. Update tailwind.config.js
const twPath = path.join(__dirname, '..', 'tailwind.config.js');
let tw = fs.readFileSync(twPath, 'utf8');

if (!tw.includes("'elevated': 'var(--bg-elevated)'")) {
  tw = tw.replace(
    "surface: 'var(--bg-surface)',",
    "surface: 'var(--bg-surface)',\n        elevated: 'var(--bg-elevated)',\n        'accent-teal': 'var(--accent-teal)',\n        'border-interactive': 'var(--border-interactive)',"
  );
}

if (!tw.includes("'card-3d': 'var(--shadow-card-3d)'")) {
  tw = tw.replace(
    "boxShadow: {",
    "boxShadow: {\n        'elevation-1': 'var(--elevation-1)',\n        'elevation-2': 'var(--elevation-2)',\n        'elevation-3': 'var(--elevation-3)',\n        'card-3d': 'var(--shadow-card-3d)',\n        'depth-glow': '0 0 24px -4px rgba(14, 165, 233, 0.25)',"
  );
}

fs.writeFileSync(twPath, tw, 'utf8');
console.log('✓ Updated tailwind.config.js tokens');
