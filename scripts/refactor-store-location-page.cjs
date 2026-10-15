const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'modules', 'inventory', 'pages', 'inventory', 'StoreLocationManagementPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add departmentFilter state
const oldStateAnchor = `  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')`;

const newStateAnchor = `  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | 'LOG' | 'IPD'>('LOG')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')

  const getTargetStoreId = (loc?: StoreLocationWithOccupancy | null) => {
    if (!loc) return undefined
    const isIPD = loc.department === 'IPD' || loc.location_code?.startsWith('IPD')
    return isIPD ? '2d1b7112-9c3a-4e2b-bb43-e8417e349a01' : 'a6e4cb7d-6dba-42a1-9cb6-3a7fcc953fbe'
  }`;

if (!content.includes(oldStateAnchor)) {
  console.error('Could not find oldStateAnchor');
  process.exit(1);
}
content = content.replace(oldStateAnchor, newStateAnchor);

// 2. Update handleSaveBulkAssign reload inventory call
const oldBulkAssignReload = `        // Reload inventory
        const drugItems = await loadFacilityDrugInventory(hospitalId)
        setPlacedDrugItems(drugItems || [])
        fetchLocations()`;

const newBulkAssignReload = `        // Reload inventory
        const targetStoreId = getTargetStoreId(selectedStoreLocation)
        const drugItems = await loadFacilityDrugInventory(hospitalId, targetStoreId)
        setPlacedDrugItems(drugItems || [])
        fetchLocations()`;

if (!content.includes(oldBulkAssignReload)) {
  console.error('Could not find oldBulkAssignReload');
  process.exit(1);
}
content = content.replace(oldBulkAssignReload, newBulkAssignReload);

// 3. Update useEffect on selectedStoreLocation
const oldLoadItems = `      loadFacilityDrugInventory(hospitalId).then(drugItems => {`;
const newLoadItems = `      const targetStoreId = getTargetStoreId(selectedStoreLocation)
      loadFacilityDrugInventory(hospitalId, targetStoreId).then(drugItems => {`;

if (!content.includes(oldLoadItems)) {
  console.error('Could not find oldLoadItems');
  process.exit(1);
}
content = content.replace(oldLoadItems, newLoadItems);

// 4. Update handleExportPdfForLocation
const oldPdfExport = `      const drugItems = await loadFacilityDrugInventory(hospitalId)`;
const newPdfExport = `      const targetStoreId = getTargetStoreId(loc)
      const drugItems = await loadFacilityDrugInventory(hospitalId, targetStoreId)`;

if (!content.includes(oldPdfExport)) {
  console.error('Could not find oldPdfExport');
  process.exit(1);
}
content = content.replace(oldPdfExport, newPdfExport);

// Also PDF department title
const oldPdfDept = `department: \`Jabatan Farmasi / Unit Logistik Stor (\${loc.department || 'LOG'})\`,`;
const newPdfDept = `department: (loc.department === 'IPD' || loc.location_code?.startsWith('IPD'))
          ? \`Jabatan Farmasi / Farmasi Pesakit Dalam (\${loc.department || 'IPD'})\`
          : \`Jabatan Farmasi / Unit Logistik Stor (\${loc.department || 'LOG'})\`,`;

if (!content.includes(oldPdfDept)) {
  console.error('Could not find oldPdfDept');
  process.exit(1);
}
content = content.replace(oldPdfDept, newPdfDept);

// 5. Update handleOpenCreateModal to default department to current departmentFilter
const oldCreateModal = `  const handleOpenCreateModal = () => {
    setEditingLocation(null)
    setDepartmentInput('LOG')`;

const newCreateModal = `  const handleOpenCreateModal = () => {
    setEditingLocation(null)
    setDepartmentInput(departmentFilter === 'IPD' ? 'IPD' : 'LOG')`;

if (!content.includes(oldCreateModal)) {
  console.error('Could not find oldCreateModal');
  process.exit(1);
}
content = content.replace(oldCreateModal, newCreateModal);

// 6. Update handleViewItems
const oldViewItems = `      const drugItems = await loadFacilityDrugInventory(hospitalId)`;
const newViewItems = `      const targetStoreId = getTargetStoreId(loc)
      const drugItems = await loadFacilityDrugInventory(hospitalId, targetStoreId)`;

if (!content.includes(oldViewItems)) {
  console.error('Could not find oldViewItems');
  process.exit(1);
}
content = content.replace(oldViewItems, newViewItems);

// 7. Update filteredLocations and summary metrics
const oldFilterBlock = `  // Filtered List
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch =
        loc.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.cabinet_rack.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.shelf_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.location_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = typeFilter === 'all' || loc.location_type === typeFilter
      const matchesCondition = conditionFilter === 'all' || loc.storage_condition === conditionFilter

      return matchesSearch && matchesType && matchesCondition
    })
  }, [locations, searchTerm, typeFilter, conditionFilter])`;

const newFilterBlock = `  // Department-Scoped Locations
  const departmentScopedLocations = useMemo(() => {
    if (departmentFilter === 'ALL') return locations
    return locations.filter(loc => {
      const dept = loc.department || (loc.location_code?.split('-')[0]) || 'LOG'
      return dept.toUpperCase() === departmentFilter
    })
  }, [locations, departmentFilter])

  // Filtered List
  const filteredLocations = useMemo(() => {
    return departmentScopedLocations.filter(loc => {
      const matchesSearch =
        loc.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.cabinet_rack.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.shelf_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.location_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = typeFilter === 'all' || loc.location_type === typeFilter
      const matchesCondition = conditionFilter === 'all' || loc.storage_condition === conditionFilter

      return matchesSearch && matchesType && matchesCondition
    })
  }, [departmentScopedLocations, searchTerm, typeFilter, conditionFilter])`;

if (!content.includes(oldFilterBlock)) {
  console.error('Could not find oldFilterBlock');
  process.exit(1);
}
content = content.replace(oldFilterBlock, newFilterBlock);

// Summary Metrics updated to departmentScopedLocations
const oldMetricsBlock = `  // Summary Metrics
  const uniqueStoresCount = useMemo(() => new Set(locations.map(l => l.store_name)).size, [locations])
  const uniqueCabinetsCount = useMemo(() => new Set(locations.map(l => \`\${l.store_name}-\${l.cabinet_rack}\`)).size, [locations])
  const totalOccupiedCount = useMemo(() => locations.filter(l => l.total_items_count > 0).length, [locations])
  const totalItemsStored = useMemo(() => locations.reduce((sum, l) => sum + l.total_items_count, 0), [locations])`;

const newMetricsBlock = `  // Summary Metrics (Scoped to Active Department)
  const uniqueStoresCount = useMemo(() => new Set(departmentScopedLocations.map(l => l.store_name)).size, [departmentScopedLocations])
  const uniqueCabinetsCount = useMemo(() => new Set(departmentScopedLocations.map(l => \`\${l.store_name}-\${l.cabinet_rack}\`)).size, [departmentScopedLocations])
  const totalOccupiedCount = useMemo(() => departmentScopedLocations.filter(l => l.total_items_count > 0).length, [departmentScopedLocations])
  const totalItemsStored = useMemo(() => departmentScopedLocations.reduce((sum, l) => sum + l.total_items_count, 0), [departmentScopedLocations])`;

if (!content.includes(oldMetricsBlock)) {
  console.error('Could not find oldMetricsBlock');
  process.exit(1);
}
content = content.replace(oldMetricsBlock, newMetricsBlock);

// 8. Add Department Switcher UI right before Metrics Row
const oldMainViewStart = `      ) : (
        /* Main Store Locations List & Table View */
        <>
          {/* Metrics Row (Light Clean Cards) */}`;

const newMainViewStart = `      ) : (
        /* Main Store Locations List & Table View */
        <>
          {/* Department Navigation Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-border-default shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-subtle rounded-xl border border-border-default">
              <button
                type="button"
                onClick={() => setDepartmentFilter('LOG')}
                className={\`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer \${
                  departmentFilter === 'LOG'
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }\`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Logistik Farmasi (LOG)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-subtle text-text-secondary font-mono font-bold">
                  {locations.filter(l => (l.department || l.location_code?.split('-')[0]) === 'LOG').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDepartmentFilter('IPD')}
                className={\`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer \${
                  departmentFilter === 'IPD'
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }\`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Farmasi Pesakit Dalam (IPD)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-mono font-bold">
                  {locations.filter(l => (l.department || l.location_code?.split('-')[0]) === 'IPD').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDepartmentFilter('ALL')}
                className={\`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer \${
                  departmentFilter === 'ALL'
                    ? 'bg-surface text-teal-600 dark:text-teal-400 shadow-xs border border-border-default'
                    : 'text-text-muted hover:text-text-primary'
                }\`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Semua Jabatan ({locations.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-muted font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Fasiliti: <strong className="text-text-primary font-bold">
                  {departmentFilter === 'IPD' ? 'Farmasi Pesakit Dalam (LOC-IPD-01)' : departmentFilter === 'LOG' ? 'Stor Logistik Farmasi (LOC-LOG-01)' : 'Semua Stor Fasiliti'}
                </strong>
              </span>
            </div>
          </div>

          {/* Metrics Row (Light Clean Cards) */}`;

if (!content.includes(oldMainViewStart)) {
  console.error('Could not find oldMainViewStart');
  process.exit(1);
}
content = content.replace(oldMainViewStart, newMainViewStart);

// Also update detail view header department badge to be human-readable
const oldDetailDeptBadge = `<span className="text-xs font-bold text-text-muted uppercase tracking-wider bg-subtle px-2 py-0.5 rounded-md">
                    {selectedStoreLocation.department || 'LOG'}
                  </span>`;

const newDetailDeptBadge = `<span className={\`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md \${
                    (selectedStoreLocation.department === 'IPD' || selectedStoreLocation.location_code?.startsWith('IPD'))
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      : 'bg-subtle text-text-muted border border-border-default'
                  }\`}>
                    {(selectedStoreLocation.department === 'IPD' || selectedStoreLocation.location_code?.startsWith('IPD'))
                      ? 'Farmasi Pesakit Dalam (IPD)'
                      : 'Logistik Farmasi (LOG)'}
                  </span>`;

if (content.includes(oldDetailDeptBadge)) {
  content = content.replace(oldDetailDeptBadge, newDetailDeptBadge);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored StoreLocationManagementPage.tsx');
