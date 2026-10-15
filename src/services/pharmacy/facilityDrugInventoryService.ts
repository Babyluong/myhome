/**
 * Facility Drug Inventory Service
 * Persists selected facility inventory items to Supabase so they are
 * shared across browsers, devices, and deployment environments.
 *
 * localStorage is still used as a fast local cache to avoid loading delays,
 * but Supabase is the source of truth.
 */

import { resolveFacilityStoreById, validateFacilityStockSettings } from './facilityStoreService'
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { DrugWithRelations, FacilityDrugInventoryRecord } from '@/types/pharmacy'

export type FacilityInventoryRow = FacilityDrugInventoryRecord

/** Full item joined with drug catalog data */
export interface FacilityDrugItem extends DrugWithRelations {
  facility_inventory_id?: string
  added_at?: string
  facility_stock?: number
  min_buffer_level?: number
  batch_number?: string
  batch_no?: string
  expiry_date?: string
  exp_date?: string
  location?: string
  item_code?: string
  item_name?: string
  uom?: string
  unit_price?: number
  supplier_name?: string
  kkm_contract_number?: string
  contract_number?: string
  category_name?: string
  is_active?: boolean
  notes?: string
  store_location_id?: string | null
  department_id?: string | null
}


export const DEFAULT_HOSPITAL_ID = '85bb6adc-b868-428b-83f4-e5af2f5cf904'

export const isUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

export function normalizeHospitalId(hospitalId?: string | null): string {
  if (!isUuid(hospitalId)) throw new Error('Valid hospital ID required')
  return hospitalId!
}

// ─── Load ─────────────────────────────────────────────────────────────────────

/**
 * Load facility drug inventory.
 * • If Supabase is configured: fetch from DB, write to cache, return DB rows.
 * • Supports storeLocationId to scope to specific store unit (e.g. Inpatient vs Logistics).
 * • Otherwise: fall back to local cache.
 */
export async function loadFacilityDrugInventory(
  hospitalId: string,
  storeLocationId?: string
): Promise<FacilityDrugItem[]> {
  const effectiveHospitalId = normalizeHospitalId(hospitalId)
  if (!isSupabaseConfigured()) {
    throw new Error('Facility inventory unavailable')
  }

  try {
    if (storeLocationId) await resolveFacilityStoreById(hospitalId, storeLocationId)
    let query = supabase
      .from('facility_drug_inventory')
      .select(`
        id,
        hospital_id,
        drug_id,
        facility_stock,
        min_buffer_level,
        min_stock_level,
        max_stock_level,
        batch_number,
        expiry_date,
        location,
        notes,
        added_at,
        updated_at,
        store_location_id,
        department_id,
        drug:drugs (
          id,
          hospital_id,
          created_at,
          drug_code,
          drug_name,
          generic_name,
          brand_name,
          dosage_form,
          strength,
          unit_of_measure,
          category_id,
          is_controlled,
          requires_prescription,
          storage_conditions,
          min_stock_level,
          max_stock_level,
          reorder_level,
          lead_time_days,
          status,
          sku,
          pku,
          supplier_id,
          procurement_vote,
          price,
          packaging_description,
          item_sub_class,
          cc_contract_number,
          cc_contract_start_date,
          cc_contract_end_date,
          cc_contract_status,
          cc_supplier_name,
          category:drug_categories!drugs_category_id_fkey (*),
          supplier:suppliers (*)
        )
      `)
      .eq('hospital_id', effectiveHospitalId)

    if (storeLocationId) {
      query = query.eq('store_location_id', storeLocationId)
    }

    const { data, error } = await query.order('added_at', { ascending: false })

    if (error) throw error

    const items: FacilityDrugItem[] = (data || []).flatMap(row => {
      const drug = Array.isArray(row.drug) ? row.drug[0] : row.drug
      if (!drug) return []
      const category = Array.isArray(drug.category) ? drug.category[0] : drug.category
      const supplier = Array.isArray(drug.supplier) ? drug.supplier[0] : drug.supplier
      return [{
        ...drug,
        category,
        supplier,
        facility_inventory_id: row.id,
        facility_stock: row.facility_stock ?? 0,
        min_stock_level: row.min_stock_level ?? drug.min_stock_level,
        max_stock_level: row.max_stock_level ?? drug.max_stock_level,
        min_buffer_level: row.min_buffer_level ?? 20,
        batch_number: row.batch_number ?? '',
        expiry_date: row.expiry_date ?? '',
        location: row.location ?? '',
        notes: row.notes ?? '',
        added_at: row.added_at,
        store_location_id: row.store_location_id,
        department_id: row.department_id,
      }]
    })

    // ─── SYNC WITH KEW.PS-4 LEDGER BATCHES ───
    try {
      // Fetch active batches from pharmacy_stock_batches (scoped to store if provided)
      let batchesQuery = supabase
        .from('pharmacy_stock_batches')
        .select('item_id, batch_number, expiry_date, quantity_on_hand, status, location_id')
        .eq('hospital_id', effectiveHospitalId)
        .in('status', ['available', 'quarantine', 'active'])

      if (storeLocationId) {
        batchesQuery = batchesQuery.eq('location_id', storeLocationId)
      }

      const { data: batches, error: batchError } = await batchesQuery
      if (batchError) throw batchError

      const batchMap = new Map<string, { totalStock: number; primaryBatch: string; earliestExpiry: string }>()
      if (batches && batches.length > 0) {
        batches.forEach((b: { item_id: string | null; batch_number: string | null; expiry_date: string | null; quantity_on_hand: number | null }) => {
          if (!b.item_id) return
          const existing = batchMap.get(b.item_id) || { totalStock: 0, primaryBatch: '', earliestExpiry: '' }
          const stock = Number(b.quantity_on_hand || 0)
          const batchNo = b.batch_number || ''
          const expDate = b.expiry_date || ''

          let primaryBatch = existing.primaryBatch
          if (!primaryBatch && batchNo) primaryBatch = batchNo

          let earliestExpiry = existing.earliestExpiry
          if (expDate && (!earliestExpiry || expDate < earliestExpiry)) {
            earliestExpiry = expDate
          }

          batchMap.set(b.item_id, {
            totalStock: existing.totalStock + stock,
            primaryBatch,
            earliestExpiry,
          })
        })
      }

      items.forEach(item => {
        const drugId = item.id
        const bInfo = drugId ? batchMap.get(drugId) : null
        const dbStock = item.facility_stock

        if (bInfo) {
          // If batches are registered in KEW.PS-4 ledger for this store, reflect ledger stock
          if (typeof dbStock === 'number' && dbStock > 0 && dbStock !== bInfo.totalStock) {
            // Respect facility_stock explicitly set on facility_drug_inventory table (e.g. from manual adjustment)
            item.facility_stock = dbStock
          } else {
            item.facility_stock = bInfo.totalStock
          }
          if (bInfo.primaryBatch) item.batch_number = bInfo.primaryBatch
          if (bInfo.earliestExpiry) item.expiry_date = bInfo.earliestExpiry
        } else {
          // No batches in ledger for this store location: retain exact facility_stock from facility_drug_inventory
          item.facility_stock = typeof dbStock === 'number' ? dbStock : 0
          if (!item.batch_number) item.batch_number = ''
          if (!item.expiry_date) item.expiry_date = ''
        }
      })
    } catch (syncErr) {
      throw new Error('Facility batch inventory unavailable')
    }

    return items
  } catch (err) {
    console.error('[FacilityInventory] Failed to load from Supabase, using cache:', err)
    throw new Error('Facility inventory unavailable')
  }
}

// ─── Location & Scoping Parameter Resolver ──────────────────────────────────

/**
 * Resolves overloaded parameters for single/batch additions.
 * Supports both signatures:
 *  - 7 parameters: (hospitalId, item/items, stock, buffer, location, storeLocationId, departmentId)
 *  - 6 parameters (legacy): (hospitalId, item/items, stock, buffer, storeLocationId, departmentId)
 */
function resolveInventoryLocationParams(
  p5?: string,
  p6?: string,
  p7?: string
): { location?: string; storeLocationId?: string; departmentId?: string } {
  // If p7 was explicitly provided (even if undefined/null)
  if (p7 !== undefined) {
    const storeLoc = p6 && isUuid(p6) ? p6 : undefined
    const dept = p7 && isUuid(p7) && p7 !== storeLoc ? p7 : undefined
    return {
      location: p5 || undefined,
      storeLocationId: storeLoc,
      departmentId: dept,
    }
  }

  // If p5 is a UUID, caller used 5 or 6 parameter legacy signature: (stock, buffer, storeLocationId, departmentId)
  if (p5 && isUuid(p5)) {
    const storeLoc = p5
    const dept = p6 && isUuid(p6) && p6 !== storeLoc ? p6 : undefined
    return {
      location: undefined,
      storeLocationId: storeLoc,
      departmentId: dept,
    }
  }

  // If p5 is not a UUID (or undefined) and p6 is a UUID, p6 is storeLocationId
  if (p6 && isUuid(p6)) {
    return {
      location: p5 || undefined,
      storeLocationId: p6,
      departmentId: undefined,
    }
  }

  return {
    location: p5 || undefined,
    storeLocationId: undefined,
    departmentId: undefined,
  }
}

// ─── Add ──────────────────────────────────────────────────────────────────────

export async function addToFacilityDrugInventory(
  hospitalId: string,
  drug: DrugWithRelations,
  facilityStock = 0,
  minBufferLevel = 20,
  locationOrStoreLocationId?: string,
  storeLocationIdOrDeptId?: string,
  departmentIdArg?: string
): Promise<{ success: boolean; error?: string }> {
  const { location, storeLocationId, departmentId } = resolveInventoryLocationParams(
    locationOrStoreLocationId,
    storeLocationIdOrDeptId,
    departmentIdArg
  )
  const effectiveHospitalId = normalizeHospitalId(hospitalId)
  if (!isSupabaseConfigured()) return { success: false, error: 'Inventory write unavailable' }

  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    const payload: Omit<FacilityInventoryRow, 'id' | 'added_at' | 'updated_at'> = {
      hospital_id: effectiveHospitalId,
      drug_id: drug.id,
      facility_stock: facilityStock,
      min_buffer_level: minBufferLevel,
    }
    if (location) payload.location = location
    if (storeLocationId) payload.store_location_id = storeLocationId
    if (departmentId) payload.department_id = departmentId

    const { error } = await supabase
      .from('facility_drug_inventory')
      .insert(payload)

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Item sudah wujud dalam Inventori Fasiliti.' }
      }
      throw error
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Inventory write failed' }
  }
}

// ─── Batch Add ────────────────────────────────────────────────────────────────

export async function batchAddToFacilityDrugInventory(
  hospitalId: string,
  drugs: DrugWithRelations[],
  facilityStock = 0,
  minBufferLevel = 20,
  locationOrStoreLocationId?: string,
  storeLocationIdOrDeptId?: string,
  departmentIdArg?: string
): Promise<{ added: number; skipped: number; error?: string }> {
  const { location, storeLocationId, departmentId } = resolveInventoryLocationParams(
    locationOrStoreLocationId,
    storeLocationIdOrDeptId,
    departmentIdArg
  )
  const effectiveHospitalId = normalizeHospitalId(hospitalId)
  if (!isSupabaseConfigured()) return { added: 0, skipped: drugs.length, error: 'Inventory write unavailable' }

  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    const validDrugs = drugs.filter(d => isUuid(d.id))
    const seenDrugIds = new Set<string>()
    const uniqueDrugs = validDrugs.filter(d => {
      if (seenDrugIds.has(d.id)) return false
      seenDrugIds.add(d.id)
      return true
    })

    const rows = uniqueDrugs.map(d => {
      const row: Omit<FacilityInventoryRow, 'id' | 'added_at' | 'updated_at'> = {
        hospital_id: effectiveHospitalId,
        drug_id: d.id,
        facility_stock: facilityStock,
        min_buffer_level: minBufferLevel,
        store_location_id: storeLocationId || null,
        department_id: departmentId || null,
      }
      if (location) row.location = location
      return row
    })

    const { error, data } = await supabase
      .from('facility_drug_inventory')
      .upsert(rows, { onConflict: 'hospital_id,store_location_id,drug_id', ignoreDuplicates: true })
      .select('id')

    if (error) throw error

    return { added: (data || []).length, skipped: drugs.length - (data || []).length }
  } catch {
    return { added: 0, skipped: drugs.length, error: 'Inventory batch addition failed' }
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateFacilityDrugInventoryItem(hospitalId: string, drugId: string, updates: Partial<{ facility_stock: number; min_buffer_level: number; min_stock_level: number; max_stock_level: number; batch_number: string; expiry_date: string; location: string; notes: string }>, storeLocationId?: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !storeLocationId) return { success: false, error: 'Selected store required for editing' }
  try {
    validateFacilityStockSettings({ min_stock_level: updates.min_stock_level, max_stock_level: updates.max_stock_level, min_buffer_level: updates.min_buffer_level, facility_stock: updates.facility_stock })
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    const { data, error } = await supabase.from('facility_drug_inventory').update({ ...updates, updated_at: new Date().toISOString() }).eq('hospital_id', hospitalId).eq('store_location_id', storeLocationId).eq('drug_id', drugId).select('id')
    if (error || data?.length !== 1) throw new Error('Inventory update was not confirmed')
    return { success: true }
  } catch { return { success: false, error: 'Inventory update failed; refresh current stock' } }
}

// ─── Bulk Assign Location ──────────────────────────────────────────────────

export async function bulkAssignLocationToFacilityDrugItems(hospitalId: string, drugIds: string[], locationString: string, storeLocationId?: string): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured() || !storeLocationId) return { success: false, count: 0, error: 'Selected store required for assignment' }
  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    const { data, error } = await supabase.from('facility_drug_inventory').update({ location: locationString, updated_at: new Date().toISOString() }).eq('hospital_id', hospitalId).eq('store_location_id', storeLocationId).in('drug_id', drugIds).select('id')
    if (error) throw error
    const count = data?.length || 0
    return count === new Set(drugIds).size ? { success: true, count } : { success: false, count, error: 'Some selected items were not updated; refresh inventory' }
  } catch { return { success: false, count: 0, error: 'Location assignment failed' } }
}

// ─── Delete Single ────────────────────────────────────────────────────────────

export async function removeFromFacilityDrugInventory(
  hospitalId: string,
  drugId: string,
  storeLocationId?: string
): Promise<{ success: boolean; error?: string }> {
  const effectiveHospitalId = normalizeHospitalId(hospitalId)
  if (!isSupabaseConfigured()) return { success: false, error: 'Inventory write unavailable' }

  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    let query = supabase
      .from('facility_drug_inventory')
      .delete()
      .eq('hospital_id', effectiveHospitalId)
      .eq('drug_id', drugId)

    if (storeLocationId) {
      query = query.eq('store_location_id', storeLocationId)
    }

    const { error } = await query

    if (error) throw error
    return { success: true }
  } catch {
    return { success: false, error: 'Inventory write failed' }
  }
}

// ─── Delete by Scheme ─────────────────────────────────────────────────────────

export async function clearFacilityDrugInventoryByScheme(hospitalId: string, scheme: string, storeLocationId?: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !storeLocationId) return { success: false, error: 'Selected store required for removal' }
  try {
    if (!storeLocationId) throw new Error('Selected store required')
    await resolveFacilityStoreById(hospitalId, storeLocationId)
    let query = supabase.from('facility_drug_inventory').delete().eq('hospital_id', hospitalId).eq('store_location_id', storeLocationId)
    if (scheme !== 'all') {
      const { data, error } = await supabase.from('drugs').select('id').eq('hospital_id', hospitalId).eq('procurement_vote', scheme.toLowerCase())
      if (error) throw error
      if (!data?.length) return { success: true }
      query = query.in('drug_id', data.map(item => item.id))
    }
    const { error } = await query
    if (error) throw error
    return { success: true }
  } catch { return { success: false, error: 'Inventory removal failed' } }
}
