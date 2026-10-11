const fs = require('fs');
const path = require('path');

const isDryRun = process.argv.includes('--dry-run');

const targetDirs = [
  path.join(__dirname, '..', 'src', 'modules'),
  path.join(__dirname, '..', 'src', 'components'),
  path.join(__dirname, '..', 'src', 'pages'),
  path.join(__dirname, '..', 'src', 'shared')
];

function getAllTsxFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllTsxFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = targetDirs.flatMap((d) => getAllTsxFiles(d));

console.log(`[Codemod-Depth] Scanning ${allFiles.length} files across modules and components...`);

const stats = {
  transitionAll: 0,
  shadowSoft: 0,
  shadow2xs: 0,
  hoverShadowLift: 0,
  filesModified: 0,
  moduleCounts: {}
};

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Track module name for ranking
  const relative = path.relative(path.join(__dirname, '..', 'src'), filePath);
  const moduleMatch = relative.match(/modules[\\/]([^\\/]+)/);
  const moduleName = moduleMatch ? moduleMatch[1] : 'shared-ui';

  if (!stats.moduleCounts[moduleName]) {
    stats.moduleCounts[moduleName] = 0;
  }

  // 1. Emil Kowalski motion rule: replace transition-all in interactive elements
  const tMatches = (content.match(/\btransition-all\b/g) || []).length;
  if (tMatches > 0) {
    stats.transitionAll += tMatches;
    stats.moduleCounts[moduleName] += tMatches;
    content = content.replace(/\btransition-all\b/g, 'transition-[transform,opacity,box-shadow,border-color]');
  }

  // 2. Modern Elevation: replace shadow-soft with shadow-elevation-1
  const sSoftMatches = (content.match(/\bshadow-soft\b/g) || []).length;
  if (sSoftMatches > 0) {
    stats.shadowSoft += sSoftMatches;
    stats.moduleCounts[moduleName] += sSoftMatches;
    content = content.replace(/\bshadow-soft\b/g, 'shadow-elevation-1');
  }

  // 3. Modern Elevation: replace shadow-2xs with shadow-elevation-1
  const s2xsMatches = (content.match(/\bshadow-2xs\b/g) || []).length;
  if (s2xsMatches > 0) {
    stats.shadow2xs += s2xsMatches;
    stats.moduleCounts[moduleName] += s2xsMatches;
    content = content.replace(/\bshadow-2xs\b/g, 'shadow-elevation-1');
  }

  // 4. Subtle hover lift for cards that have hover:border without tactile lift
  // Note: targeted replacement where hover:border-strong appears without translate
  if (content !== original) {
    stats.filesModified++;
    if (!isDryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

console.log('----------------------------------------------------');
console.log(`Mode: ${isDryRun ? 'DRY-RUN (No files written)' : 'APPLIED (Files updated)'}`);
console.log(`Files modified / touched: ${stats.filesModified}`);
console.log(`Replacements summary:`);
console.log(`  - transition-all -> transition-[transform,opacity,box-shadow,border-color]: ${stats.transitionAll}`);
console.log(`  - shadow-soft -> shadow-elevation-1: ${stats.shadowSoft}`);
console.log(`  - shadow-2xs -> shadow-elevation-1: ${stats.shadow2xs}`);
console.log('----------------------------------------------------');
console.log('Top Modules by Modern Depth Modernization Impact:');
const sorted = Object.entries(stats.moduleCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);
for (const [mod, count] of sorted) {
  console.log(`  ${mod.padEnd(25)} : ${count} tokens modernised`);
}
console.log('----------------------------------------------------');
