import { offlineAdapter } from '@/services/offlineAdapter'
// src/modules/myprepacking/services/prepackService.ts
import { supabase } from '@/services/supabase'
import type { 
  PrepackItem, 
  PrepackBatch, 
  PrepackUsageLog, 
  PrepackDashboardStats,
  UsageTransactionType,
  DosageForm,
  PackType,
  PackageType,
  PrepackFormulationAuditLog
} from '../types/prepack'
import { recordAuditLog } from '@/services/auditLogService'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Helper to get default hospital ID from current session
 */
const getActiveHospitalId = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession()
  const hospitalId = (session?.user as any)?.hospital_id || 
                     (session?.user?.user_metadata as any)?.hospital_id
  if (hospitalId) return hospitalId
  
  try {
    const rawAuth = typeof window !== 'undefined' ? (sessionStorage.getItem('home-auth-storage') || localStorage.getItem('home-auth-storage')) : null
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth)
      if (parsed?.state?.user?.hospital_id) {
        return parsed.state.user.hospital_id
      }
    }
  } catch {}

  // Fallback to first hospital record
  const { data } = await supabase.from('hospitals').select('id').limit(1).single()
  return data?.id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'
}

import { recordPrepackProductionTransaction } from './prepackKewPs4Service'
import { KKM_GALENICAL_MASTER_DATABASE } from '../data/kkmGalenicalMasterDatabase'

/**
 * Fetch all prepack items with live aggregated stock balances and buffer status
 */
export const getPrepackItems = async (hospitalId?: string): Promise<{ data: PrepackItem[] | null; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()
    
    // 1. Fetch all items
    const { data: items, error: itemsError } = await supabase
      .from('prepack_items')
      .select('*')
      .eq('hospital_id', targetHospId)
      .order('item_name', { ascending: true })

    if (itemsError) throw itemsError
    if (!items || items.length === 0) return { data: [], error: null }

    // 2. Fetch all active batches to aggregate live balances
    const { data: batches, error: batchesError } = await supabase
      .from('prepack_batches')
      .select('*')
      .eq('hospital_id', targetHospId)
      .in('status', ['active', 'quarantined'])

    if (batchesError) throw batchesError

    // 3. Fetch facility_drug_inventory for bulk store balances
    const drugIds = items.map(i => i.drug_id).filter(Boolean)
    let facilityInventories: any[] = []
    if (drugIds.length > 0) {
      const { data: facData } = await supabase
        .from('facility_drug_inventory')
        .select('drug_id, facility_stock')
        .eq('hospital_id', targetHospId)
        .in('drug_id', drugIds)
      if (facData) facilityInventories = facData
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // 4. Map aggregates with 3-tier multi-echelon balances
    const aggregated: PrepackItem[] = items.map((item) => {
      const itemBatches = (batches || []).filter((b) => b.prepack_item_id === item.id)
      
      const totalBalance = itemBatches.reduce((acc, curr) => acc + (curr.current_balance || 0), 0)
      const nearExpiryCount = itemBatches.filter(
        (b) => b.current_balance > 0 && b.prepack_expiry_date >= todayStr && b.prepack_expiry_date <= sixtyDaysLater
      ).length

      const needsRepack = totalBalance <= item.min_buffer_level
      const matchedFac = facilityInventories.find(f => f.drug_id === item.drug_id)
      const storeStock = matchedFac?.facility_stock ?? 0
      const counterRaw = item.counter_raw_stock ?? 0
      const totalAggregate = storeStock + counterRaw + (totalBalance * (item.units_per_pack || 1))

      return {
        ...item,
        total_balance: totalBalance,
        store_bulk_stock: storeStock,
        counter_raw_stock: counterRaw,
        total_aggregate_units: totalAggregate,
        active_batches_count: itemBatches.filter(b => b.current_balance > 0).length,
        near_expiry_count: nearExpiryCount,
        needs_repack: needsRepack,
        batches: itemBatches
      }
    })

    return { data: aggregated, error: null }
  } catch (err: any) {
    console.error('Error in getPrepackItems:', err)
    return { data: null, error: err }
  }
}

/**
 * Fetch a single prepack item by ID with full batch details
 */
export const getPrepackItemById = async (id: string): Promise<{ data: PrepackItem | null; error: any }> => {
  try {
    const { data: item, error: itemError } = await supabase
      .from('prepack_items')
      .select('*')
      .eq('id', id)
      .single()

    if (itemError) throw itemError
    if (!item) return { data: null, error: null }

    const { data: batches, error: batchesError } = await supabase
      .from('prepack_batches')
      .select('*')
      .eq('prepack_item_id', id)
      .order('pack_date', { ascending: false })

    if (batchesError) throw batchesError

    const totalBalance = (batches || []).reduce((acc, b) => acc + (b.current_balance || 0), 0)

    return {
      data: {
        ...item,
        total_balance: totalBalance,
        needs_repack: totalBalance <= item.min_buffer_level,
        batches: batches || []
      },
      error: null
    }
  } catch (err: any) {
    console.error('Error in getPrepackItemById:', err)
    return { data: null, error: err }
  }
}

/**
 * Create a new standard prepack item master formulation
 */
export const createPrepackItem = async (itemData: Partial<PrepackItem>): Promise<{ data: PrepackItem | null; error: any }> => {
  try {
    const hospitalId = itemData.hospital_id || await getActiveHospitalId()
    const payload = {
      ...itemData,
      hospital_id: hospitalId,
      status: itemData.status || 'active',
      min_buffer_level: Number(itemData.min_buffer_level || 50),
      optimal_batch_size: Number(itemData.optimal_batch_size || 200),
      units_per_pack: Number(itemData.units_per_pack || 1),
      shelf_life_months: Number(itemData.shelf_life_months || 6)
    }

    const { data, error } = await supabase
      .from('prepack_items')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (err: any) {
    console.error('Error in createPrepackItem:', err)
    return { data: null, error: err }
  }
}

export interface FormulationEditorInfo {
  userId?: string | null
  userName?: string
  userRole?: string
  icNumber?: string
}

/**
 * Update an existing prepack item with strict revision tracking & audit logging
 */
export const updatePrepackItem = async (
  id: string, 
  itemData: Partial<PrepackItem>,
  editorInfo?: FormulationEditorInfo,
  customChangeSummary?: string
): Promise<{ data: PrepackItem | null; error: any }> => {
  try {
    // 1. Fetch current item state to compute exact revision diff
    const { data: currentItem } = await supabase
      .from('prepack_items')
      .select('*')
      .eq('id', id)
      .single()

    const updatePayload = {
      ...itemData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('prepack_items')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 2. Compute modified fields and audit log deltas
    if (currentItem && data) {
      const changedFields: string[] = []
      const oldValues: Record<string, any> = {}
      const newValues: Record<string, any> = {}

      const keysToTrack: (keyof PrepackItem)[] = [
        'item_code',
        'item_name',
        'generic_name',
        'pack_type',
        'dosage_form',
        'strength',
        'units_per_pack',
        'package_type',
        'min_buffer_level',
        'optimal_batch_size',
        'shelf_life_months',
        'storage_instructions',
        'label_instructions',
        'ingredients_formula',
        'indications',
        'standard_formula_breakdown',
        'preparation_steps',
        'equipment_required',
        'in_process_qc',
        'cautions_and_warnings',
        'beyond_use_date_days',
        'container_specs',
        'status'
      ]

      for (const key of keysToTrack) {
        if (key in itemData) {
          const oldVal = (currentItem as any)[key]
          const newVal = (itemData as any)[key]
          if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changedFields.push(key)
            oldValues[key] = oldVal ?? null
            newValues[key] = newVal ?? null
          }
        }
      }

      if (changedFields.length > 0) {
        // Build human readable clinical change summary
        const humanLabels: Record<string, string> = {
          item_code: 'Item Code',
          item_name: 'Formulation Name',
          generic_name: 'Generic Name',
          dosage_form: 'Dosage Form',
          strength: 'Strength / Concentration',
          units_per_pack: 'Pack Size / Volume',
          package_type: 'Packaging Container',
          min_buffer_level: 'Min Buffer Threshold',
          optimal_batch_size: 'Optimal Batch Size',
          shelf_life_months: 'Shelf Life',
          storage_instructions: 'Storage Conditions',
          label_instructions: 'Label Instructions',
          ingredients_formula: 'Master Formula',
          indications: 'Clinical Indications',
          standard_formula_breakdown: 'Ingredients Breakdown',
          preparation_steps: 'Compounding SOP Steps',
          equipment_required: 'Equipment Required',
          in_process_qc: 'In-Process QC',
          cautions_and_warnings: 'Cautions & Warnings',
          beyond_use_date_days: 'Beyond-Use-Date (BUD)',
          container_specs: 'Container Specs'
        }

        const summaryDesc = customChangeSummary || (
          `Updated formulation: ` + 
          changedFields.map(f => humanLabels[f] || f).join(', ')
        )

        const auditRow = {
          hospital_id: data.hospital_id,
          prepack_item_id: id,
          user_id: editorInfo?.userId || null,
          user_name: editorInfo?.userName || 'Hospital Pharmacist',
          user_role: editorInfo?.userRole || 'Registered Pharmacist',
          action: 'UPDATE',
          changed_fields: changedFields,
          old_values: oldValues,
          new_values: newValues,
          change_summary: summaryDesc,
          created_at: new Date().toISOString()
        }

        // Insert into dedicated prepack_formulation_audit_logs table
        const { error: auditError } = await supabase
          .from('prepack_formulation_audit_logs')
          .insert(auditRow)

        if (auditError) {
          console.warn('Could not record to prepack_formulation_audit_logs:', auditError)
        }

        // Mirror to central hospital audit_logs
        recordAuditLog({
          userId: editorInfo?.userId || undefined,
          action: 'UPDATE_FORMULATION',
          module: 'myprepacking',
          entityType: 'prepack_item',
          entityId: id,
          oldValues,
          newValues,
          details: summaryDesc
        }).catch(e => console.warn('Global audit error:', e))
      }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error('Error in updatePrepackItem:', err)
    return { data: null, error: err }
  }
}

/**
 * Fetch all revision audit logs for a prepack formulation
 */
export const getPrepackItemAuditLogs = async (
  prepackItemId: string
): Promise<{ data: PrepackFormulationAuditLog[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('prepack_formulation_audit_logs')
      .select('*')
      .eq('prepack_item_id', prepackItemId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (err: any) {
    console.error('Error in getPrepackItemAuditLogs:', err)
    return { data: null, error: err }
  }
}

/**
 * Toggle prepack item active/inactive status (facility-level toggle)
 */
export const togglePrepackItemActiveStatus = async (
  itemId: string,
  newStatus: 'active' | 'inactive'
): Promise<{ data: PrepackItem | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('prepack_items')
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (err: any) {
    console.error('Error in togglePrepackItemActiveStatus:', err)
    return { data: null, error: err }
  }
}

/**
 * Bulk set active/inactive status for all items in a category (e.g. 'internal' or 'external')
 */
export const bulkSetPrepackActiveStatus = async (
  packType: 'internal' | 'external' | 'all',
  newStatus: 'active' | 'inactive',
  hospitalId?: string
): Promise<{ success: boolean; count: number; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()
    let query = supabase
      .from('prepack_items')
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('hospital_id', targetHospId)

    if (packType !== 'all') {
      query = query.eq('pack_type', packType)
    }

    const { data, error } = await query.select('id')
    if (error) throw error
    return { success: true, count: data?.length || 0, error: null }
  } catch (err: any) {
    console.error('Error in bulkSetPrepackActiveStatus:', err)
    return { success: false, count: 0, error: err }
  }
}

/**
 * Synchronize KKM Galenical & Extemporaneous master database to hospital catalog.
 * Strict zero-mock mandate: inserts official KKM monographs directly into prepack_items.
 */
export const syncHospitalGalenicalCatalog = async (
  hospitalId?: string
): Promise<{ syncedCount: number; totalCount: number; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()

    // 1. Fetch existing item codes for this hospital
    const { data: existing, error: fetchErr } = await supabase
      .from('prepack_items')
      .select('item_code')
      .eq('hospital_id', targetHospId)

    if (fetchErr) throw fetchErr

    const existingCodes = new Set((existing || []).map(e => e.item_code))

    // 2. Update existing master items so formulas and indications match authoritative KKM standards (e.g. X-Temp Syrup)
    for (const item of KKM_GALENICAL_MASTER_DATABASE) {
      if (existingCodes.has(item.item_code)) {
        await supabase
          .from('prepack_items')
          .update({
            item_name: item.item_name,
            generic_name: item.generic_name,
            ingredients_formula: item.ingredients_formula || null,
            indications: item.indications || null,
            storage_instructions: item.storage_instructions,
            label_instructions: item.label_instructions,
            dosage_form: item.dosage_form,
            strength: item.strength,
            shelf_life_months: item.shelf_life_months
          })
          .eq('hospital_id', targetHospId)
          .eq('item_code', item.item_code)
      }
    }

    // 3. Filter master items that do not yet exist
    const toInsert = KKM_GALENICAL_MASTER_DATABASE.filter(m => !existingCodes.has(m.item_code))

    if (toInsert.length === 0) {
      return { syncedCount: 0, totalCount: KKM_GALENICAL_MASTER_DATABASE.length, error: null }
    }

    // 4. Prepare payload matching real schema
    const records = toInsert.map(item => ({
      hospital_id: targetHospId,
      item_code: item.item_code,
      item_name: item.item_name,
      generic_name: item.generic_name,
      pack_type: item.pack_type,
      dosage_form: item.dosage_form,
      strength: item.strength,
      units_per_pack: item.units_per_pack,
      package_type: item.package_type,
      min_buffer_level: item.min_buffer_level,
      optimal_batch_size: item.optimal_batch_size,
      shelf_life_months: item.shelf_life_months,
      storage_instructions: item.storage_instructions,
      label_instructions: item.label_instructions,
      ingredients_formula: item.ingredients_formula || null,
      indications: item.indications || null,
      counter_raw_stock: 0,
      status: item.default_active ? 'active' : 'inactive'
    }))

    // 5. Batch insert into Supabase in safe chunks of 50
    const chunkSize = 50
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize)
      const { error: insertErr } = await supabase
        .from('prepack_items')
        .insert(chunk)

      if (insertErr) throw insertErr
    }

    return { 
      syncedCount: records.length, 
      totalCount: KKM_GALENICAL_MASTER_DATABASE.length, 
      error: null 
    }
  } catch (err: any) {
    console.error('Error in syncHospitalGalenicalCatalog:', err)
    return { syncedCount: 0, totalCount: 0, error: err }
  }
}

/**
 * Fetch prepack batches with status and days to expiry
 */
export const getPrepackBatches = async (
  hospitalId?: string,
  filter?: { itemId?: string; status?: string }
): Promise<{ data: PrepackBatch[] | null; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()
    
    let query = supabase
      .from('prepack_batches')
      .select(`
        *,
        prepack_item:prepack_items (
          id,
          item_code,
          item_name,
          generic_name,
          pack_type,
          dosage_form,
          strength,
          package_type,
          units_per_pack,
          storage_instructions,
          label_instructions
        )
      `)
      .eq('hospital_id', targetHospId)
      .order('created_at', { ascending: false })

    if (filter?.itemId) {
      query = query.eq('prepack_item_id', filter.itemId)
    }
    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status)
    }

    const { data, error } = await query

    if (error) throw error
    if (!data) return { data: [], error: null }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const processed: PrepackBatch[] = data.map((b: any) => {
      const expDate = new Date(b.prepack_expiry_date)
      expDate.setHours(0, 0, 0, 0)
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const isExpired = diffDays < 0
      const isNearExpiry = diffDays >= 0 && diffDays <= 60

      let finalStatus = b.status
      if (b.current_balance === 0 && finalStatus === 'active') {
        finalStatus = 'depleted'
      } else if (isExpired && finalStatus === 'active') {
        finalStatus = 'expired'
      }

      return {
        ...b,
        status: finalStatus,
        days_to_expiry: diffDays,
        is_expired: isExpired,
        is_near_expiry: isNearExpiry
      }
    })

    return { data: processed, error: null }
  } catch (err: any) {
    console.error('Error in getPrepackBatches:', err)
    return { data: null, error: err }
  }
}

/**
 * Generate next unique batch number based on current year/month
 * Format: UOD-YYMM-XXX or PPB-YYMM-XXX
 */
export const generateNextBatchNumber = async (packType: string, hospitalId?: string): Promise<string> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    let prefixCode = 'PPB'
    if (packType === 'uod') prefixCode = 'UOD'
    else if (packType === 'internal') prefixCode = 'INT'
    else if (packType === 'external') prefixCode = 'EXT'
    const prefix = `${prefixCode}-${yy}${mm}`

    const { data, error } = await supabase
      .from('prepack_batches')
      .select('batch_number')
      .eq('hospital_id', targetHospId)
      .like('batch_number', `${prefix}-%`)
      .order('batch_number', { ascending: false })
      .limit(1)

    if (error) throw error

    let nextSeq = 1
    if (data && data.length > 0) {
      const lastCode = data[0].batch_number
      const parts = lastCode.split('-')
      const num = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(num)) {
        nextSeq = num + 1
      }
    }

    return `${prefix}-${String(nextSeq).padStart(3, '0')}`
  } catch (err) {
    console.error('Error generating batch number:', err)
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    let fallbackCode = 'PPB'
    if (packType === 'uod') fallbackCode = 'UOD'
    else if (packType === 'internal') fallbackCode = 'INT'
    else if (packType === 'external') fallbackCode = 'EXT'
    return `${fallbackCode}-${yy}${mm}-001`
  }
}

/**
 * Calculate Default Beyond-Use Expiry Date
 * Rule: min(mfgExpiry, packDate + shelfLifeMonths)
 */
export const calculateDefaultExpiryDate = (
  packDateStr: string,
  mfgExpiryStr: string,
  shelfLifeMonths: number = 6
): string => {
  try {
    const packDate = new Date(packDateStr)
    const budDate = new Date(packDate)
    budDate.setMonth(budDate.getMonth() + shelfLifeMonths)

    const mfgDate = new Date(mfgExpiryStr)

    // Take the earlier date
    const finalDate = budDate < mfgDate ? budDate : mfgDate
    return finalDate.toISOString().split('T')[0]
  } catch {
    return mfgExpiryStr
  }
}

/**
 * Create a new prepacking batch (Production Run)
 */
export const createPrepackBatch = async (batchData: {
  hospital_id?: string
  prepack_item_id: string
  batch_number: string
  mfg_batch_number: string
  mfg_expiry_date: string
  pack_date?: string
  prepack_expiry_date: string
  quantity_packed: number
  wastage_quantity?: number
  packed_by?: string
  packed_by_name?: string
  verified_by?: string
  verified_by_name?: string
  verification_notes?: string
}): Promise<{ data: PrepackBatch | null; error: any }> => {
  try {
    const hospitalId = batchData.hospital_id || await getActiveHospitalId()
    const qty = Number(batchData.quantity_packed)
    const wastage = Number(batchData.wastage_quantity || 0)

    // Generate QR payload
    const qrData = JSON.stringify({
      h: hospitalId.slice(0, 8),
      i: batchData.prepack_item_id.slice(0, 8),
      b: batchData.batch_number,
      exp: batchData.prepack_expiry_date,
      q: qty
    })

    const payload = {
      hospital_id: hospitalId,
      prepack_item_id: batchData.prepack_item_id,
      batch_number: batchData.batch_number.trim(),
      mfg_batch_number: batchData.mfg_batch_number.trim(),
      mfg_expiry_date: batchData.mfg_expiry_date,
      pack_date: batchData.pack_date || new Date().toISOString().split('T')[0],
      prepack_expiry_date: batchData.prepack_expiry_date,
      quantity_packed: qty,
      current_balance: qty, // Starts equal to total packed
      wastage_quantity: wastage,
      packed_by: batchData.packed_by || null,
      packed_by_name: batchData.packed_by_name || null,
      verified_by: batchData.verified_by || null,
      verified_by_name: batchData.verified_by_name || null,
      verification_status: 'verified',
      verification_notes: batchData.verification_notes || null,
      qr_code_data: qrData,
      status: 'active'
    }

    let data: any = null;
    let error: any = null;

    try {
      const res = await supabase
        .from('prepack_batches')
        .insert(payload)
        .select(`
          *,
          prepack_item:prepack_items (
            id, item_code, item_name, pack_type, dosage_form, strength, package_type, units_per_pack
          )
        `)
        .single();
      data = res.data;
      error = res.error;
    } catch (networkErr) {
      error = networkErr;
    }

    // Offline fallback: enqueue mutation and update local optimistic cache
    if (error) {
      const offlineRes = await offlineAdapter.executeMutation<PrepackBatch>({
        module: 'myprepacking',
        table: 'prepack_batches',
        action: 'INSERT',
        payload: { ...payload, id: `prepack_batch_${Date.now()}` } as any,
        conflictPolicy: 'server-wins'
      });
      if (offlineRes.data) {
        return { data: offlineRes.data, error: null };
      }
      throw error;
    }

    if (data) {
      try {
        await recordPrepackProductionTransaction({
          hospital_id: hospitalId,
          prepack_item_id: batchData.prepack_item_id,
          batch_id: data.id,
          batch_number: data.batch_number,
          mfg_batch_number: data.mfg_batch_number,
          mfg_expiry_date: data.mfg_expiry_date,
          prepack_expiry_date: data.prepack_expiry_date,
          quantity_packed: qty,
          units_per_pack: (data.prepack_item as any)?.units_per_pack || 1,
          wastage_quantity: wastage,
          officer_name: batchData.packed_by_name || 'Penolong Pegawai Farmasi',
          officer_id: batchData.packed_by,
          deduct_from_store_directly: (batchData as any).deduct_from_store_directly
        })
      } catch (kewpsErr) {
        console.warn('Could not record KEW.PS-4 transaction for batch:', kewpsErr)
      }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error('Error in createPrepackBatch:', err)
    return { data: null, error: err }
  }
}

/**
 * Record stock usage or ward distribution (FIFO-friendly stock deduction)
 */
export const recordPrepackUsage = async (usageData: {
  hospital_id?: string
  batch_id: string
  prepack_item_id: string
  transaction_type: UsageTransactionType
  quantity: number
  department_id?: string
  ward_name?: string
  recipient_name?: string
  issued_by?: string
  issued_by_name?: string
  reference_no?: string
  remarks?: string
}): Promise<{ success: boolean; error: any }> => {
  try {
    const hospitalId = usageData.hospital_id || await getActiveHospitalId()
    const qtyToDeduct = Number(usageData.quantity)

    if (qtyToDeduct <= 0) {
      throw new Error('Kuantiti penggunaan mestilah lebih daripada 0.')
    }

    // 1. Fetch current batch balance
    const { data: batch, error: batchFetchError } = await supabase
      .from('prepack_batches')
      .select('id, current_balance, status')
      .eq('id', usageData.batch_id)
      .single()

    if (batchFetchError) throw batchFetchError
    if (!batch) throw new Error('Batch tidak dijumpai.')

    if (batch.current_balance < qtyToDeduct) {
      throw new Error(`Baki stok batch tidak mencukupi. Baki sedia ada: ${batch.current_balance}, Dimohon: ${qtyToDeduct}`)
    }

    const newBalance = batch.current_balance - qtyToDeduct
    const newStatus = newBalance === 0 ? 'depleted' : batch.status

    // 2. Update batch balance
    const { error: batchUpdateError } = await supabase
      .from('prepack_batches')
      .update({
        current_balance: newBalance,
        status: newStatus
      })
      .eq('id', usageData.batch_id)

    if (batchUpdateError) throw batchUpdateError

    // 3. Insert usage log
    const { error: logInsertError } = await supabase
      .from('prepack_usage_logs')
      .insert({
        hospital_id: hospitalId,
        batch_id: usageData.batch_id,
        prepack_item_id: usageData.prepack_item_id,
        transaction_type: usageData.transaction_type,
        quantity: qtyToDeduct,
        department_id: usageData.department_id || null,
        ward_name: usageData.ward_name || null,
        recipient_name: usageData.recipient_name || null,
        issued_by: usageData.issued_by || null,
        issued_by_name: usageData.issued_by_name || null,
        reference_no: usageData.reference_no || null,
        remarks: usageData.remarks || null
      })

    if (logInsertError) throw logInsertError

    // 4. Log in KEW.PS-4 transactions as counter dispensing
    try {
      const docNo = usageData.reference_no || `DSP-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
      await supabase
        .from('prepack_kewps4_transactions')
        .insert({
          hospital_id: hospitalId,
          prepack_item_id: usageData.prepack_item_id,
          batch_id: usageData.batch_id,
          transaction_date: new Date().toISOString(),
          transaction_type: 'counter_dispense',
          transaction_number: docNo,
          source_destination: `Agihan Kaunter: ${usageData.ward_name || usageData.recipient_name || 'Unit/Wad'}`,
          receipt_qty: null,
          issue_qty: qtyToDeduct,
          balance_qty: newBalance,
          balance_type: 'finished_pack',
          officer_name: usageData.issued_by_name || 'Pegawai Farmasi',
          officer_id: usageData.issued_by || null,
          reference_no: docNo,
          remarks: usageData.remarks || `Agihan ${qtyToDeduct} pek kepada ${usageData.ward_name || 'Wad/Unit'}`
        })
    } catch (kErr) {
      console.warn('Could not log KEW.PS-4 transaction for dispense:', kErr)
    }

    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error in recordPrepackUsage:', err)
    return { success: false, error: err }
  }
}

/**
 * Fetch usage logs
 */
export const getPrepackUsageLogs = async (
  hospitalId?: string,
  limit: number = 100
): Promise<{ data: PrepackUsageLog[] | null; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()

    const { data, error } = await supabase
      .from('prepack_usage_logs')
      .select(`
        *,
        batch:prepack_batches (
          id, batch_number, prepack_expiry_date, mfg_batch_number
        ),
        prepack_item:prepack_items (
          id, item_code, item_name, pack_type, dosage_form, strength
        )
      `)
      .eq('hospital_id', targetHospId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data: data || [], error: null }
  } catch (err: any) {
    console.error('Error in getPrepackUsageLogs:', err)
    return { data: null, error: err }
  }
}

/**
 * Get aggregated dashboard statistics
 */
export const getPrepackDashboardStats = async (hospitalId?: string): Promise<{ data: PrepackDashboardStats | null; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()
    const todayStr = new Date().toISOString().split('T')[0]
    const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // 1. Fetch items
    const { data: itemsRes, error: itemsError } = await getPrepackItems(targetHospId)
    if (itemsError) throw itemsError
    const items = itemsRes || []

    // 2. Fetch batches
    const { data: batchesRes, error: batchesError } = await getPrepackBatches(targetHospId)
    if (batchesError) throw batchesError
    const batches = batchesRes || []

    // 3. Fetch count of transfers
    const { count: transfersCount } = await supabase
      .from('prepack_transfers')
      .select('*', { count: 'exact', head: true })
      .eq('hospital_id', targetHospId)

    const totalUnits = items.reduce((acc, it) => acc + (it.total_balance || 0), 0)
    const totalStoreBulk = items.reduce((acc, it) => acc + (it.store_bulk_stock || 0), 0)
    const totalCounterRaw = items.reduce((acc, it) => acc + (it.counter_raw_stock || 0), 0)

    const itemsNeedingRepack = items.filter(it => it.needs_repack)
    const zeroStockItems = items.filter(it => (it.total_balance ?? 0) <= 0)
    const expiringSoon = batches.filter(b => b.current_balance > 0 && b.is_near_expiry)
    
    // Today's packed output
    const todayBatches = batches.filter(b => b.pack_date === todayStr)
    const todayUnits = todayBatches.reduce((acc, b) => acc + (b.quantity_packed || 0), 0)

    const stats: PrepackDashboardStats = {
      total_items: items.length,
      total_units_in_stock: totalUnits,
      total_store_bulk_units: totalStoreBulk,
      total_counter_raw_units: totalCounterRaw,
      total_transfers_count: transfersCount || 0,
      items_needing_repack: itemsNeedingRepack.length,
      zero_stock_items: zeroStockItems.length,
      batches_expiring_soon: expiringSoon.length,
      today_packed_units: todayUnits,
      recent_batches: batches.slice(0, 8),
      critical_items: itemsNeedingRepack
    }

    return { data: stats, error: null }
  } catch (err: any) {
    console.error('Error in getPrepackDashboardStats:', err)
    return { data: null, error: err }
  }
}

/**
 * Export Prepacking Inventory & Batches to Excel
 */
export const exportPrepackReportExcel = (
  items: PrepackItem[],
  batches: PrepackBatch[],
  usageLogs: PrepackUsageLog[]
) => {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Master Inventory & Buffer Health
  const itemsSheetData = items.map((i) => ({
    'Kod Item': i.item_code,
    'Nama UOD / Prepack': i.item_name,
    'Nama Generik': i.generic_name || '-',
    'Kategori': i.pack_type.toUpperCase(),
    'Bentuk Dos': i.dosage_form,
    'Kekuatan': i.strength || '-',
    'Unit per Pek': i.units_per_pack,
    'Baki Semasa': i.total_balance ?? 0,
    'Paras Penimbal (Buffer)': i.min_buffer_level,
    'Status Stok': (i.total_balance ?? 0) <= i.min_buffer_level ? 'PERLU PREPACK' : 'MENCUKUPI'
  }))
  const wsItems = XLSX.utils.json_to_sheet(itemsSheetData)
  XLSX.utils.book_append_sheet(wb, wsItems, 'Baki & Status Stok')

  // Sheet 2: Production Batches
  const batchesSheetData = batches.map((b) => ({
    'No. Batch Prepack': b.batch_number,
    'Item': b.prepack_item?.item_name || '-',
    'No. Batch Pengeluar': b.mfg_batch_number,
    'Tarikh Luput Asal': b.mfg_expiry_date,
    'Tarikh Pek': b.pack_date,
    'Tarikh Luput Prepack (BUD)': b.prepack_expiry_date,
    'Kuantiti Pek': b.quantity_packed,
    'Baki Semasa': b.current_balance,
    'Pembungkus': b.packed_by_name || '-',
    'Pemeriksa': b.verified_by_name || '-',
    'Status': b.status.toUpperCase()
  }))
  const wsBatches = XLSX.utils.json_to_sheet(batchesSheetData)
  XLSX.utils.book_append_sheet(wb, wsBatches, 'Senarai Batch')

  // Sheet 3: Usage History
  const usageSheetData = usageLogs.map((u) => ({
    'Tarikh & Masa': new Date(u.created_at).toLocaleString('ms-MY'),
    'Item': u.prepack_item?.item_name || '-',
    'Batch No': u.batch?.batch_number || '-',
    'Jenis Transaksi': u.transaction_type,
    'Kuantiti': u.quantity,
    'Wad / Unit Destinasi': u.ward_name || '-',
    'Penerima': u.recipient_name || '-',
    'No. Rujukan': u.reference_no || '-'
  }))
  const wsUsage = XLSX.utils.json_to_sheet(usageSheetData)
  XLSX.utils.book_append_sheet(wb, wsUsage, 'Log Penggunaan Wad')

  XLSX.writeFile(wb, `Laporan_MyPrepacking_${new Date().toISOString().split('T')[0]}.xlsx`)
}

/**
 * Generate Official Ministry of Health PDF Report
 */
export const generatePrepackPdfReport = (
  items: PrepackItem[],
  batches: PrepackBatch[],
  usageLogs: PrepackUsageLog[],
  hospitalName: string = 'HOSPITAL LAWAS'
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Header
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('KEMENTERIAN KESIHATAN MALAYSIA', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`JABATAN FARMASI - ${hospitalName}`, 105, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`LAPORAN KEMAJUAN & BAKI PREPACKING / UNIT OF DOSE (UOD)`, 105, 28, { align: 'center' })
  doc.text(`Tarikh Dijana: ${new Date().toLocaleDateString('ms-MY')} ${new Date().toLocaleTimeString('ms-MY')}`, 105, 34, { align: 'center' })

  doc.setLineWidth(0.5)
  doc.line(14, 38, 196, 38)

  // Section 1: Summary Table
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('1. STATUS BAKI STOK & AMARAN PENIMBAL (BUFFER LEVEL)', 14, 45)

  const itemsTableData = items.map((i, index) => [
    index + 1,
    i.item_code,
    i.item_name,
    i.pack_type.toUpperCase(),
    i.total_balance ?? 0,
    i.min_buffer_level,
    (i.total_balance ?? 0) <= i.min_buffer_level ? 'PERLU PREPACK' : 'MENCUKUPI'
  ])

  autoTable(doc, {
    startY: 48,
    head: [['No.', 'Kod', 'Nama UOD / Prepack', 'Jenis', 'Baki', 'Buffer', 'Status']],
    body: itemsTableData,
    theme: 'grid',
    headStyles: { fillColor: [13, 148, 136] }, // Teal header
    styles: { fontSize: 8 },
    columnStyles: {
      6: { fontStyle: 'bold' }
    }
  })

  // Section 2: Recent Batches Table
  const finalY = (doc as any).lastAutoTable.finalY || 120

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('2. REKOD PENGELUARAN BATCH TERKINI', 14, finalY + 12)

  const batchesTableData = batches.slice(0, 15).map((b, index) => [
    index + 1,
    b.batch_number,
    b.prepack_item?.item_name || '-',
    b.pack_date,
    b.prepack_expiry_date,
    b.quantity_packed,
    b.current_balance,
    b.status.toUpperCase()
  ])

  autoTable(doc, {
    startY: finalY + 16,
    head: [['No.', 'Batch No', 'Item', 'Tarikh Pek', 'Tarikh Luput', 'Pek', 'Baki', 'Status']],
    body: batchesTableData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8 }
  })

  // Signatures at footer
  const signY = 265
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Disediakan Oleh:', 20, signY)
  doc.line(20, signY + 12, 70, signY + 12)
  doc.text('(Penolong Pegawai Farmasi)', 20, signY + 17)

  doc.text('Disahkan Oleh:', 140, signY)
  doc.line(140, signY + 12, 190, signY + 12)
  doc.text('(Pegawai Farmasi Y/M)', 140, signY + 17)

  doc.save(`Laporan_Prepacking_${hospitalName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
}

export interface FacilityCatalogDrugOption {
  id: string
  drug_code: string
  drug_name: string
  generic_name?: string | null
  brand_name?: string | null
  dosage_form?: string | null
  strength?: string | null
  storage_conditions?: string | null
  packaging_description?: string | null
  unit_of_measure?: string | null
  min_buffer_level?: number | null
  facility_stock?: number | null
  location?: string | null
}

/**
 * Extract drug strength from text (e.g., "Amlodipine 10 mg Tablet" -> "10 mg")
 */
export const extractDrugStrength = (drugNameOrStrength?: string | null): string => {
  if (!drugNameOrStrength) return ''
  const clean = drugNameOrStrength.replace(/\([^)]*\)/g, ' ').trim()
  const regex = /(\d+(?:\.\d+)?)\s*(mg|mcg|ug|g|ml|iu|IU|%)(?:\s*\/\s*(\d+(?:\.\d+)?)\s*(ml|mg|g))?/gi
  const matches = clean.match(regex)
  if (matches && matches.length > 0) {
    return matches.join(' / ')
  }
  return ''
}

/**
 * Adjust pharmaceutical strength based on units per pack / fraction factor
 * e.g. base "10 mg" with factor 0.5 (1/2) -> "5 mg"
 * e.g. base "10 mg" with factor 2 -> "20 mg"
 * e.g. base "500 mg" with factor 0.5 (1/2) -> "250 mg"
 */
export const calculateAdjustedStrength = (
  baseStrengthStr?: string | null,
  quantityFactor: number = 1
): string => {
  if (!baseStrengthStr || !baseStrengthStr.trim()) return ''
  if (!quantityFactor || isNaN(quantityFactor) || quantityFactor <= 0) return baseStrengthStr

  const hasUnit = /(\d+(?:\.\d+)?)\s*(mg|mcg|ug|g|ml|iu|IU|%)/i.test(baseStrengthStr)
  if (hasUnit) {
    return baseStrengthStr.replace(
      /(\d+(?:\.\d+)?)\s*(mg|mcg|ug|g|ml|iu|IU|%)/gi,
      (match, numStr, unit) => {
        const num = parseFloat(numStr)
        if (isNaN(num)) return match
        const calculated = parseFloat((num * quantityFactor).toFixed(4))
        const hasSpace = match.includes(' ')
        return hasSpace ? `${calculated} ${unit}` : `${calculated}${unit}`
      }
    )
  }

  const plainNum = parseFloat(baseStrengthStr.trim())
  if (!isNaN(plainNum)) {
    return parseFloat((plainNum * quantityFactor).toFixed(4)).toString()
  }

  return baseStrengthStr
}

/**
 * Parses user input that might be a fraction like "1/2", "1/4", "3/4" or a decimal/integer like "0.5", "2"
 */
export const parseUnitQuantity = (input: string | number): number => {
  if (typeof input === 'number') return input
  const str = (input || '').toString().trim()
  if (!str) return 1
  if (str.includes('/')) {
    const parts = str.split('/')
    if (parts.length === 2) {
      const num = parseFloat(parts[0])
      const denom = parseFloat(parts[1])
      if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
        return num / denom
      }
    }
  }
  const parsed = parseFloat(str)
  return isNaN(parsed) || parsed <= 0 ? 1 : parsed
}

/**
 * Formats unit quantity for display (e.g. 0.5 -> "1/2", 0.25 -> "1/4", 0.75 -> "3/4", 1 -> "1", 2 -> "2")
 */
export const formatUnitQuantityDisplay = (val: number): string => {
  if (Math.abs(val - 0.5) < 0.001) return '1/2'
  if (Math.abs(val - 0.25) < 0.001) return '1/4'
  if (Math.abs(val - 0.75) < 0.001) return '3/4'
  if (Math.abs(val - 1.5) < 0.001) return '1 1/2'
  return val.toString()
}

export const normalizeDosageForm = (formStr?: string | null): DosageForm => {
  if (!formStr) return 'tablet'
  const f = formStr.toLowerCase().trim()
  if (f.includes('tablet') || f.includes('tab') || f.includes('caplet')) return 'tablet'
  if (f.includes('capsule') || f.includes('kapsul') || f.includes('cap')) return 'capsule'
  if (f.includes('syrup') || f.includes('sirap') || f.includes('elixir') || f.includes('linctus')) return 'syrup'
  if (f.includes('suspension') || f.includes('suspensi')) return 'suspension'
  if (f.includes('cream') || f.includes('krim')) return 'cream'
  if (f.includes('ointment') || f.includes('salap') || f.includes('gel')) return 'ointment'
  if (f.includes('drop') || f.includes('titik') || f.includes('titis')) return 'drops'
  if (f.includes('solution') || f.includes('larutan') || f.includes('liquid') || f.includes('mixture') || f.includes('mouthwash')) return 'solution'
  if (f.includes('powder') || f.includes('serbuk') || f.includes('granule')) return 'powder'
  return 'other'
}

export const mapPackageAndPackType = (
  dosageForm: DosageForm,
  preferredMode: 'uod' | 'prepack' | 'internal' | 'external' = 'prepack'
): { pack_type: PackType; package_type: PackageType; units_per_pack: number } => {
  if (preferredMode === 'uod') {
    return {
      pack_type: 'uod',
      package_type: 'sachet',
      units_per_pack: 1
    }
  }

  if (preferredMode === 'internal') {
    return {
      pack_type: 'internal',
      package_type: 'amber_bottle',
      units_per_pack: 1
    }
  }

  if (preferredMode === 'external') {
    return {
      pack_type: 'external',
      package_type: (dosageForm === 'cream' || dosageForm === 'ointment') ? 'ointment_jar' : 'clear_bottle',
      units_per_pack: 1
    }
  }

  // Prepack mode
  if (dosageForm === 'syrup' || dosageForm === 'suspension' || dosageForm === 'solution' || dosageForm === 'drops') {
    return {
      pack_type: 'prepack_liquid',
      package_type: 'amber_bottle',
      units_per_pack: 60
    }
  }
  if (dosageForm === 'cream' || dosageForm === 'ointment') {
    return {
      pack_type: 'prepack_cream',
      package_type: 'ointment_jar',
      units_per_pack: 15
    }
  }
  if (dosageForm === 'tablet' || dosageForm === 'capsule') {
    return {
      pack_type: 'prepack_tablet',
      package_type: 'plastic_envelope',
      units_per_pack: 10
    }
  }
  return {
    pack_type: 'extemporaneous',
    package_type: 'amber_bottle',
    units_per_pack: 1
  }
}

/**
 * Helper to resolve the Inpatient Pharmacy store location ID.
 * Defaults to official LOC-IPD-01 (Farmasi Pesakit Dalam).
 */
export const getInpatientStoreLocationId = async (hospitalId: string): Promise<string> => {
  const { resolveFacilityStore } = await import('@/services/pharmacy/facilityStoreService')
  return (await resolveFacilityStore(hospitalId, 'IPD')).id
}

/**
 * Searches the facility drug catalog for Inpatient Pharmacy (Farmasi Pesakit Dalam).
 * Strictly queries facility_drug_inventory scoped to the Inpatient Pharmacy store location.
 * Eliminates unconstrained fallback to the 3,500+ national master drug catalog.
 */
export const searchFacilityCatalogDrugs = async (
  query: string = '',
  hospitalId?: string,
  storeLocationId?: string
): Promise<{ data: FacilityCatalogDrugOption[]; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()
    const targetStoreId = storeLocationId || await getInpatientStoreLocationId(targetHospId)
    const { resolveFacilityStoreById } = await import('@/services/pharmacy/facilityStoreService')
    await resolveFacilityStoreById(targetHospId, targetStoreId)
    const cleanQuery = query.trim()

    // 1. Query facility_drug_inventory for Inpatient Pharmacy
    try {
      let facQuery = supabase
        .from('facility_drug_inventory')
        .select(`
          id,
          hospital_id,
          drug_id,
          facility_stock,
          min_buffer_level,
          location,
          store_location_id,
          department_id,
          drug:drugs!inner (
            id,
            drug_code,
            drug_name,
            generic_name,
            brand_name,
            dosage_form,
            strength,
            storage_conditions,
            packaging_description,
            unit_of_measure
          )
        `)
        .eq('hospital_id', targetHospId)
        .eq('store_location_id', targetStoreId)

      if (cleanQuery) {
        facQuery = facQuery.or(
          `drug_name.ilike.%${cleanQuery}%,generic_name.ilike.%${cleanQuery}%,drug_code.ilike.%${cleanQuery}%,brand_name.ilike.%${cleanQuery}%`,
          { foreignTable: 'drug' }
        )
      }

      const { data: facData, error: facErr } = await facQuery.limit(500)

      if (facErr) throw new Error('Facility catalog lookup unavailable')
      if (facData && facData.length > 0) {
        const mapped: FacilityCatalogDrugOption[] = []
        for (const row of facData) {
          const d = (row as any).drug
          if (!d) continue

          mapped.push({
            id: d.id,
            drug_code: d.drug_code || '',
            drug_name: d.drug_name || '',
            generic_name: d.generic_name,
            brand_name: d.brand_name,
            dosage_form: d.dosage_form,
            strength: d.strength || extractDrugStrength(d.drug_name || d.generic_name),
            storage_conditions: d.storage_conditions,
            packaging_description: d.packaging_description,
            unit_of_measure: d.unit_of_measure,
            min_buffer_level: row.min_buffer_level,
            facility_stock: row.facility_stock ?? null,
            location: row.location
          })
        }

        // Sort alphabetically by drug name
        mapped.sort((a, b) => (a.drug_name || '').localeCompare(b.drug_name || ''))

        return { data: mapped, error: null }
      }

      // If PostgREST foreignTable filter yielded no rows and no error, return empty search result
      if (!facErr) {
        return { data: [], error: null }
      }
    } catch {
      throw new Error('Facility catalog lookup unavailable')
    }
    return { data: [], error: null }
  } catch (err: any) {
    console.error('Error in searchFacilityCatalogDrugs:', err)
    return { data: [], error: err }
  }
}
