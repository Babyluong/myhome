/**
 * Universal Offline Preloader Service
 * 
 * Automatically synchronizes and pre-warms local persistent caches (IndexedDB via idb-keyval and cylinderOfflineDB)
 * when the application is launched online.
 * 
 * Ensures that when the user goes offline:
 * 1. Medical Oxygen cylinders & summary stats are immediately available.
 * 2. Purchase Orders, LPOs, and procurement statistics are visible and searchable.
 * 3. Drug catalog (Formulari) is visible and readable.
 * 4. Keys, Locks, and Temperature logs are locally available.
 * 5. Users can view, search, create, and edit records seamlessly in offline mode.
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { offlineAdapter } from './offlineAdapter'
import { mergeTableRecords } from './offlineFetch'
import { cylinderSyncEngine } from '@/modules/mycylinder/services/cylinderSyncEngine'

class OfflinePreloader {
  private hasPreloaded = false
  private isPreloading = false

  async startPreload(hospitalId?: string, force = false): Promise<void> {
    if (!hospitalId || typeof navigator === 'undefined' || !navigator.onLine || !isSupabaseConfigured()) {
      return
    }

    if (this.hasPreloaded && !force) return
    if (this.isPreloading) return

    this.isPreloading = true
    console.info(`[OfflinePreloader] Initiating hospital data preloading for offline readiness: ${hospitalId}`)

    try {
      // 1. Oxygen Cylinders & Full Lookup Tables (non-destructive warmup)
      void cylinderSyncEngine.warmUpCylinderCache(hospitalId, false).catch((err) => {
        console.warn('[OfflinePreloader] Cylinder warmup non-critical notice:', err)
      })

      // 2. Parallel preload of core hospital tables
      await Promise.allSettled([
        // 2a. Purchase Orders & nested relations
        (async () => {
          const [poRes, statsRes] = await Promise.all([
            supabase
              .from('pharmacy_purchase_orders')
              .select(`
                *,
                supplier:suppliers(company_name),
                items:pharmacy_purchase_order_items(*)
              `)
              .eq('hospital_id', hospitalId)
              .order('order_date', { ascending: false })
              .limit(250),
            supabase
              .from('pharmacy_purchase_orders')
              .select('status, total_amount, po_type')
              .eq('hospital_id', hospitalId)
              .neq('po_type', 'sq')
          ])

          if (poRes.data && poRes.data.length > 0) {
            await offlineAdapter.setCache('pharmacy_purchase_orders', poRes.data)
            await mergeTableRecords('pharmacy_purchase_orders', poRes.data)
          }

          if (statsRes.data && statsRes.data.length > 0) {
            const stats = statsRes.data.reduce(
              (acc: any, po: any) => {
                acc.totalCount += 1
                if (po.status !== 'cancelled') {
                  acc.totalValue += po.total_amount || 0
                }
                switch (po.status) {
                  case 'draft': acc.draftCount += 1; break
                  case 'pending_approval': acc.pendingApprovalCount += 1; break
                  case 'approved': acc.approvedCount += 1; break
                  case 'sent': acc.sentCount += 1; break
                  case 'partial_received': acc.partialReceivedCount += 1; break
                  case 'completed': acc.completedCount += 1; break
                  case 'cancelled': acc.cancelledCount += 1; break
                }
                return acc
              },
              { totalCount: 0, totalValue: 0, draftCount: 0, pendingApprovalCount: 0, approvedCount: 0, sentCount: 0, partialReceivedCount: 0, completedCount: 0, cancelledCount: 0 }
            )
            await offlineAdapter.setCache('pharmacy_purchase_order_stats', [stats])
          }
        })(),

        // 2b. Drugs Catalog (Formulari)
        (async () => {
          const { data: drugs } = await supabase
            .from('drugs')
            .select('*')
            .limit(300)

          if (drugs && drugs.length > 0) {
            await offlineAdapter.setCache('drugs', drugs)
            await offlineAdapter.setCache('pharmacy_drugs', drugs)
            await mergeTableRecords('drugs', drugs)
            await mergeTableRecords('pharmacy_drugs', drugs)
          }
        })(),

        // 2c. LPO Records
        (async () => {
          const { data: lpos } = await supabase
            .from('pharmacy_lpo')
            .select(`
              id, lpo_number, status, document_date, document_url, verify_tracking, payment_status, sent_for_payment_date,
              po_id,
              po:pharmacy_purchase_orders!inner(po_number, po_type, order_date, total_amount, vote_code, category, department, manual_supplier_name, supplier:suppliers(company_name), status, items:pharmacy_purchase_order_items(item_name))
            `)
            .eq('hospital_id', hospitalId)
            .order('document_date', { ascending: false })
            .limit(200)

          if (lpos && lpos.length > 0) {
            await offlineAdapter.setCache('pharmacy_lpo', lpos)
            await mergeTableRecords('pharmacy_lpo', lpos)
          }
        })(),

        // 2d. Kunci Module (Keys & Logs)
        (async () => {
          const [kunciRes, logRes] = await Promise.all([
            supabase.from('kunci_daftar').select('*').eq('hospital_id', hospitalId),
            supabase.from('kunci_log').select('*').eq('hospital_id', hospitalId).order('tarikh_pinjam', { ascending: false }).limit(150)
          ])

          if (kunciRes.data && kunciRes.data.length > 0) {
            await offlineAdapter.setCache('kunci_daftar', kunciRes.data)
            await mergeTableRecords('kunci_daftar', kunciRes.data)
          }
          if (logRes.data && logRes.data.length > 0) {
            await offlineAdapter.setCache('kunci_log', logRes.data)
            await mergeTableRecords('kunci_log', logRes.data)
          }
        })(),

        // 2e. Suhu Module (lokasi, unit_pemantauan, ambang_suhu, bacaan_suhu)
        (async () => {
          const [locRes, unitRes, ambangRes, bacaanRes] = await Promise.all([
            supabase.from('lokasi').select('*').eq('hospital_id', hospitalId),
            supabase.from('unit_pemantauan').select('*'),
            supabase.from('ambang_suhu').select('*'),
            supabase.from('bacaan_suhu').select('*').order('tarikh_masa', { ascending: false }).limit(200)
          ])

          if (locRes.data && locRes.data.length > 0) {
            await offlineAdapter.setCache('lokasi', locRes.data)
            await offlineAdapter.setCache('suhu_locations', locRes.data)
            await mergeTableRecords('lokasi', locRes.data)
            await mergeTableRecords('suhu_locations', locRes.data)
          }
          if (unitRes.data && unitRes.data.length > 0) {
            await offlineAdapter.setCache('unit_pemantauan', unitRes.data)
            await mergeTableRecords('unit_pemantauan', unitRes.data)
          }
          if (ambangRes.data && ambangRes.data.length > 0) {
            await offlineAdapter.setCache('ambang_suhu', ambangRes.data)
            await mergeTableRecords('ambang_suhu', ambangRes.data)
          }
          if (bacaanRes.data && bacaanRes.data.length > 0) {
            await offlineAdapter.setCache('bacaan_suhu', bacaanRes.data)
            await offlineAdapter.setCache('suhu_records', bacaanRes.data)
            await mergeTableRecords('bacaan_suhu', bacaanRes.data)
            await mergeTableRecords('suhu_records', bacaanRes.data)
          }
        })(),

        // 2f. Suppliers, Departments, and Staff Users
        (async () => {
          const [supRes, deptRes, userRes] = await Promise.all([
            supabase.from('suppliers').select('*').eq('status', 'active'),
            supabase.from('departments').select('*').eq('hospital_id', hospitalId),
            supabase.from('users').select('id, full_name, ic_number, email, phone_number, role_id, department_id, hospital_id, jawatan, is_active').eq('hospital_id', hospitalId).limit(250)
          ])

          if (supRes.data && supRes.data.length > 0) {
            await offlineAdapter.setCache('suppliers', supRes.data)
            await mergeTableRecords('suppliers', supRes.data)
          }
          if (deptRes.data && deptRes.data.length > 0) {
            await offlineAdapter.setCache('departments', deptRes.data)
            await mergeTableRecords('departments', deptRes.data)
          }
          if (userRes.data && userRes.data.length > 0) {
            await offlineAdapter.setCache('users', userRes.data)
            await mergeTableRecords('users', userRes.data)
          }
        })(),

        // 2g. Budgets & Warrants
        (async () => {
          const [budRes, warRes] = await Promise.all([
            supabase.from('pharmacy_budgets').select('*').eq('hospital_id', hospitalId),
            supabase.from('pharmacy_warrants').select('*').eq('hospital_id', hospitalId)
          ])

          if (budRes.data && budRes.data.length > 0) {
            await offlineAdapter.setCache('pharmacy_budgets', budRes.data)
            await mergeTableRecords('pharmacy_budgets', budRes.data)
          }
          if (warRes.data && warRes.data.length > 0) {
            await offlineAdapter.setCache('pharmacy_warrants', warRes.data)
            await mergeTableRecords('pharmacy_warrants', warRes.data)
          }
        })(),

        // 2h. Prepack Module (items, batches, ledger)
        (async () => {
          const [itemsRes, batchesRes, ledgerRes] = await Promise.all([
            supabase.from('prepack_items').select('*').eq('hospital_id', hospitalId).limit(300),
            supabase.from('prepack_batches').select('*, prepack_item:prepack_items(*)').eq('hospital_id', hospitalId).order('created_at', { ascending: false }).limit(300),
            supabase.from('prepack_kewps4_ledger').select('*').eq('hospital_id', hospitalId).order('transaction_date', { ascending: false }).limit(200)
          ])

          if (itemsRes.data && itemsRes.data.length > 0) {
            await offlineAdapter.setCache('prepack_items', itemsRes.data)
            await mergeTableRecords('prepack_items', itemsRes.data)
          }
          if (batchesRes.data && batchesRes.data.length > 0) {
            await offlineAdapter.setCache('prepack_batches', batchesRes.data)
            await mergeTableRecords('prepack_batches', batchesRes.data)
          }
          if (ledgerRes.data && ledgerRes.data.length > 0) {
            await offlineAdapter.setCache('prepack_kewps4_ledger', ledgerRes.data)
            await mergeTableRecords('prepack_kewps4_ledger', ledgerRes.data)
          }
        })(),

        // 2i. Transporter & Tempahan (Bookings & Logistics)
        (async () => {
          const [transRes, vehRes, roomRes, bookRes] = await Promise.all([
            supabase.from('transporter_requests').select('*').eq('hospital_id', hospitalId).limit(200),
            supabase.from('transporter_vehicles').select('*').eq('hospital_id', hospitalId).limit(100),
            supabase.from('tempahan_rooms').select('*').eq('hospital_id', hospitalId),
            supabase.from('tempahan_bookings').select('*').eq('hospital_id', hospitalId).limit(200)
          ])

          if (transRes.data && transRes.data.length > 0) {
            await offlineAdapter.setCache('transporter_requests', transRes.data)
            await mergeTableRecords('transporter_requests', transRes.data)
          }
          if (vehRes.data && vehRes.data.length > 0) {
            await offlineAdapter.setCache('transporter_vehicles', vehRes.data)
            await mergeTableRecords('transporter_vehicles', vehRes.data)
          }
          if (roomRes.data && roomRes.data.length > 0) {
            await offlineAdapter.setCache('tempahan_rooms', roomRes.data)
            await mergeTableRecords('tempahan_rooms', roomRes.data)
          }
          if (bookRes.data && bookRes.data.length > 0) {
            await offlineAdapter.setCache('tempahan_bookings', bookRes.data)
            await mergeTableRecords('tempahan_bookings', bookRes.data)
          }
        })(),

        // 2j. MSDS & Crossborder Referrals
        (async () => {
          const [msdsRes, crossRes] = await Promise.all([
            supabase.from('msds_records').select('*').limit(200),
            supabase.from('crossborder_referrals').select('*').eq('hospital_id', hospitalId).limit(150)
          ])

          if (msdsRes.data && msdsRes.data.length > 0) {
            await offlineAdapter.setCache('msds_records', msdsRes.data)
            await mergeTableRecords('msds_records', msdsRes.data)
          }
          if (crossRes.data && crossRes.data.length > 0) {
            await offlineAdapter.setCache('crossborder_referrals', crossRes.data)
            await mergeTableRecords('crossborder_referrals', crossRes.data)
          }
        })()
      ])

      this.hasPreloaded = true
      console.info(`[OfflinePreloader] Background preloading successfully completed for ${hospitalId}.`)
    } catch (err) {
      console.warn('[OfflinePreloader] Error during preload (non-blocking):', err)
    } finally {
      this.isPreloading = false
    }
  }
}

export const offlinePreloader = new OfflinePreloader()
