const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'services', 'pharmacy', 'storeLocationService.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Expand DEFAULT_LOCATIONS to include standard IPD locations
const oldDefaultLocations = `const DEFAULT_LOCATIONS: Omit<StoreLocation, 'created_at' | 'updated_at'>[] = [
  {
    id: 'store-loc-mf-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'LOG-MF-001',
    store_name: 'Main Freezer',
    department: 'LOG',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'cold_2_8c',
    is_active: true,
  },
  {
    id: 'store-loc-sl-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'LOG-SL-001',
    store_name: 'Stor Logistik',
    department: 'LOG',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'non_drug',
    storage_condition: 'ambient',
    is_active: true,
  },
  {
    id: 'store-loc-sl-002',
    hospital_id: 'hosp-lawas-01',
    location_code: 'LOG-SL-002',
    store_name: 'Stor Logistik',
    department: 'LOG',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'ambient',
    is_active: true,
  },
  {
    id: 'store-loc-tl-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'LOG-TL-001',
    store_name: 'Top Loading',
    department: 'LOG',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'cold_2_8c',
    is_active: true,
  },
]`;

const newDefaultLocations = `const DEFAULT_LOCATIONS: Omit<StoreLocation, 'created_at' | 'updated_at'>[] = [
  // LOGISTICS LOCATIONS
  {
    id: 'store-loc-mf-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'LOG-MF-001',
    store_name: 'Main Freezer',
    department: 'LOG',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'cold_2_8c',
    is_active: true,
  },
  {
    id: 'store-loc-sl-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'LOG-SL-001',
    store_name: 'Stor Logistik',
    department: 'LOG',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'non_drug',
    storage_condition: 'ambient',
    is_active: true,
  },
  {
    id: 'store-loc-sl-002',
    hospital_id: 'hosp-lawas-01',
    location_code: 'LOG-SL-002',
    store_name: 'Stor Logistik',
    department: 'LOG',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'ambient',
    is_active: true,
  },
  {
    id: 'store-loc-tl-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'LOG-TL-001',
    store_name: 'Top Loading',
    department: 'LOG',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'cold_2_8c',
    is_active: true,
  },
  // INPATIENT PHARMACY (IPD) LOCATIONS
  {
    id: 'loc-ipd-oral-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'IPD-ORAL-001',
    store_name: 'Stor Ubat Oral (Pesakit Dalam)',
    department: 'IPD',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'ambient',
    is_active: true,
  },
  {
    id: 'loc-ipd-iv-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'IPD-IV-001',
    store_name: 'Stor Injeksi & Infusi IV',
    department: 'IPD',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'ambient',
    is_active: true,
  },
  {
    id: 'loc-ipd-dda-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'IPD-DDA-001',
    store_name: 'Peti Kawalan DDA & Psikotropik',
    department: 'IPD',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'controlled',
    is_active: true,
  },
  {
    id: 'loc-ipd-chill-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'IPD-CHILL-001',
    store_name: 'Peti Sejuk Farmasi Pesakit Dalam (2-8°C)',
    department: 'IPD',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'cold_2_8c',
    is_active: true,
  },
  {
    id: 'loc-ipd-emg-001',
    hospital_id: 'hosp-lawas-01',
    location_code: 'IPD-EMG-001',
    store_name: 'Troli Kecemasan & Resusitasi Wad',
    department: 'IPD',
    cabinet_rack: '-',
    shelf_level: '-',
    location_type: 'drug',
    storage_condition: 'ambient',
    is_active: true,
  },
]`;

if (!content.includes(oldDefaultLocations)) {
  console.error('Could not find oldDefaultLocations pattern');
  process.exit(1);
}
content = content.replace(oldDefaultLocations, newDefaultLocations);

// 2. Enhance readCache to merge missing defaults automatically
const oldReadCacheReturn = `    return parsed
  } catch {
    return DEFAULT_LOCATIONS.map(l => ({
      ...l,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) as StoreLocation[]
  }
}`;

const newReadCacheReturn = `    const existingCodes = new Set(parsed.map((item: StoreLocation) => item.location_code))
    const missing = DEFAULT_LOCATIONS.filter(l => !existingCodes.has(l.location_code))
    if (missing.length > 0) {
      const merged = [
        ...parsed,
        ...missing.map(l => ({
          ...l,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      ]
      localStorage.setItem(cacheKey(hospitalId), JSON.stringify(merged))
      return merged
    }
    return parsed
  } catch {
    return DEFAULT_LOCATIONS.map(l => ({
      ...l,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) as StoreLocation[]
  }
}`;

if (!content.includes(oldReadCacheReturn)) {
  console.error('Could not find oldReadCacheReturn pattern');
  process.exit(1);
}
content = content.replace(oldReadCacheReturn, newReadCacheReturn);

// 3. Update loadStoreLocations department extraction and merging
const oldLoadStoreLocations = `    const items: StoreLocation[] = data.map((row: any) => ({
      id: row.id,
      hospital_id: row.hospital_id,
      store_name: row.store_name,
      department: row.department,
      cabinet_rack: row.cabinet_rack,
      shelf_level: row.shelf_level,
      location_code: row.location_code || generateLocationCode(row.store_name, row.department || 'LOG', row.cabinet_rack, row.shelf_level),
      location_type: row.location_type || 'both',
      storage_condition: row.storage_condition || 'ambient',
      description: row.description,
      is_active: row.is_active ?? true,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))`;

const newLoadStoreLocations = `    const items: StoreLocation[] = data.map((row: any) => {
      const codePrefix = row.location_code ? row.location_code.split('-')[0].toUpperCase() : 'LOG'
      const dept = row.department || (codePrefix === 'IPD' ? 'IPD' : codePrefix === 'LOG' ? 'LOG' : codePrefix)
      return {
        id: row.id,
        hospital_id: row.hospital_id,
        store_name: row.store_name,
        department: dept,
        cabinet_rack: row.cabinet_rack,
        shelf_level: row.shelf_level,
        location_code: row.location_code || generateLocationCode(row.store_name, dept, row.cabinet_rack, row.shelf_level),
        location_type: row.location_type || 'both',
        storage_condition: row.storage_condition || 'ambient',
        description: row.description,
        is_active: row.is_active ?? true,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    })`;

if (!content.includes(oldLoadStoreLocations)) {
  console.error('Could not find oldLoadStoreLocations pattern');
  process.exit(1);
}
content = content.replace(oldLoadStoreLocations, newLoadStoreLocations);

// 4. Update getStoreLocationsWithOccupancy to load both logistics and inpatient inventory
const oldOccupancy = `export async function getStoreLocationsWithOccupancy(hospitalId: string): Promise<StoreLocationWithOccupancy[]> {
  const locations = await loadStoreLocations(hospitalId)
  const drugItems = await loadFacilityDrugInventory(hospitalId)

  // Non-drug items from localStorage cache
  let nonDrugItems: any[] = []
  try {
    const raw = localStorage.getItem(\`facility_nondrug_items_\${hospitalId}\`)
    if (raw) nonDrugItems = JSON.parse(raw)
  } catch {}

  return locations.map(loc => {
    const formatted = formatLocationString(loc.store_name, loc.cabinet_rack, loc.shelf_level)

    const isLocationMatch = (locStr: string) => {
      if (!locStr) return false
      const cleanLoc = locStr.trim().toLowerCase()
      const cleanStoreName = loc.store_name.trim().toLowerCase()
      const cleanCode = loc.location_code.trim().toLowerCase()
      const cleanFormatted = formatted.trim().toLowerCase()

      if (cleanLoc === cleanFormatted || cleanLoc === cleanCode) return true
      
      if (loc.cabinet_rack && loc.cabinet_rack !== '-') {
        const cleanCab = loc.cabinet_rack.trim().toLowerCase()
        return cleanLoc.includes(cleanStoreName) && cleanLoc.includes(cleanCab)
      }
      
      return cleanLoc.includes(cleanStoreName) || cleanLoc.includes(cleanCode)
    }

    const drugCount = (loc.location_type === 'non_drug')
      ? 0
      : drugItems.filter(item => isLocationMatch(item.location || '')).length

    const nonDrugCount = (loc.location_type === 'drug')
      ? 0
      : nonDrugItems.filter(item => isLocationMatch(item.location || '')).length

    return {
      ...loc,
      formatted_location: formatted,
      drug_items_count: drugCount,
      non_drug_items_count: nonDrugCount,
      total_items_count: drugCount + nonDrugCount,
    }
  })
}`;

const newOccupancy = `export async function getStoreLocationsWithOccupancy(hospitalId: string): Promise<StoreLocationWithOccupancy[]> {
  const locations = await loadStoreLocations(hospitalId)
  
  // Load both Logistics stock and Inpatient stock in parallel
  const [logisticsDrugs, inpatientDrugs] = await Promise.all([
    loadFacilityDrugInventory(hospitalId, 'a6e4cb7d-6dba-42a1-9cb6-3a7fcc953fbe'),
    loadFacilityDrugInventory(hospitalId, '2d1b7112-9c3a-4e2b-bb43-e8417e349a01'),
  ])

  // Non-drug items from localStorage cache
  let nonDrugItems: any[] = []
  try {
    const raw = localStorage.getItem(\`facility_nondrug_items_\${hospitalId}\`)
    if (raw) nonDrugItems = JSON.parse(raw)
  } catch {}

  return locations.map(loc => {
    const formatted = formatLocationString(loc.store_name, loc.cabinet_rack, loc.shelf_level)

    const isLocationMatch = (locStr: string) => {
      if (!locStr) return false
      const cleanLoc = locStr.trim().toLowerCase()
      const cleanStoreName = loc.store_name.trim().toLowerCase()
      const cleanCode = loc.location_code.trim().toLowerCase()
      const cleanFormatted = formatted.trim().toLowerCase()

      if (cleanLoc === cleanFormatted || cleanLoc === cleanCode) return true
      
      if (loc.cabinet_rack && loc.cabinet_rack !== '-') {
        const cleanCab = loc.cabinet_rack.trim().toLowerCase()
        return cleanLoc.includes(cleanStoreName) && cleanLoc.includes(cleanCab)
      }
      
      return cleanLoc.includes(cleanStoreName) || cleanLoc.includes(cleanCode)
    }

    // Use department-scoped drug pool (IPD gets Inpatient inventory, LOG gets Logistics inventory)
    const drugItemsPool = loc.department === 'IPD'
      ? inpatientDrugs
      : (loc.department === 'LOG' ? logisticsDrugs : [...logisticsDrugs, ...inpatientDrugs])

    const drugCount = (loc.location_type === 'non_drug')
      ? 0
      : drugItemsPool.filter(item => isLocationMatch(item.location || '')).length

    const nonDrugCount = (loc.location_type === 'drug')
      ? 0
      : nonDrugItems.filter(item => isLocationMatch(item.location || '')).length

    return {
      ...loc,
      formatted_location: formatted,
      drug_items_count: drugCount,
      non_drug_items_count: nonDrugCount,
      total_items_count: drugCount + nonDrugCount,
    }
  })
}`;

if (!content.includes(oldOccupancy)) {
  console.error('Could not find oldOccupancy pattern');
  process.exit(1);
}
content = content.replace(oldOccupancy, newOccupancy);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated storeLocationService.ts');
