const fs = require('fs');
const path = require('path');

console.log('--- Harmonizing Antidote Protocol & PRN Styling (Pass 2) ---');

// 1. Clean PRNHotlineCard.tsx
function cleanPRNHotlineCard() {
  const filePath = path.join(__dirname, '../src/modules/myformulari/components/PRNHotlineCard.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  // Direct Emergency Line 2 card
  content = content.replace(
    /bg-white\/5 border border-white\/10 hover:border-indigo-400\/40 rounded-2xl p-4 transition-colors/g,
    'bg-subtle/50 hover:bg-subtle border border-border-default hover:border-border-strong rounded-xl p-4 transition-colors'
  );
  content = content.replace(
    /text-\[11px\] font-medium text-indigo-300 uppercase tracking-wider/g,
    'text-[11px] font-semibold text-text-muted uppercase tracking-wider'
  );
  content = content.replace(
    /hover:text-indigo-200/g,
    'hover:text-accent-base'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✔ Cleaned PRNHotlineCard.tsx');
}

// 2. Clean AntidoteDetailModal.tsx
function cleanDetailModal() {
  const filePath = path.join(__dirname, '../src/modules/myformulari/components/AntidoteDetailModal.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    'text-indigo-600 dark:text-accent-base',
    'text-accent-base'
  );
  content = content.replace(
    'text-indigo-400',
    'text-accent-base'
  );
  content = content.replace(
    'text-indigo-500',
    'text-accent-base'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✔ Cleaned AntidoteDetailModal.tsx');
}

// 3. Clean AntidoteProtocolPage.tsx
function cleanProtocolPage() {
  const filePath = path.join(__dirname, '../src/modules/myformulari/pages/AntidoteProtocolPage.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  // Dark text / hover indigo cleanups
  content = content.replace(
    /group-hover:text-accent-base dark:group-hover:text-indigo-400/g,
    'group-hover:text-accent-base'
  );
  content = content.replace(
    /text-accent-base dark:text-indigo-400/g,
    'text-accent-base'
  );
  content = content.replace(
    /text-accent-base\/80 dark:text-indigo-300/g,
    'text-text-muted'
  );

  // Grid view accent strip
  content = content.replace(
    ": 'bg-indigo-500'",
    ": 'bg-accent-base'"
  );

  // Replace remaining text-slate-400 and text-slate-300 with semantic tokens
  content = content.replace(/text-slate-400/g, 'text-text-muted');
  content = content.replace(/text-slate-300/g, 'text-text-secondary');
  content = content.replace(/dark:text-white/g, '');
  content = content.replace(/dark:text-slate-[0-9]+/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✔ Cleaned AntidoteProtocolPage.tsx');
}

cleanPRNHotlineCard();
cleanDetailModal();
cleanProtocolPage();

console.log('--- Pass 2 Complete ---');
