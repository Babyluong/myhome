const fs = require('fs');

function checkAncestors(filePath, targetLines) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`\n=== Checking ${filePath} ===`);
  
  targetLines.forEach(targetLine => {
    // Look backwards from targetLine for enclosing <div> with overflow-hidden
    let count = 0;
    for (let i = targetLine - 1; i >= Math.max(0, targetLine - 50); i--) {
      const line = lines[i];
      if (line.includes('overflow-hidden') || line.includes('overflow-x-auto') || line.includes('overflow-y-auto')) {
        console.log(`  Target line ${targetLine} has overflow at line ${i + 1}: ${line.trim()}`);
      }
    }
  });
}

checkAncestors('src/modules/mycylinder/pages/oxygen/OxygenDashboardPage.tsx', [6665, 6749]);
checkAncestors('src/modules/catalog/pages/catalog/DrugCatalogPage.tsx', [1308]);
checkAncestors('src/modules/catalog/pages/catalog/NonDrugCatalogPage.tsx', [1177]);
checkAncestors('src/modules/admin/pages/systemLogs/SystemLogsPage.tsx', [395]);
checkAncestors('src/modules/myprepacking/pages/PrepackDashboardPage.tsx', [172]);
checkAncestors('src/components/oxygen/DispatchRequestDetailModal.tsx', [2130]);
checkAncestors('src/components/oxygen/ManualIssueModal.tsx', [1469, 1626]);
checkAncestors('src/components/oxygen/ReturnInterFacilityModal.tsx', [1109]);
checkAncestors('src/components/oxygen/UnitRequestModal.tsx', [410]);
checkAncestors('src/modules/inventory/pages/inventory/KewPs4LedgerPage.tsx', [6253, 7018]);
