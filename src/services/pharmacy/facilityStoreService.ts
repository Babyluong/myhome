import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { StockTransaction, PurchaseOrder, PurchaseOrderItem } from '@/types/pharmacy'

export type FacilityStoreCode = 'LOG' | 'IPD' | 'OPD' | 'ETU'
export interface FacilityStore {
  id: string
  hospital_id: string
  location_code: string
  location_name: string
  department_id: string | null
}
export async function listFacilityStores(hospitalId: string): Promise<FacilityStore[]> {
  if (!hospitalId || !isSupabaseConfigured()) throw new Error('Facility store lookup unavailable')
  const { data, error } = await supabase.from('pharmacy_stock_locations')
    .select('id,hospital_id,location_code,location_name,department_id')
    .eq('hospital_id', hospitalId).eq('is_active', true).eq('location_type', 'store')
  if (error) throw new Error('Unable to load facility stores')
  return data || []
}
export async function resolveFacilityStore(hospitalId: string, code: FacilityStoreCode): Promise<FacilityStore> {
  const matches = (await listFacilityStores(hospitalId)).filter(store => store.location_code === `LOC-${code}-01`)
  if (matches.length !== 1) throw new Error(`Facility ${code} store is unavailable or ambiguous`)
  return matches[0]
}

export async function resolveFacilityStoreById(hospitalId: string, storeId: string): Promise<FacilityStore> {
  const matches = (await listFacilityStores(hospitalId)).filter(store => store.id === storeId)
  if (matches.length !== 1) throw new Error('Selected store is unavailable for this hospital')
  return matches[0]
}

export function validateFacilityStockSettings(settings: { min_stock_level?: number; max_stock_level?: number; min_buffer_level?: number; facility_stock?: number }): void {
  for (const value of Object.values(settings)) {
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) throw new Error('Stock levels must be nonnegative integers')
  }
  if (settings.min_stock_level !== undefined && settings.max_stock_level !== undefined && settings.min_stock_level > settings.max_stock_level) throw new Error('Minimum stock exceeds maximum stock')
}

export function validateInventoryExpiry(value?: string | null): string | null | undefined {
  if (value === undefined || value === null) return value
  if (value === '') return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(`${value}T00:00:00Z`).toISOString().slice(0,10) !== value) throw new Error('Valid expiry calendar date required')
  return value
}

export type FacilityPurchaseOrderHistory = PurchaseOrderItem & { purchase_order: PurchaseOrder }
export interface FacilityItemHistory { transactions: StockTransaction[]; purchaseOrders: FacilityPurchaseOrderHistory[]; purchaseOrderScope: 'hospital' }
export async function loadFacilityItemHistory(hospitalId: string, storeId: string, itemId: string, itemType: 'drug' | 'non_drug'): Promise<FacilityItemHistory> {
  await resolveFacilityStoreById(hospitalId, storeId)
  if (!/^[0-9a-f-]{36}$/i.test(itemId)) throw new Error('Valid inventory item required for history')
  const [transactions, orders] = await Promise.all([
    supabase.from('pharmacy_stock_transactions').select('*').eq('hospital_id', hospitalId).eq('item_id', itemId).eq('item_type', itemType)
      .or(`from_location_id.eq.${storeId},to_location_id.eq.${storeId}`).order('created_at', { ascending: false }).limit(50),
    supabase.from('pharmacy_purchase_order_items').select('*,purchase_order:pharmacy_purchase_orders!inner(*)')
      .eq('purchase_order.hospital_id', hospitalId).eq('item_id', itemId).eq('item_type', itemType).order('created_at', { ascending: false }).limit(50),
  ])
  if (transactions.error || orders.error) throw new Error('Inventory history unavailable')
  return { transactions: transactions.data || [], purchaseOrders: (orders.data || []) as unknown as FacilityPurchaseOrderHistory[], purchaseOrderScope: 'hospital' }
}
