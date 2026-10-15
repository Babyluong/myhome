/**
 * Facility Non-Drug Inventory Service
 * Persists selected facility non-drug inventory items to Supabase so they are
 * shared across browsers, devices, and deployment environments.
 *
 * localStorage is used as a fast local read-cache to avoid loading delays,
 * but Supabase is the single source of truth for all writes.
 *
 * Mirrors the pattern used in facilityDrugInventoryService.ts.
 */

import { resolveFacilityStoreById, validateFacilityStockSettings, validateInventoryExpiry } from './facilityStoreService'
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { FacilityNonDrugInventoryRecord, NonDrug, NonDrugWithRelations } from '@/types/pharmacy'

// ─── Types ───────────────────────────────────────────────────────────────────

export type FacilityNonDrugInventoryRow = FacilityNonDrugInventoryRecord

/** Full item: non_drugs catalog fields + facility-specific fields */
export interface FacilityNonDrugItem extends NonDrugWithRelations {
  facility_inventory_id?: string
  facility_stock?: number
  min_buffer_level?: number
  location?: string
  store_code?: string
  rack_name?: string
  level_name?: string
  added_at?: string
  notes?: string
  batch_number?: string
  batch_no?: string
  expiry_date?: string
  exp_date?: string
  category_name?: string
  supplier_name?: string
  unit_price?: number
  uom?: string
  kkm_contract_number?: string
  contract_number?: string
  is_active?: boolean
  store_location_id?: string | null
  department_id?: string | null
}

function sanitizeHospitalId(id?: string): string {
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Valid hospital ID required')
  return id
}

// ─── Local Cache Helpers ──────────────────────────────────────────────────────

// ─── Load ─────────────────────────────────────────────────────────────────────

/**
 * Load facility non-drug inventory.
 * - If Supabase is configured: fetch from DB (joined with non_drugs catalog),
 *   write result to local cache, return rows. Scoped by storeLocationId if provided.
 * - If Supabase is NOT configured: fall back to local cache (offline/dev mode).
 */
export async function loadFacilityNonDrugInventory(
  hospitalId: string,
  storeLocationId?: string
): Promise<FacilityNonDrugItem[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Facility non-drug inventory unavailable')
  }

  try {
    if (storeLocationId) await resolveFacilityStoreById(hospitalId, storeLocationId)
    let query = supabase
      .from('facility_nondrug_inventory')
      .select(`
        id,
        hospital_id,
        nondrug_id,
        facility_stock,
        min_buffer_level,
        batch_number,
        expiry_date,
        min_stock_level,
        max_stock_level,
        location,
        notes,
        added_at,
        updated_at,
        store_location_id,
        department_id,
        nondrug:non_drugs (
          id,
          hospital_id,
          item_code,
          item_name,
          unit_of_measure,
          min_stock_level,
          max_stock_level,
          reorder_level,
          status,
          sku,
          pku,
          supplier_id,
          procurement_vote,
          price,
          packaging_description,
          category_id,
          created_at,
          updated_at
        )
      `)
      .eq('hospital_id', hospitalId)

    if (storeLocationId) {
      query = query.eq('store_location_id', storeLocationId)
    }

    const { data, error } = await query.order('added_at', { ascending: false })

    if (error) throw error

    const items: FacilityNonDrugItem[] = (data || []).flatMap(row => {
      const nondrug = Array.isArray(row.nondrug) ? row.nondrug[0] : row.nondrug
      if (!nondrug) return []
      return [{
        ...nondrug,
        facility_inventory_id: row.id,
        facility_stock: row.facility_stock ?? 0,
        batch_number: row.batch_number ?? '',
        expiry_date: row.expiry_date ?? '',
        min_stock_level: row.min_stock_level ?? nondrug.min_stock_level,
        max_stock_level: row.max_stock_level ?? nondrug.max_stock_level,
        min_buffer_level: row.min_buffer_level ?? 10,
        location: row.location ?? '',
        notes: row.notes ?? '',
        added_at: row.added_at,
        store_location_id: row.store_location_id,
        department_id: row.department_id,
      }]
    })

    return items
  } catch (err) {
    throw new Error('Facility non-drug inventory unavailable')
  }
}

// ─── Add Single ───────────────────────────────────────────────────────────────

/**
 * Add a single non-drug item to the facility inventory.
 * Falls back to local cache if Supabase returns RLS or network error.
 */
export async function addToFacilityNonDrugInventory(
  hospitalId: string,
  item: NonDrug & { batch_number?: string; expiry_date?: string | null; notes?: string },
  facilityStock = 0,
  minBufferLevel = 10,
  location = '',
  storeLocationId?: string,
  departmentId?: string
): Promise<{ success: boolean; error?: string }> {


  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Inventory write failed' }
  }

  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    const cleanHospitalId = sanitizeHospitalId(hospitalId)
    const payload: Omit<FacilityNonDrugInventoryRow, 'id' | 'added_at' | 'updated_at'> = {
      hospital_id: cleanHospitalId,
      nondrug_id: item.id,
      batch_number: item.batch_number,
      expiry_date: validateInventoryExpiry(item.expiry_date),
      notes: item.notes,
      facility_stock: facilityStock,
      min_buffer_level: minBufferLevel,
      location,
    }
    if (storeLocationId) payload.store_location_id = storeLocationId
    if (departmentId) payload.department_id = departmentId

    const { error } = await supabase
      .from('facility_nondrug_inventory')
      .insert(payload)

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Item sudah wujud dalam Inventori Fasiliti.' }
      }
      if (error.code === '42501') {
        console.warn('[FacilityNonDrugInventory] RLS policy blocked insert, using local cache fallback')
        return { success: false, error: 'Inventory write failed' }
      }
      throw error
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Inventory write failed' }
  }
}

// ─── Batch Add ────────────────────────────────────────────────────────────────

/**
 * Add multiple non-drug items at once.
 * Uses upsert with ignoreDuplicates=true so existing items are skipped silently.
 * Falls back to local cache on Supabase RLS / DB error.
 */
export async function batchAddToFacilityNonDrugInventory(
  hospitalId: string,
  items: NonDrug[],
  facilityStock = 0,
  minBufferLevel = 10,
  location = '',
  storeLocationId?: string,
  departmentId?: string
): Promise<{ added: number; skipped: number; error?: string }> {


  if (!isSupabaseConfigured()) {
    return { added: 0, skipped: items.length, error: 'Inventory write failed' }
  }

  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    const cleanHospitalId = sanitizeHospitalId(hospitalId)
    const rows = items.map(d => ({
      hospital_id: cleanHospitalId,
      nondrug_id: d.id,
      facility_stock: facilityStock,
      min_buffer_level: minBufferLevel,
      location,
      store_location_id: storeLocationId || null,
      department_id: departmentId || null,
    }))

    const { data, error } = await supabase
      .from('facility_nondrug_inventory')
      .upsert(rows, { onConflict: 'hospital_id,store_location_id,nondrug_id', ignoreDuplicates: true })
      .select('id')

    if (error) {
      if (error.code === '42501') {
        console.warn('[FacilityNonDrugInventory] RLS policy blocked batch insert, using local cache fallback')
        return { added: 0, skipped: items.length, error: 'Inventory write failed' }
      }
      throw error
    }

    return {
      added: (data || []).length,
      skipped: items.length - (data || []).length,
    }
  } catch {
    return { added: 0, skipped: items.length, error: 'Inventory write failed' }
  }
}

// ─── Update Item ──────────────────────────────────────────────────────────────

/**
 * Update facility-specific non-drug inventory item settings (buffer, location, min/max levels).
 * Falls back to local cache on RLS or network error.
 */
export async function updateFacilityNonDrugInventoryItem(
  hospitalId: string,
  nonDrugId: string,
  updates: {
    min_buffer_level?: number
    location?: string
    notes?: string
    batch_number?: string
    expiry_date?: string | null
    min_stock_level?: number
    max_stock_level?: number
  },
  storeLocationId?: string
): Promise<{ success: boolean; error?: string }> {


  if (!isSupabaseConfigured() || !storeLocationId) return { success: false, error: 'Selected store required for editing' }

  try {
    validateFacilityStockSettings({ min_stock_level: updates.min_stock_level, max_stock_level: updates.max_stock_level, min_buffer_level: updates.min_buffer_level,  })
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    // 1. Update facility inventory specific table
    const { data: updatedRows, error: invErr } = await supabase
      .from('facility_nondrug_inventory')
      .update({
        min_buffer_level: updates.min_buffer_level,
        location: updates.location,
        notes: updates.notes,
        batch_number: updates.batch_number,
        expiry_date: validateInventoryExpiry(updates.expiry_date),
        min_stock_level: updates.min_stock_level,
        max_stock_level: updates.max_stock_level,
        updated_at: new Date().toISOString(),
      })
      .eq('hospital_id', hospitalId)
      .eq('nondrug_id', nonDrugId)
      .eq('store_location_id', storeLocationId)
      .select('id')

    if (invErr) throw invErr
    if (updatedRows?.length !== 1) throw new Error('Inventory row update not confirmed')

    return { success: true }
  } catch {
    return { success: false, error: 'Inventory write failed' }
  }
}

// ─── Remove ───────────────────────────────────────────────────────────────────

/**
 * Remove a single non-drug item from the facility inventory by its nondrug_id.
 * Falls back to local cache on RLS or network error.
 */
export async function removeFromFacilityNonDrugInventory(
  hospitalId: string,
  nonDrugId: string,
  storeLocationId?: string
): Promise<{ success: boolean; error?: string }> {


  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Inventory write failed' }
  }

  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    let query = supabase
      .from('facility_nondrug_inventory')
      .delete()
      .eq('hospital_id', hospitalId)
      .eq('nondrug_id', nonDrugId)

    if (storeLocationId) {
      query = query.eq('store_location_id', storeLocationId)
    }

    const { error } = await query

    if (error) {
      if (error.code === '42501') {
        return { success: false, error: 'Inventory write failed' }
      }
      throw error
    }
    return { success: true }
  } catch {
    return { success: false, error: 'Inventory write failed' }
  }
}


export async function bulkAssignLocationToFacilityNonDrugItems(hospitalId: string, itemIds: string[], locationString: string, storeLocationId?: string): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured() || !storeLocationId) return { success: false, count: 0, error: 'Selected store required for assignment' }
  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    const { data, error } = await supabase.from('facility_nondrug_inventory').update({ location: locationString, updated_at: new Date().toISOString() }).eq('hospital_id', hospitalId).eq('store_location_id', storeLocationId).in('nondrug_id', itemIds).select('id')
    if (error) throw error
    const count = data?.length || 0
    return count === new Set(itemIds).size ? { success: true, count } : { success: false, count, error: 'Some selected items were not updated; refresh inventory' }
  } catch { return { success: false, count: 0, error: 'Location assignment failed' } }
}
export async function clearFacilityNonDrugInventoryByScheme(hospitalId: string, scheme: string, storeLocationId?: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !storeLocationId) return { success: false, error: 'Selected store required for removal' }
  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    let query = supabase.from('facility_nondrug_inventory').delete().eq('hospital_id', hospitalId).eq('store_location_id', storeLocationId)
    if (scheme !== 'all') {
      const { data, error } = await supabase.from('non_drugs').select('id').eq('hospital_id', hospitalId).eq('procurement_vote', scheme.toLowerCase())
      if (error) throw error
      if (!data?.length) return { success: true }
      query = query.in('nondrug_id', data.map(item => item.id))
    }
    const { error } = await query
    if (error) throw error
    return { success: true }
  } catch { return { success: false, error: 'Inventory removal failed' } }
}
