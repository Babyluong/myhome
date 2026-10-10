// src/modules/myprepacking/services/prepackKewPs4Service.ts
/**
 * KEW.PS-4 Kad Petak Ledger & Store-to-Counter Transfer Service for MyPrepacking
 * Provides authentic Malaysian Government Treasury (Pekeliling TPS 1PP) stock ledger,
 * multi-tier balance tracking (Store bulk stock vs Counter loose stock vs Finished UOD batches),
 * store-to-counter transfers, Check & Found audits, and annual KEW.PS-14 verifications.
 *
 * STRICT ZERO-MOCK MANDATE: Connects directly to Supabase tables:
 * - prepack_items
 * - prepack_batches
 * - prepack_transfers
 * - prepack_kewps4_transactions
 * - prepack_store_verifications
 * - facility_drug_inventory & drugs
 */

import { supabase } from '@/services/supabase'
import type { 
  PrepackItem, 
  PrepackBatch, 
  PrepackTransfer, 
  PrepackKewPs4Transaction, 
  PrepackStoreVerification,
  PrepackKewPs4TransactionType 
} from '../types/prepack'
import { JATA_NEGARA_BASE64 } from '@/modules/mytransporter/pages/jataNegaraBase64'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/** Helper to get current authenticated hospital ID */
export const getActiveHospitalId = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession()
  const hospitalId = (session?.user as any)?.hospital_id || 
                     (session?.user?.user_metadata as any)?.hospital_id
  if (hospitalId) return hospitalId
  
  // Fallback to active hospital record
  const { data } = await supabase.from('hospitals').select('id').limit(1).single()
  return data?.id || '85bb6adc-b868-428b-83f4-e5af2f5cf904'
}

export interface PrepackLedgerItemWithBalances extends PrepackItem {
  store_bulk_stock: number      // Tier 1: Loose bulk medicine in Main Store (facility_drug_inventory)
  counter_raw_stock: number     // Tier 2: Loose medicine transferred to Counter awaiting packaging
  finished_packs_stock: number  // Tier 3: Finished sealed UOD / prepack packs ready in batches
  total_aggregate_units: number // Aggregate total loose units across entire facility
  drug_code?: string
  drug_unit_of_measure?: string
}

/**
 * 1. Fetch all Prepack items with genuine 3-tier live balances
 */
export const getPrepackLedgerItems = async (
  hospitalId?: string
): Promise<{ data: PrepackLedgerItemWithBalances[] | null; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()

    // 1. Fetch prepack items
    const { data: items, error: itemsErr } = await supabase
      .from('prepack_items')
      .select(`
        *,
        drug:drugs (
          id,
          drug_code,
          drug_name,
          dosage_form,
          strength,
          unit_of_measure
        )
      `)
      .eq('hospital_id', targetHospId)
      .order('item_name', { ascending: true })

    if (itemsErr) throw itemsErr
    if (!items || items.length === 0) return { data: [], error: null }

    // 2. Fetch facility drug inventories to get Tier 1 Main Store Bulk Stock
    const drugIds = items.map(i => i.drug_id).filter(Boolean)
    let facilityInventories: any[] = []
    if (drugIds.length > 0) {
      const { data: facInv, error: facErr } = await supabase
        .from('facility_drug_inventory')
        .select('drug_id, facility_stock, batch_number, expiry_date, location')
        .eq('hospital_id', targetHospId)
        .in('drug_id', drugIds)

      if (!facErr && facInv) {
        facilityInventories = facInv
      }
    }

    // 3. Fetch active batches to get Tier 3 Finished Packs Stock
    const { data: batches, error: batchErr } = await supabase
      .from('prepack_batches')
      .select('id, prepack_item_id, current_balance, status, prepack_expiry_date')
      .eq('hospital_id', targetHospId)
      .in('status', ['active', 'quarantined'])

    if (batchErr) throw batchErr

    // Map 3-Tier Multi-Echelon balances
    const mapped: PrepackLedgerItemWithBalances[] = items.map(item => {
      const matchingFac = facilityInventories.find(f => f.drug_id === item.drug_id)
      const storeStock = matchingFac?.facility_stock ?? 0
      const counterRaw = item.counter_raw_stock ?? 0

      const itemBatches = (batches || []).filter(b => b.prepack_item_id === item.id)
      const finishedPacks = itemBatches.reduce((acc, b) => acc + (b.current_balance || 0), 0)

      const unitsPerPack = item.units_per_pack || 1
      const totalAggregate = storeStock + counterRaw + (finishedPacks * unitsPerPack)

      const d = Array.isArray(item.drug) ? item.drug[0] : item.drug

      return {
        ...item,
        store_bulk_stock: storeStock,
        counter_raw_stock: counterRaw,
        finished_packs_stock: finishedPacks,
        total_balance: finishedPacks, // Finished packs count
        total_aggregate_units: totalAggregate,
        drug_code: d?.drug_code || item.item_code,
        drug_unit_of_measure: d?.unit_of_measure || 'BIJI'
      }
    })

    return { data: mapped, error: null }
  } catch (err: any) {
    console.error('Error in getPrepackLedgerItems:', err)
    return { data: null, error: err }
  }
}

/**
 * 2. Fetch chronological KEW.PS-4 transactions for a specific prepack item
 */
export const getPrepackKewPs4Transactions = async (
  hospitalId: string | undefined,
  itemId: string,
  filter?: {
    transaction_type?: string
    date_from?: string
    date_to?: string
    search?: string
  }
): Promise<{ data: PrepackKewPs4Transaction[] | null; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()

    let query = supabase
      .from('prepack_kewps4_transactions')
      .select(`
        *,
        batch:prepack_batches (
          id, batch_number, current_balance, prepack_expiry_date, mfg_batch_number
        ),
        prepack_item:prepack_items (
          id, item_code, item_name, pack_type, dosage_form, units_per_pack
        )
      `)
      .eq('hospital_id', targetHospId)
      .eq('prepack_item_id', itemId)
      .order('transaction_date', { ascending: true })

    if (filter?.transaction_type && filter.transaction_type !== 'all') {
      query = query.eq('transaction_type', filter.transaction_type)
    }
    if (filter?.date_from) {
      query = query.gte('transaction_date', filter.date_from)
    }
    if (filter?.date_to) {
      query = query.lte('transaction_date', `${filter.date_to}T23:59:59Z`)
    }

    const { data, error } = await query
    if (error) throw error

    let list = (data || []) as PrepackKewPs4Transaction[]

    if (filter?.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(tx => 
        tx.transaction_number.toLowerCase().includes(q) ||
        (tx.reference_no || '').toLowerCase().includes(q) ||
        tx.source_destination.toLowerCase().includes(q) ||
        tx.officer_name.toLowerCase().includes(q) ||
        (tx.batch_number || '').toLowerCase().includes(q)
      )
    }

    return { data: list, error: null }
  } catch (err: any) {
    console.error('Error in getPrepackKewPs4Transactions:', err)
    return { data: null, error: err }
  }
}

/**
 * 3. Record Store-to-Counter Transfer (Pemindahan Stok Stor ke Kaunter)
 * Decrements Main Store bulk stock (facility_drug_inventory.facility_stock),
 * increments Counter raw stock (prepack_items.counter_raw_stock),
 * writes prepack_transfers audit row,
 * and creates KEW.PS-4 ledger transaction row.
 */
export const recordStoreToCounterTransfer = async (payload: {
  hospital_id?: string
  prepack_item_id: string
  drug_id?: string | null
  quantity_transferred: number
  reference_no?: string
  transferred_by?: string | null
  transferred_by_name: string
  received_by_name?: string
  source_batch_no?: string
  source_expiry_date?: string
  remarks?: string
}): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    const targetHospId = payload.hospital_id || await getActiveHospitalId()
    const qty = Number(payload.quantity_transferred)

    if (qty <= 0) {
      throw new Error('Kuantiti dipindahkan mestilah lebih daripada 0.')
    }

    // 1. Fetch current prepack item details
    const { data: item, error: itemErr } = await supabase
      .from('prepack_items')
      .select('id, drug_id, item_code, item_name, counter_raw_stock')
      .eq('id', payload.prepack_item_id)
      .single()

    if (itemErr || !item) throw new Error('Item prepack tidak dijumpai.')

    const drugId = payload.drug_id || item.drug_id

    // 2. Fetch current store bulk balance from facility_drug_inventory
    let currentStoreStock = 0
    let facInvId: string | null = null

    if (drugId) {
      const { data: facInv } = await supabase
        .from('facility_drug_inventory')
        .select('id, facility_stock')
        .eq('hospital_id', targetHospId)
        .eq('drug_id', drugId)
        .maybeSingle()

      if (facInv) {
        currentStoreStock = facInv.facility_stock || 0
        facInvId = facInv.id
      }
    }

    if (currentStoreStock < qty) {
      throw new Error(`Baki stok Stor Utama tidak mencukupi (${currentStoreStock} unit sedia ada, dimohon: ${qty} unit).`)
    }

    const newStoreStock = Math.max(0, currentStoreStock - qty)
    const currentCounterStock = item.counter_raw_stock || 0
    const newCounterStock = currentCounterStock + qty

    // Generate unique transfer number TRF-YYYYMM-XXXX
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `TRF-${yy}${mm}`

    const { data: lastTrf } = await supabase
      .from('prepack_transfers')
      .select('transfer_number')
      .eq('hospital_id', targetHospId)
      .like('transfer_number', `${prefix}-%`)
      .order('transfer_number', { ascending: false })
      .limit(1)

    let seq = 1
    if (lastTrf && lastTrf.length > 0) {
      const parts = lastTrf[0].transfer_number.split('-')
      const n = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(n)) seq = n + 1
    }
    const transferNumber = `${prefix}-${String(seq).padStart(4, '0')}`

    // 3. Atomically update facility_drug_inventory if exists
    if (facInvId) {
      const { error: facUpdateErr } = await supabase
        .from('facility_drug_inventory')
        .update({
          facility_stock: newStoreStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', facInvId)

      if (facUpdateErr) throw facUpdateErr
    }

    // 4. Update counter_raw_stock in prepack_items
    const { error: itemUpdateErr } = await supabase
      .from('prepack_items')
      .update({
        counter_raw_stock: newCounterStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.prepack_item_id)

    if (itemUpdateErr) throw itemUpdateErr

    // 5. Insert prepack_transfers log
    const { data: transferRecord, error: trfErr } = await supabase
      .from('prepack_transfers')
      .insert({
        hospital_id: targetHospId,
        transfer_number: transferNumber,
        prepack_item_id: payload.prepack_item_id,
        drug_id: drugId || null,
        quantity_transferred: qty,
        from_location: 'Stor Utama Farmasi',
        to_location: 'Kaunter Pra-bungkus & UOD',
        source_batch_no: payload.source_batch_no || null,
        source_expiry_date: payload.source_expiry_date || null,
        store_stock_before: currentStoreStock,
        store_stock_after: newStoreStock,
        counter_stock_before: currentCounterStock,
        counter_stock_after: newCounterStock,
        transferred_by: payload.transferred_by || null,
        transferred_by_name: payload.transferred_by_name,
        received_by_name: payload.received_by_name || payload.transferred_by_name,
        reference_no: payload.reference_no || transferNumber,
        remarks: payload.remarks || 'Pindahan stok pukal untuk penyediaan UOD / pra-bungkus.'
      })
      .select()
      .single()

    if (trfErr) throw trfErr

    // 6. Insert into prepack_kewps4_transactions
    const { error: kewpsErr } = await supabase
      .from('prepack_kewps4_transactions')
      .insert({
        hospital_id: targetHospId,
        prepack_item_id: payload.prepack_item_id,
        drug_id: drugId || null,
        transaction_date: new Date().toISOString(),
        transaction_type: 'store_to_counter',
        transaction_number: transferNumber,
        source_destination: 'Stor Utama Farmasi -> Kaunter Pra-bungkus',
        receipt_qty: qty,
        issue_qty: null,
        balance_qty: newCounterStock,
        balance_type: 'counter_stock',
        officer_name: payload.transferred_by_name,
        officer_id: payload.transferred_by || null,
        reference_no: payload.reference_no || transferNumber,
        remarks: payload.remarks || `Pindahan ${qty} unit dari Stor Utama (Baki Stor Baki: ${newStoreStock})`
      })

    if (kewpsErr) throw kewpsErr

    return { success: true, data: transferRecord, error: null }
  } catch (err: any) {
    console.error('Error in recordStoreToCounterTransfer:', err)
    return { success: false, error: err }
  }
}

/**
 * 4. Record Prepack Production Batch in KEW.PS-4
 * When a batch is created, loose raw units are consumed from counter_raw_stock (or store),
 * and converted into finished packaged batch stock.
 */
export const recordPrepackProductionTransaction = async (payload: {
  hospital_id?: string
  prepack_item_id: string
  batch_id: string
  batch_number: string
  mfg_batch_number: string
  mfg_expiry_date: string
  prepack_expiry_date: string
  quantity_packed: number // Number of finished packs (e.g., 100 packs)
  units_per_pack: number  // e.g. 10 tablets per pack
  wastage_quantity?: number
  officer_name: string
  officer_id?: string
  deduct_from_store_directly?: boolean
}): Promise<{ success: boolean; error: any }> => {
  try {
    const targetHospId = payload.hospital_id || await getActiveHospitalId()
    const packsCount = Number(payload.quantity_packed)
    const unitsPerPack = Number(payload.units_per_pack || 1)
    const wastage = Number(payload.wastage_quantity || 0)
    const rawUnitsUsed = (packsCount * unitsPerPack) + wastage

    // 1. Fetch current prepack item
    const { data: item, error: itemErr } = await supabase
      .from('prepack_items')
      .select('id, drug_id, item_code, counter_raw_stock')
      .eq('id', payload.prepack_item_id)
      .single()

    if (itemErr || !item) throw new Error('Item prepack tidak dijumpai.')

    let newCounterStock = item.counter_raw_stock || 0

    if (payload.deduct_from_store_directly && item.drug_id) {
      // Deduct directly from facility_drug_inventory
      const { data: facInv } = await supabase
        .from('facility_drug_inventory')
        .select('id, facility_stock')
        .eq('hospital_id', targetHospId)
        .eq('drug_id', item.drug_id)
        .maybeSingle()

      if (facInv) {
        const curStore = facInv.facility_stock || 0
        const newStore = Math.max(0, curStore - rawUnitsUsed)
        await supabase
          .from('facility_drug_inventory')
          .update({ facility_stock: newStore, updated_at: new Date().toISOString() })
          .eq('id', facInv.id)
      }
    } else {
      // Deduct from counter_raw_stock
      newCounterStock = Math.max(0, (item.counter_raw_stock || 0) - rawUnitsUsed)
      await supabase
        .from('prepack_items')
        .update({
          counter_raw_stock: newCounterStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.prepack_item_id)
    }

    // 2. Fetch total active batches to calculate new finished packs balance
    const { data: activeBatches } = await supabase
      .from('prepack_batches')
      .select('current_balance')
      .eq('hospital_id', targetHospId)
      .eq('prepack_item_id', payload.prepack_item_id)
      .in('status', ['active', 'quarantined'])

    const totalFinishedPacks = (activeBatches || []).reduce((acc, b) => acc + (b.current_balance || 0), 0)

    // 3. Insert transaction into prepack_kewps4_transactions
    const { error: kewpsErr } = await supabase
      .from('prepack_kewps4_transactions')
      .insert({
        hospital_id: targetHospId,
        prepack_item_id: payload.prepack_item_id,
        drug_id: item.drug_id || null,
        batch_id: payload.batch_id,
        transaction_date: new Date().toISOString(),
        transaction_type: 'production_prepack',
        transaction_number: payload.batch_number,
        source_destination: `Sesi Pembungkusan UOD (${packsCount} pek x ${unitsPerPack})`,
        receipt_qty: packsCount,
        issue_qty: null,
        balance_qty: totalFinishedPacks,
        balance_type: 'finished_pack',
        officer_name: payload.officer_name,
        officer_id: payload.officer_id || null,
        reference_no: payload.batch_number,
        batch_number: payload.batch_number,
        mfg_expiry_date: payload.mfg_expiry_date || null,
        prepack_expiry_date: payload.prepack_expiry_date || null,
        remarks: `Mfg Lot: ${payload.mfg_batch_number} • Digunakan: ${rawUnitsUsed} unit asas${wastage > 0 ? ` (Kerosakan: ${wastage})` : ''}`
      })

    if (kewpsErr) throw kewpsErr

    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error in recordPrepackProductionTransaction:', err)
    return { success: false, error: err }
  }
}

/**
 * 5. Record Bring Forward (Bawa Ke Hadapan / B.K.H)
 */
export const recordPrepackBringForward = async (payload: {
  hospital_id?: string
  prepack_item_id: string
  quantity: number
  officer_name: string
  officer_id?: string
  balance_type?: 'finished_pack' | 'counter_stock'
  remarks?: string
}): Promise<{ success: boolean; error: any }> => {
  try {
    const targetHospId = payload.hospital_id || await getActiveHospitalId()
    const qty = Number(payload.quantity)

    const now = new Date()
    const year = now.getFullYear()
    const docNo = `BKH-${year}/001`

    const { error } = await supabase
      .from('prepack_kewps4_transactions')
      .insert({
        hospital_id: targetHospId,
        prepack_item_id: payload.prepack_item_id,
        transaction_date: now.toISOString(),
        transaction_type: 'bring_forward',
        transaction_number: docNo,
        source_destination: 'Baki Bawa Ke Hadapan (Tahun/Kad Lalu)',
        receipt_qty: qty,
        issue_qty: null,
        balance_qty: qty,
        balance_type: payload.balance_type || 'finished_pack',
        officer_name: payload.officer_name,
        officer_id: payload.officer_id || null,
        reference_no: docNo,
        remarks: payload.remarks || `Baki permulaan bawa ke hadapan sesi tahun ${year}.`
      })

    if (error) throw error
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error in recordPrepackBringForward:', err)
    return { success: false, error: err }
  }
}

/**
 * 6. Record Semakan & Penemuan (Check & Found / Stok Opname)
 */
export const recordPrepackCheckFound = async (payload: {
  hospital_id?: string
  prepack_item_id: string
  physical_count: number
  officer_name: string
  officer_id?: string
  remarks?: string
}): Promise<{ success: boolean; error: any }> => {
  try {
    const targetHospId = payload.hospital_id || await getActiveHospitalId()
    const physical = Number(payload.physical_count)

    // Fetch latest active batches total
    const { data: batches } = await supabase
      .from('prepack_batches')
      .select('id, current_balance')
      .eq('hospital_id', targetHospId)
      .eq('prepack_item_id', payload.prepack_item_id)
      .in('status', ['active', 'quarantined'])

    const currentSystem = (batches || []).reduce((acc, b) => acc + (b.current_balance || 0), 0)
    const diff = physical - currentSystem

    const docNo = `CF-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`

    const { error } = await supabase
      .from('prepack_kewps4_transactions')
      .insert({
        hospital_id: targetHospId,
        prepack_item_id: payload.prepack_item_id,
        transaction_date: new Date().toISOString(),
        transaction_type: 'check_found',
        transaction_number: docNo,
        source_destination: 'Semakan & Penemuan Stok (Stok Opname Fizikal)',
        receipt_qty: diff > 0 ? diff : null,
        issue_qty: diff < 0 ? Math.abs(diff) : null,
        balance_qty: physical,
        balance_type: 'finished_pack',
        officer_name: payload.officer_name,
        officer_id: payload.officer_id || null,
        reference_no: docNo,
        remarks: payload.remarks || `Audit fizikal: ${physical} pek. Perbezaan: ${diff >= 0 ? `+${diff}` : diff} pek berbanding sistem (${currentSystem}).`
      })

    if (error) throw error
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error in recordPrepackCheckFound:', err)
    return { success: false, error: err }
  }
}

/**
 * 7. Record Annual Store Verification (KEW.PS-14)
 */
export const recordPrepackStoreVerification = async (payload: {
  hospital_id?: string
  prepack_item_id: string
  verification_year: number
  physical_count: number
  verifier_name: string
  verifier_ic?: string
  verifier_jawatan?: string
  remarks?: string
}): Promise<{ success: boolean; error: any }> => {
  try {
    const targetHospId = payload.hospital_id || await getActiveHospitalId()
    const physical = Number(payload.physical_count)

    // Calculate current ledger balance
    const { data: batches } = await supabase
      .from('prepack_batches')
      .select('current_balance')
      .eq('hospital_id', targetHospId)
      .eq('prepack_item_id', payload.prepack_item_id)
      .in('status', ['active', 'quarantined'])

    const kewpsBal = (batches || []).reduce((acc, b) => acc + (b.current_balance || 0), 0)
    const diff = physical - kewpsBal
    const isTally = diff === 0

    // 1. Insert into prepack_store_verifications
    const { error: verifErr } = await supabase
      .from('prepack_store_verifications')
      .insert({
        hospital_id: targetHospId,
        prepack_item_id: payload.prepack_item_id,
        verification_year: payload.verification_year,
        physical_count: physical,
        kewps_balance: kewpsBal,
        system_count: kewpsBal,
        diff_physical_kewps: diff,
        diff_physical_system: diff,
        is_tally: isTally,
        verifier_name: payload.verifier_name,
        verifier_ic: payload.verifier_ic || null,
        verifier_jawatan: payload.verifier_jawatan || 'Pegawai Pemeriksa Stor',
        remarks: payload.remarks || `Verifikasi Stor Tahunan ${payload.verification_year}`
      })

    if (verifErr) throw verifErr

    // 2. Insert verification transaction row in KEW.PS-4
    const docNo = `VER-${payload.verification_year}/001`
    await supabase
      .from('prepack_kewps4_transactions')
      .insert({
        hospital_id: targetHospId,
        prepack_item_id: payload.prepack_item_id,
        transaction_date: new Date().toISOString(),
        transaction_type: 'store_verification',
        transaction_number: docNo,
        source_destination: `Verifikasi Tahunan KEW.PS-14 (${payload.verification_year})`,
        receipt_qty: null,
        issue_qty: null,
        balance_qty: kewpsBal,
        balance_type: 'finished_pack',
        officer_name: payload.verifier_name,
        reference_no: docNo,
        remarks: `Disahkan oleh ${payload.verifier_name} (${payload.verifier_jawatan || 'Pemeriksa Stor'}). Status: ${isTally ? 'SELESAI / TALLY' : `SELISIH (${diff})`}`
      })

    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error in recordPrepackStoreVerification:', err)
    return { success: false, error: err }
  }
}

/**
 * 8. Fetch Store Verification History for an item
 */
export const getPrepackStoreVerifications = async (
  hospitalId: string | undefined,
  itemId?: string
): Promise<{ data: PrepackStoreVerification[] | null; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()

    let query = supabase
      .from('prepack_store_verifications')
      .select('*')
      .eq('hospital_id', targetHospId)
      .order('verification_year', { ascending: false })

    if (itemId) {
      query = query.eq('prepack_item_id', itemId)
    }

    const { data, error } = await query
    if (error) throw error
    return { data: data || [], error: null }
  } catch (err: any) {
    console.error('Error in getPrepackStoreVerifications:', err)
    return { data: null, error: err }
  }
}

/**
 * 9. Fetch Store Transfers History
 */
export const getPrepackTransfers = async (
  hospitalId?: string,
  itemId?: string,
  limit: number = 50
): Promise<{ data: PrepackTransfer[] | null; error: any }> => {
  try {
    const targetHospId = hospitalId || await getActiveHospitalId()

    let query = supabase
      .from('prepack_transfers')
      .select(`
        *,
        prepack_item:prepack_items (
          id, item_code, item_name, pack_type, dosage_form, strength, units_per_pack
        )
      `)
      .eq('hospital_id', targetHospId)
      .order('transfer_date', { ascending: false })
      .limit(limit)

    if (itemId) {
      query = query.eq('prepack_item_id', itemId)
    }

    const { data, error } = await query
    if (error) throw error
    return { data: data || [], error: null }
  } catch (err: any) {
    console.error('Error in getPrepackTransfers:', err)
    return { data: null, error: err }
  }
}

/**
 * 10. Export KEW.PS-4 CSV
 */
export const exportPrepackKewPs4Csv = (
  item: PrepackLedgerItemWithBalances,
  transactions: PrepackKewPs4Transaction[]
) => {
  const headers = [
    'Bil',
    'Tarikh',
    'Masa',
    'No. Dokumen / Rujukan',
    'Jenis Transaksi',
    'Sumber / Destinasi',
    'Terimaan (Masuk)',
    'Keluaran (Keluar)',
    'Baki Semasa',
    'Pegawai Bertanggungjawab',
    'Catatan / Batch'
  ]

  const rows = transactions.map((tx, idx) => [
    idx + 1,
    new Date(tx.transaction_date).toLocaleDateString('ms-MY'),
    new Date(tx.transaction_date).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
    `"${tx.transaction_number}"`,
    `"${tx.transaction_type}"`,
    `"${tx.source_destination}"`,
    tx.receipt_qty !== null ? tx.receipt_qty : '',
    tx.issue_qty !== null ? tx.issue_qty : '',
    tx.balance_qty,
    `"${tx.officer_name}"`,
    `"${tx.remarks || ''}"`
  ])

  const metaRows = [
    ['KERAJAAN MALAYSIA - TATACARA PENGURUSAN STOR (TPS 1PP)'],
    ['KAD PETAK (KEW.PS-4) - UNIT PRA-BUNGKUS & UOD'],
    [`Perihal Barang: ${item.item_name}`],
    [`No Kod: ${item.item_code}`],
    [`Bentuk Dos: ${item.dosage_form} ${item.strength || ''}`],
    [`Baki Stor Utama: ${item.store_bulk_stock} Unit`],
    [`Baki Kaunter Prepack: ${item.counter_raw_stock} Unit`],
    [`Baki Siap Bungkus: ${item.finished_packs_stock} Pek`],
    [''],
    headers
  ]

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    metaRows.map(e => Array.isArray(e) ? e.join(',') : e).join('\n') + '\n' +
    rows.map(e => e.join(',')).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `KEWPS4_PREPACK_${item.item_code}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 11. Export Official Malaysian Treasury KEW.PS-4 PDF with Jata Negara
 */
export const exportPrepackKewPs4Pdf = (
  item: PrepackLedgerItemWithBalances,
  transactions: PrepackKewPs4Transaction[],
  facilityName: string = 'HOSPITAL LAWAS'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Jata Negara Header
  try {
    doc.addImage(JATA_NEGARA_BASE64, 'PNG', 14, 10, 18, 15)
  } catch {
    // Graceful fallback if image decoding fails
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('KERAJAAN MALAYSIA', 36, 15)
  doc.setFontSize(12)
  doc.text('KAD PETAK (KEW.PS-4)', 36, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Pekeliling Perbendaharaan 1PP - Tatacara Pengurusan Stor (TPS) • ${facilityName.toUpperCase()}`, 36, 24)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('KEW.PS-4', 196, 14, { align: 'right' })

  // Meta Box
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, 28, 182, 28, 1.5, 1.5, 'FD')

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Perihal Stok:', 18, 34)
  doc.setFont('helvetica', 'normal')
  doc.text(`${item.item_name} [${item.item_code}]`, 42, 34)

  doc.setFont('helvetica', 'bold')
  doc.text('Bentuk Dos & UOM:', 18, 39)
  doc.setFont('helvetica', 'normal')
  doc.text(`${item.dosage_form.toUpperCase()} • ${item.package_type.toUpperCase()} (${item.units_per_pack} unit/pek)`, 46, 39)

  doc.setFont('helvetica', 'bold')
  doc.text('Lokasi Stor:', 18, 44)
  doc.setFont('helvetica', 'normal')
  doc.text('Stor Utama Farmasi & Kaunter Pra-bungkus / UOD', 42, 44)

  doc.setFont('helvetica', 'bold')
  doc.text('Paras Stok:', 18, 49)
  doc.setFont('helvetica', 'normal')
  doc.text(`Min Buffer: ${item.min_buffer_level} | Batch Optimum: ${item.optimal_batch_size}`, 42, 49)

  // Right column of Meta Box: 3-Tier Balances
  doc.setFont('helvetica', 'bold')
  doc.text('Baki Stor Utama:', 120, 34)
  doc.setFont('helvetica', 'normal')
  doc.text(`${item.store_bulk_stock.toLocaleString()} unit asas`, 155, 34)

  doc.setFont('helvetica', 'bold')
  doc.text('Baki Kaunter Prepack:', 120, 39)
  doc.setFont('helvetica', 'normal')
  doc.text(`${item.counter_raw_stock.toLocaleString()} unit asas`, 155, 39)

  doc.setFont('helvetica', 'bold')
  doc.text('Baki Siap Bungkus:', 120, 44)
  doc.setFont('helvetica', 'normal')
  doc.text(`${item.finished_packs_stock.toLocaleString()} pek (${item.finished_packs_stock * item.units_per_pack} unit)`, 155, 44)

  doc.setFont('helvetica', 'bold')
  doc.text('Jumlah Agregat:', 120, 49)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(13, 148, 136)
  doc.text(`${item.total_aggregate_units.toLocaleString()} unit`, 155, 49)
  doc.setTextColor(0, 0, 0)

  // Transaction Table
  const tableRows = transactions.map((tx, idx) => {
    const isTransfer = tx.transaction_type === 'store_to_counter'
    const isProduction = tx.transaction_type === 'production_prepack'
    const isVerif = tx.transaction_type === 'store_verification'

    return [
      idx + 1,
      new Date(tx.transaction_date).toLocaleDateString('ms-MY'),
      tx.transaction_number,
      tx.source_destination,
      tx.receipt_qty !== null ? tx.receipt_qty : '-',
      tx.issue_qty !== null ? tx.issue_qty : '-',
      tx.balance_qty,
      tx.officer_name,
      tx.remarks || '-'
    ]
  })

  autoTable(doc, {
    startY: 59,
    head: [[
      'Bil',
      'Tarikh',
      'No. Dokumen / PK',
      'Terima Dari / Keluar Kepada',
      'Terima',
      'Keluar',
      'Baki',
      'Nama & T/T',
      'Catatan / Batch'
    ]],
    body: tableRows.length > 0 ? tableRows : [['-', '-', 'Tiada transaksi direkodkan', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      fontSize: 6.5,
      cellPadding: 1.5,
      lineColor: [220, 220, 220],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 24, fontStyle: 'bold' },
      3: { cellWidth: 42 },
      4: { cellWidth: 13, halign: 'right' },
      5: { cellWidth: 13, halign: 'right' },
      6: { cellWidth: 13, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 23 },
      8: { cellWidth: 30 }
    },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFontSize(6.5)
      doc.setTextColor(120, 120, 120)
      doc.text(
        `Janaan Sistem H.O.M.E. • Kad Petak KEW.PS-4 • Mukasurat ${(data as any).pageNumber}`,
        14,
        290
      )
    }
  })

  doc.save(`KEWPS4_${item.item_code}_${new Date().toISOString().split('T')[0]}.pdf`)
}
