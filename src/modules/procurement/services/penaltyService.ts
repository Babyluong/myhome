import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { ApiResponse } from '@/types'
import type { SupplierPenalty, PenaltyStatus, PenaltyType } from '@/types/pharmacy'
import { getPurchaseOrderById as getPurchaseOrder } from './procurementService'
import { isApplOrder } from '@/shared/lib/utils'

export interface PenaltyFilter {
  status?: string
  search?: string
  supplier_id?: string
  penalty_type?: 'appl' | 'cc' | string
}

export interface PerformanceStandard {
  id: string
  code: string
  description_bm: string
  description_en: string | null
  penalty_formula: string
  penalty_type: string
  penalty_rate: number | null
  fixed_amount: number | null
  is_active: boolean
  sort_order: number
}

export interface PenaltyStats {
  total: number
  pending: number
  enforced: number
  waived: number
  approved: number
  appl_count: number
  cc_count: number
  appl_amount: number
  cc_amount: number
}

type PenaltyCreateInput = Omit<Partial<SupplierPenalty>, 'penalty_type'> & {
  penalty_type?: PenaltyType | 'appl' | 'cc'
}

interface PenaltyUpdateInput extends Partial<SupplierPenalty> {
  approved_by_name?: string
  approved_by_designation?: string
  do_number?: string
  performance_standards_violated?: string[]
  payment_kaedah?: number
  payment_reference?: string
  quantity?: number
  unit_price?: number
  total_order_value?: number
  failed_product_value?: number
  prepared_by_user_id?: string
  verified_by_user_id?: string
  prepared_by_name?: string
  prepared_by_designation?: string
  verified_by_name?: string
  verified_by_designation?: string
  prepared_at?: string
  verified_at?: string
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export async function createPenalty(
  data: PenaltyCreateInput
): Promise<ApiResponse<SupplierPenalty>> {
  try {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database not configured' }
    }

    const { data: penalty, error } = await supabase
      .from('pharmacy_penalties')
      .insert([data])
      .select()
      .single()

    if (error) throw error

    return { data: penalty, error: null }
  } catch (error) {
    console.error('Error creating penalty:', error)
    return { data: null, error: errorMessage(error, 'Failed to create penalty') }
  }
}

export interface PaginatedPenaltyResponse {
  data: SupplierPenalty[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error: string | null
}

interface PenaltyByIdRecord extends Omit<SupplierPenalty, 'status' | 'supplier' | 'purchase_order' | 'goods_receipt' | 'lpo'> {
  status: string
  approved_by?: string
  approved_at?: string
  penalty_paid?: boolean
  payment_kaedah?: number
  payment_reference?: string
  quantity?: number
  unit_price?: number
  total_order_value?: number
  failed_product_value?: number
  performance_standards_violated?: string[]
  prepared_by_user_id?: string
  verified_by_user_id?: string
  prepared_by_name?: string
  prepared_by_designation?: string
  verified_by_name?: string
  verified_by_designation?: string
  prepared_at?: string
  verified_at?: string
  supplier?: { id: string; company_name: string; address: string | null; phone: string | null; email: string | null; contact_person: string | null; registration_number: string | null } | null
  purchase_order?: {
    id: string
    po_number: string
    po_type: string
    order_date: string
    total_amount: number
    vote_code: string | null
    category: string | null
    items: Array<{
      id: string
      item_code: string | null
      item_name: string | null
      quantity_ordered: number
      unit_price: number
      total_price: number
      deliveries?: Array<{ id: string; delivery_number: string; quantity_late?: number; days_delayed?: number; is_penalty_applicable?: boolean }>
    }>
  } | null
  goods_receipt?: { id: string; gr_number: string; receipt_date: string; delivery_note_number: string | null } | null
  lpo?: { id: string; lpo_number: string; document_date: string; expected_delivery_date: string | null; document_url: string | null } | null
  order_tracking?: { item_code: string | null; item_name: string | null } | null
  receiving?: { receiving_date: string; do_number: string | null } | null
  prepared_by?: { id: string; full_name: string; jawatan: string | null } | null
  verified_by?: { id: string; full_name: string; jawatan: string | null } | null
  approved_by_user?: { id: string; full_name: string; jawatan: string | null } | null
}

export async function getPenalties(
  hospitalId: string,
  filter?: PenaltyFilter,
  page = 1,
  limit = 10
): Promise<PaginatedPenaltyResponse> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        error: null
      }
    }

    let query = supabase
      .from('pharmacy_penalties')
      .select(`
        *,
        supplier:suppliers(id, company_name, address),
        purchase_order:pharmacy_purchase_orders(id, po_number, po_type),
        goods_receipt:pharmacy_goods_receipts(id, gr_number, delivery_note_number),
        lpo:pharmacy_lpo(id, lpo_number, document_date, document_url),
        order_tracking:pharmacy_order_tracking(id, expected_delivery_date, actual_delivery_date, tarikh_serahan, kkm_contract_number),
        receiving:pharmacy_receiving(id, do_number)
      `, { count: 'exact' })
      .eq('hospital_id', hospitalId)

    if (filter?.penalty_type) {
      query = query.eq('penalty_type', filter.penalty_type)
    }

    if (filter?.status) {
      query = query.eq('status', filter.status)
    }

    if (filter?.supplier_id) {
      query = query.eq('supplier_id', filter.supplier_id)
    }

    // Handle pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      data: data as SupplierPenalty[],
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching penalties:', error)
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      error: errorMessage(error, 'Failed to fetch penalties')
    }
  }
}

export async function getPenaltyStats(hospitalId: string): Promise<ApiResponse<PenaltyStats>> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        data: {
          total: 0, pending: 0, enforced: 0, waived: 0, approved: 0,
          appl_count: 0, cc_count: 0,
          appl_amount: 0, cc_amount: 0
        },
        error: null
      }
    }

    const { data, error } = await supabase
      .from('pharmacy_penalties')
      .select('status, penalty_type, penalty_amount')
      .eq('hospital_id', hospitalId)

    if (error) throw error

    const stats = {
      total: data.length,
      pending: data.filter(p => p.status === 'pending').length,
      enforced: data.filter(p => p.status === 'enforced').length,
      waived: data.filter(p => p.status === 'waived').length,
      approved: data.filter(p => p.status === 'approved').length,
      appl_count: data.filter(p => p.penalty_type === 'appl').length,
      cc_count: data.filter(p => p.penalty_type === 'cc').length,
      appl_amount: data.filter(p => p.penalty_type === 'appl').reduce((s, p) => s + Number(p.penalty_amount || 0), 0),
      cc_amount: data.filter(p => p.penalty_type === 'cc').reduce((s, p) => s + Number(p.penalty_amount || 0), 0)
    }

    return { data: stats, error: null }
  } catch (error) {
    return { data: null, error: errorMessage(error, 'Failed to fetch penalty statistics') }
  }
}

/**
 * Fetches a single penalty by ID with full relational data
 */
export async function getPenaltyById(id: string): Promise<ApiResponse<PenaltyByIdRecord>> {
  try {
    if (!isSupabaseConfigured()) return { data: null, error: 'Database not configured' }

    const { data, error } = await supabase
      .from('pharmacy_penalties')
      .select(`
        *,
        supplier:suppliers(id, company_name, address, phone, email, contact_person, registration_number),
        purchase_order:pharmacy_purchase_orders(id, po_number, po_type, order_date, total_amount, vote_code, category, items:pharmacy_purchase_order_items(*)),
        goods_receipt:pharmacy_goods_receipts(id, gr_number, receipt_date, delivery_note_number),
        lpo:pharmacy_lpo(id, lpo_number, document_date, expected_delivery_date, document_url),
        order_tracking:pharmacy_order_tracking(id, expected_delivery_date, actual_delivery_date, tarikh_serahan, kkm_contract_number, item_name, item_code),
        receiving:pharmacy_receiving(id, receiving_date, do_number),
        prepared_by:users!pharmacy_penalties_prepared_by_user_id_fkey(id, full_name, jawatan),
        verified_by:users!pharmacy_penalties_verified_by_user_id_fkey(id, full_name, jawatan),
        approved_by_user:users!pharmacy_penalties_approved_by_fkey(id, full_name, jawatan)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Map performance standards UUIDs back to codes for the frontend
    if (data && data.performance_standards_violated && data.performance_standards_violated.length > 0) {
      const { data: standardsData, error: standardsError } = await supabase
        .from('penalty_performance_standards')
        .select('id, code')

      if (standardsError) throw standardsError
      
      if (standardsData && standardsData.length > 0) {
        const standards = standardsData as Array<{ id: string; code: string }>
        const idToCodeMap = new Map(standards.map(({ id, code }) => [id, code]))
        data.performance_standards_violated = data.performance_standards_violated
          .map((uid: string) => idToCodeMap.get(uid) || uid)
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching penalty by ID:', error)
    return { data: null, error: errorMessage(error, 'Failed to fetch penalty') }
  }
}

/**
 * Updates penalty details (items, amounts, signatures, etc.)
 */
export async function updatePenaltyDetails(
  id: string,
  updates: PenaltyUpdateInput
): Promise<ApiResponse<SupplierPenalty>> {
  try {
    if (!isSupabaseConfigured()) return { data: null, error: 'Database not configured' }

    // Strip out non-existent fields that are dynamically fetched
    const cleanedUpdates = { ...updates }
    delete cleanedUpdates.approved_by_name
    delete cleanedUpdates.approved_by_designation
    delete cleanedUpdates.do_number

    // Map performance standards codes to UUIDs if standard codes (like "PS05") are passed
    if (cleanedUpdates.performance_standards_violated && Array.isArray(cleanedUpdates.performance_standards_violated)) {
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
      const hasCodes = cleanedUpdates.performance_standards_violated.some(code => !isUuid(code))

      if (hasCodes) {
        const { data: standardsData, error: standardsError } = await supabase
          .from('penalty_performance_standards')
          .select('id, code')

        if (standardsError) throw standardsError
        
        if (standardsData && standardsData.length > 0) {
          const standards = standardsData as Array<{ id: string; code: string }>
          const codeToIdMap = new Map(standards.map(({ id, code }) => [code, id]))
          cleanedUpdates.performance_standards_violated = cleanedUpdates.performance_standards_violated
            .map(code => isUuid(code) ? code : codeToIdMap.get(code))
            .filter((val): val is string => !!val)
        }
      }
    }

    const { data, error } = await supabase
      .from('pharmacy_penalties')
      .update({ ...cleanedUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating penalty:', error)
    return { data: null, error: errorMessage(error, 'Failed to update penalty') }
  }
}

/**
 * Approves a penalty record
 */
export async function approvePenalty(
  id: string,
  userId: string
): Promise<ApiResponse<SupplierPenalty>> {
  try {
    if (!isSupabaseConfigured()) return { data: null, error: 'Database not configured' }

    const { data, error } = await supabase
      .from('pharmacy_penalties')
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error approving penalty:', error)
    return { data: null, error: errorMessage(error, 'Failed to approve penalty') }
  }
}

/**
 * Fetches the APPL performance standards config table
 */
export async function getPerformanceStandards(): Promise<ApiResponse<PerformanceStandard[]>> {
  try {
    if (!isSupabaseConfigured()) return { data: [], error: null }

    const { data, error } = await supabase
      .from('penalty_performance_standards')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return { data: data as PerformanceStandard[], error: null }
  } catch (error) {
    console.error('Error fetching performance standards:', error)
    return { data: [], error: errorMessage(error, 'Failed to fetch performance standards') }
  }
}

export async function updatePenaltyStatus(
  id: string,
  status: PenaltyStatus,
  userId: string,
  reason?: string
): Promise<ApiResponse<SupplierPenalty>> {
  try {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database not configured' }
    }

    const updates: Partial<SupplierPenalty> = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'enforced') {
      updates.enforced_by = userId
      updates.enforced_at = new Date().toISOString()
    } else if (status === 'waived') {
      updates.waiver_reason = reason
    }

    const { data, error } = await supabase
      .from('pharmacy_penalties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data: data as SupplierPenalty, error: null }
  } catch (error) {
    console.error('Error updating penalty:', error)
    return { data: null, error: errorMessage(error, 'Failed to update penalty') }
  }
}

/**
 * Deletes a penalty record and creates an audit log entry
 */
export async function deletePenalty(
  id: string,
  userId: string,
  reason: string
): Promise<ApiResponse<boolean>> {
  try {
    if (!isSupabaseConfigured()) {
      return { data: false, error: 'Database not configured' }
    }

    // Insert into approval_logs first for auditability
    const { error: auditError } = await supabase
      .from('approval_logs')
      .insert({
        entity_type: 'penalty',
        entity_id: id,
        action: 'deleted',
        approved_by: userId,
        notes: `Penalty deleted. Reason: ${reason}`,
        created_at: new Date().toISOString()
      })

    if (auditError) throw auditError

    // Perform actual deletion
    const { error } = await supabase
      .from('pharmacy_penalties')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: true, error: null }
  } catch (error) {
    console.error('Error deleting penalty:', error)
    return { data: false, error: errorMessage(error, 'Failed to delete penalty') }
  }
}

/**
 * Checks if a delivery is late and automatically creates a penalty record if so
 */
export async function checkAndCreateLatePenalty(
  hospitalId: string,
  userId: string,
  poId: string,
  grId: string,
  receiptDate: string,
  itemName?: string,
  itemCode?: string,
  lpoId?: string
): Promise<ApiResponse<SupplierPenalty | null>> {
  try {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Database not configured' }
    }

    // Get the PO to find the supplier
    const poRes = await getPurchaseOrder(poId)
    if (poRes.error || !poRes.data) {
      return { data: null, error: 'PO not found' }
    }

    const po = poRes.data
    
    // Check for existing penalty for this LPO / GR to prevent duplicates
    const actualLpoId = lpoId || po.lpo?.[0]?.id
    if (actualLpoId) {
      const { data: existingPenalty, error: existingPenaltyError } = await supabase
        .from('pharmacy_penalties')
        .select('id')
        .eq('lpo_id', actualLpoId)
        .maybeSingle()

      if (existingPenaltyError) throw existingPenaltyError

      if (existingPenalty) {
        console.log(`[PENALTY] Duplicate prevention: Penalty already exists for LPO ${actualLpoId}`);
        return { data: null, error: null }
      }
    } else if (grId) {
      const { data: existingPenalty, error: existingPenaltyError } = await supabase
        .from('pharmacy_penalties')
        .select('id')
        .eq('gr_id', grId)
        .maybeSingle()

      if (existingPenaltyError) throw existingPenaltyError

      if (existingPenalty) {
        console.log(`[PENALTY] Duplicate prevention: Penalty already exists for GR ${grId}`);
        return { data: null, error: null }
      }
    }

    // Try to find the expected delivery date (ETA) and associate item info
    let expectedDate = po.expected_delivery_date
    let resolvedTrackingId: string | undefined = undefined
    let resolvedItemName = itemName
    let resolvedItemCode = itemCode
    
    if (actualLpoId) {
      // 1. Always prioritize LPO-level expected delivery date first
      const { data: lpoData, error: lpoError } = await supabase
        .from('pharmacy_lpo')
        .select('expected_delivery_date')
        .eq('id', actualLpoId)
        .maybeSingle()

      if (lpoError) throw lpoError
        
      if (lpoData?.expected_delivery_date) {
        expectedDate = lpoData.expected_delivery_date
      }

      // 2. Try Tracking table to resolve specific tracking item and fallback ETA
      let query = supabase
        .from('pharmacy_order_tracking')
        .select('id, expected_delivery_date, item_name, item_code')
        .eq('lpo_id', actualLpoId)
      
      if (resolvedItemCode) {
        query = query.eq('item_code', resolvedItemCode)
      }

      const { data: trackingItems, error: trackingError } = await query.limit(1)
      if (trackingError) throw trackingError
      if (trackingItems && trackingItems.length > 0) {
        resolvedTrackingId = trackingItems[0].id
        if (!expectedDate && trackingItems[0].expected_delivery_date) {
          expectedDate = trackingItems[0].expected_delivery_date
        }
        if (!resolvedItemName) {
          resolvedItemName = trackingItems[0].item_name
        }
        if (!resolvedItemCode) {
          resolvedItemCode = trackingItems[0].item_code
        }
      }
    }

    if (!expectedDate) {
      console.warn(`[PENALTY] Skipping: No ETA found for PO ${poId} / LPO ${lpoId}`);
      return { data: null, error: null }
    }

    const expected = new Date(expectedDate)
    const actual = new Date(receiptDate)

    expected.setHours(0, 0, 0, 0)
    actual.setHours(0, 0, 0, 0)

    if (actual > expected) {
      const diffTime = Math.abs(actual.getTime() - expected.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Dynamically resolve penalty type ('appl' or 'cc') based on the PO's vote code or category
      const penaltyType: 'appl' | 'cc' = isApplOrder(po) ? 'appl' : 'cc'

      const penaltyData: PenaltyCreateInput = {
        hospital_id: hospitalId,
        supplier_id: po.supplier_id,
        po_id: po.id,
        gr_id: grId,
        lpo_id: actualLpoId,
        order_tracking_id: resolvedTrackingId,
        item_name: resolvedItemName,
        item_code: resolvedItemCode,
        penalty_type: penaltyType,
        days_delayed: diffDays,
        expected_delivery_date: expectedDate,
        actual_delivery_date: receiptDate,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        penalty_amount: 0,
        created_by: userId
      }

      return await createPenalty(penaltyData)
    }

    return { data: null, error: null }
  } catch (error) {
    console.error('Error checking late penalty:', error)
    return { data: null, error: errorMessage(error, 'Failed to check late penalty') }
  }
}
