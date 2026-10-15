import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { SubLocationUnit } from '@/modules/inventory/pages/inventory/StoreLocationManagementPage'

export async function loadStoreSubLocations(hospitalId: string, storeCode?: string, storeId?: string): Promise<SubLocationUnit[]> {
  if (!isSupabaseConfigured() || (!storeCode && !storeId)) throw new Error('Store sub-location lookup unavailable')
  let query = supabase.from('store_sub_locations').select('id,store_id,type,name,code,parent_name,notes').eq('hospital_id', hospitalId)
  if (storeCode) query = query.eq('store_code', storeCode)
  if (storeId) query = query.eq('store_id', storeId)
  const { data, error } = await query
  if (error) throw new Error('Store sub-location lookup failed')
  return (data || []).map(row => ({ ...row, type: row.type as SubLocationUnit['type'], store_id: row.store_id || undefined, parent_name: row.parent_name || undefined, notes: row.notes || undefined }))
}
export async function syncStoreSubLocations(hospitalId: string, storeCode: string, subLocations: SubLocationUnit[], storeId?: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !storeId) return false
  if (subLocations.some(unit => unit.store_id && unit.store_id !== storeId)) return false
  try {
    const { error } = await supabase.rpc('replace_store_sub_locations', { p_hospital_id: hospitalId, p_store_id: storeId, p_store_code: storeCode, p_units: subLocations })
    return !error
  } catch { return false }
}
