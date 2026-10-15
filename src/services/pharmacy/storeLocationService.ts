/**
 * Store Location Management Service
 * Manages store location hierarchy (Store -> Cabinet/Rack -> Shelf/Level)
 * Persists to Supabase `store_locations` table with LocalStorage fallback.
 */

import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { StoreLocation, StoreLocationFormData, StoreLocationWithOccupancy } from '@/types/pharmacy'
import { loadFacilityDrugInventory } from './facilityDrugInventoryService'
import { loadFacilityNonDrugInventory } from './facilityNonDrugInventoryService'
import { listFacilityStores } from './facilityStoreService'
import { offlineScope } from '@/services/offlineSession'

function cacheKey(hospitalId: string) {
  return `store_locations_${offlineScope() || "unavailable"}_${hospitalId}`
}

function readCache(hospitalId: string): StoreLocation[] {
  if (!offlineScope()) return []
  try { const raw = localStorage.getItem(cacheKey(hospitalId)); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

function writeCache(hospitalId: string, items: StoreLocation[]) {
  try {
    localStorage.setItem(cacheKey(hospitalId), JSON.stringify(items))
  } catch { /* Cached copies are optional; confirmed writes remain authoritative. */ }
}

export function formatLocationString(storeName: string, cabinetRack?: string, shelfLevel?: string): string {
  if ((!cabinetRack || cabinetRack === '-') && (!shelfLevel || shelfLevel === '-')) {
    return storeName
  }
  const parts = [storeName, cabinetRack, shelfLevel].filter(p => p && p !== '-')
  return parts.join(' > ')
}

export function generateLocationCode(
  storeName: string,
  departmentCode: string = 'LOG',
  cabinetRack: string = '',
  shelfLevel: string = ''
): string {
  const dept = (departmentCode || 'LOG').trim().toUpperCase()
  const words = storeName.trim().split(/\s+/).filter(Boolean)
  
  let storeCode = ''
  if (words.length >= 2) {
    storeCode = words.map(w => w[0]).join('').toUpperCase().slice(0, 3)
  } else if (words.length === 1 && words[0].length >= 3) {
    storeCode = words[0].slice(0, 3).toUpperCase()
  } else if (words.length === 1) {
    storeCode = words[0].toUpperCase()
  } else {
    storeCode = 'STR'
  }

  const cleanCab = cabinetRack && cabinetRack !== '-' ? cabinetRack.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3) : ''
  const cleanShelf = shelfLevel && shelfLevel !== '-' ? shelfLevel.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3) : ''

  if (cleanCab || cleanShelf) {
    return `${dept}-${storeCode}-${cleanCab || 'C1'}-${cleanShelf || 'L1'}`
  }

  return `${dept}-${storeCode}-001`
}

/**
 * Generates a guaranteed unique location code by checking against existing store locations.
 * Automatically increments number suffixes (-002, -003, etc.) if collision detected.
 */
export function generateUniqueLocationCode(
  existingLocations: StoreLocation[],
  storeName: string,
  departmentCode: string = 'LOG',
  cabinetRack: string = '',
  shelfLevel: string = '',
  currentLocationId?: string
): string {
  const baseCode = generateLocationCode(storeName, departmentCode, cabinetRack, shelfLevel)
  
  const otherLocations = currentLocationId 
    ? existingLocations.filter(l => l.id !== currentLocationId)
    : existingLocations

  const usedCodes = new Set(otherLocations.map(l => l.location_code?.toUpperCase()).filter(Boolean))

  if (!usedCodes.has(baseCode.toUpperCase())) {
    return baseCode
  }

  const match = baseCode.match(/^(.*)-(\d+)$/)
  let prefix = baseCode
  let counter = 2

  if (match) {
    prefix = match[1]
    counter = parseInt(match[2], 10) + 1
  }

  while (counter < 1000) {
    const paddedNum = counter.toString().padStart(3, '0')
    const candidate = `${prefix}-${paddedNum}`
    if (!usedCodes.has(candidate.toUpperCase())) {
      return candidate
    }
    counter++
  }

  return `${baseCode}-${Date.now().toString().slice(-4)}`
}

/**
 * Load all store locations for a hospital
 */
export async function loadStoreLocations(hospitalId: string): Promise<StoreLocation[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Store locations unavailable')
  }

  try {
    const { data, error } = await supabase
      .from('store_locations')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('store_name', { ascending: true })

    if (error || !data) throw new Error('Store locations unavailable')

    const items: StoreLocation[] = data.map((row: StoreLocation) => {
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
    })

    writeCache(hospitalId, items)
    return items
  } catch (err) {
    throw new Error('Store locations unavailable')
  }
}

/**
 * Create a new store location
 */
export async function createStoreLocation(
  hospitalId: string,
  formData: StoreLocationFormData
): Promise<StoreLocation> {
  if (!isSupabaseConfigured()) throw new Error('Store location write unavailable')

  const existingLocs = readCache(hospitalId)
  const defaultCode = generateLocationCode(formData.store_name, formData.department || 'LOG', formData.cabinet_rack, formData.shelf_level)
  const userCode = formData.location_code?.trim()

  const code = (!userCode || userCode === defaultCode)
    ? generateUniqueLocationCode(existingLocs, formData.store_name, formData.department || 'LOG', formData.cabinet_rack, formData.shelf_level)
    : userCode

  const now = new Date().toISOString()
  const newId = `loc-${Date.now()}`

  const newLoc: StoreLocation = {
    id: newId,
    hospital_id: hospitalId,
    store_name: formData.store_name.trim(),
    department: formData.department,
    cabinet_rack: formData.cabinet_rack.trim(),
    shelf_level: formData.shelf_level.trim(),
    location_code: code,
    location_type: formData.location_type,
    storage_condition: formData.storage_condition,
    description: formData.description?.trim() || null,
    is_active: formData.is_active,
    created_at: now,
    updated_at: now,
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('store_locations')
      .insert([{
        id: newLoc.id,
        hospital_id: newLoc.hospital_id,
        store_name: newLoc.store_name,
        cabinet_rack: newLoc.cabinet_rack,
        shelf_level: newLoc.shelf_level,
        location_code: newLoc.location_code,
        location_type: newLoc.location_type,
        storage_condition: newLoc.storage_condition,
        description: newLoc.description,
        is_active: newLoc.is_active,
        created_at: newLoc.created_at,
        updated_at: newLoc.updated_at,
      }])
      .select()
      .single()

    if (error) {
      console.error('[StoreLocation] Supabase insert error:', error)
      if (error.code === '23505') {
        throw new Error(`Kod lokasi '${newLoc.location_code}' telah wujud. Sila gunakan kod lokasi yang lain.`)
      }
      throw new Error(error.message || 'Gagal menyimpan ke pangkalan data.')
    }

    if (data) {
      newLoc.id = data.id
    }
  }

  const existing = readCache(hospitalId)
  const updated = [newLoc, ...existing]
  writeCache(hospitalId, updated)
  return newLoc
}

/**
 * Update an existing store location
 */
export async function updateStoreLocation(
  hospitalId: string,
  locationId: string,
  formData: Partial<StoreLocationFormData>
): Promise<StoreLocation | null> {
  if (!isSupabaseConfigured()) throw new Error('Store location write unavailable')

  const now = new Date().toISOString()
  const cache = readCache(hospitalId)
  const index = cache.findIndex(l => l.id === locationId)

  if (index === -1) return null

  const target = cache[index]
  const defaultCode = generateLocationCode(
    formData.store_name ?? target.store_name,
    formData.department ?? target.department ?? 'LOG',
    formData.cabinet_rack ?? target.cabinet_rack,
    formData.shelf_level ?? target.shelf_level
  )
  const userCode = formData.location_code?.trim()

  const code = (!userCode || userCode === defaultCode || userCode === target.location_code)
    ? (userCode && userCode !== defaultCode && userCode === target.location_code 
        ? target.location_code 
        : generateUniqueLocationCode(
            cache,
            formData.store_name ?? target.store_name,
            formData.department ?? target.department ?? 'LOG',
            formData.cabinet_rack ?? target.cabinet_rack,
            formData.shelf_level ?? target.shelf_level,
            locationId
          ))
    : userCode

  const updatedLoc: StoreLocation = {
    ...target,
    ...formData,
    store_name: formData.store_name?.trim() ?? target.store_name,
    department: formData.department ?? target.department,
    cabinet_rack: formData.cabinet_rack?.trim() ?? target.cabinet_rack,
    shelf_level: formData.shelf_level?.trim() ?? target.shelf_level,
    location_code: code,
    updated_at: now,
  }

  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('store_locations')
      .update({
        store_name: updatedLoc.store_name,
        cabinet_rack: updatedLoc.cabinet_rack,
        shelf_level: updatedLoc.shelf_level,
        location_code: updatedLoc.location_code,
        location_type: updatedLoc.location_type,
        storage_condition: updatedLoc.storage_condition,
        description: updatedLoc.description,
        is_active: updatedLoc.is_active,
        updated_at: now,
      })
      .eq('id', locationId)
      .eq('hospital_id', hospitalId)

    if (error) {
      console.error('[StoreLocation] Supabase update error:', error)
      if (error.code === '23505' || (error as any).status === 409) {
        throw new Error(`Kod lokasi '${updatedLoc.location_code}' telah wujud untuk lokasi lain. Sila gunakan kod lokasi yang berbeza.`)
      }
      throw new Error(error.message || 'Gagal mengemaskini di pangkalan data.')
    }
  }

  cache[index] = updatedLoc
  writeCache(hospitalId, cache)
  return updatedLoc
}

/**
 * Delete a store location
 */
export async function deleteStoreLocation(hospitalId: string, locationId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) throw new Error('Store location write unavailable')
  const { data, error } = await supabase.from('store_locations').delete().eq('id', locationId).eq('hospital_id', hospitalId).select('id')
  if (error || !data?.length) throw new Error('Store location was not deleted')
  writeCache(hospitalId, readCache(hospitalId).filter(location => location.id !== locationId))
  return true
}

/**
 * Get store locations with calculated item occupancy counts
 */
export async function getStoreLocationsWithOccupancy(hospitalId: string): Promise<StoreLocationWithOccupancy[]> {
  const locations = await loadStoreLocations(hospitalId)
  
  const stores = await listFacilityStores(hospitalId)
  const inventories = await Promise.all(stores.map(async store => ({
    code: store.location_code.split('-')[1],
    drugs: await loadFacilityDrugInventory(hospitalId, store.id),
    nonDrugs: await loadFacilityNonDrugInventory(hospitalId, store.id),
  })))

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

    const relevant = inventories.filter(inventory => inventory.code === (loc.department || loc.location_code.split('-')[0]))
    const drugItemsPool = relevant.flatMap(inventory => inventory.drugs)
    const nonDrugItems = relevant.flatMap(inventory => inventory.nonDrugs)

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
}
