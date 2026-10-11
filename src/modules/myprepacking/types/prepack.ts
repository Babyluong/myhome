// src/modules/myprepacking/types/prepack.ts

export type PackType = 
  | 'uod' 
  | 'prepack'
  | 'prepack_liquid' 
  | 'prepack_tablet' 
  | 'prepack_cream' 
  | 'internal'
  | 'external'
  | 'extemporaneous' 
  | 'other'

export type CatalogCategory = 'all' | 'uod' | 'prepack' | 'internal' | 'external'

export type DosageForm = 
  | 'tablet' 
  | 'capsule' 
  | 'syrup' 
  | 'suspension' 
  | 'cream' 
  | 'ointment' 
  | 'drops' 
  | 'solution' 
  | 'powder' 
  | 'other'

export type PackageType = 
  | 'sachet' 
  | 'amber_bottle' 
  | 'clear_bottle' 
  | 'ointment_jar' 
  | 'plastic_envelope' 
  | 'blister_strip' 
  | 'vial_ampoule' 
  | 'other'

export type BatchStatus = 
  | 'active' 
  | 'quarantined' 
  | 'depleted' 
  | 'expired' 
  | 'recalled'

export type UsageTransactionType = 
  | 'ward_supply' 
  | 'outpatient_dispense' 
  | 'inpatient_trolley' 
  | 'wastage_disposal' 
  | 'stock_adjustment' 
  | 'return_to_stock'

export type PrepackKewPs4TransactionType =
  | 'store_to_counter'
  | 'production_prepack'
  | 'counter_dispense'
  | 'receipt'
  | 'issue'
  | 'bring_forward'
  | 'check_found'
  | 'store_verification'
  | 'wastage_adjustment'
  | 'return_to_store'

export interface PrepackItem {
  id: string
  hospital_id: string
  drug_id?: string | null
  item_code: string
  item_name: string
  generic_name?: string | null
  pack_type: PackType
  dosage_form: DosageForm | string
  strength?: string | null
  units_per_pack: number
  package_type: PackageType | string
  min_buffer_level: number
  optimal_batch_size: number
  shelf_life_months: number
  storage_instructions: string
  label_instructions?: string | null
  ingredients_formula?: string | null
  indications?: string | null
  standard_formula_breakdown?: PrepackFormulationIngredient[] | null
  preparation_steps?: string[] | null
  equipment_required?: string[] | null
  in_process_qc?: string[] | null
  cautions_and_warnings?: string[] | null
  beyond_use_date_days?: number | null
  container_specs?: string | null
  counter_raw_stock: number // Loose bulk units transferred from store into counter
  status: 'active' | 'inactive' | 'discontinued'
  created_by?: string | null
  created_at: string
  updated_at: string
  // Aggregated runtime properties
  total_balance?: number // Total finished packs in batches
  store_bulk_stock?: number // Bulk stock available in Main Store (facility_drug_inventory)
  total_aggregate_units?: number // store + counter_raw + (total_balance * units_per_pack)
  active_batches_count?: number
  needs_repack?: boolean
  near_expiry_count?: number
  batches?: PrepackBatch[]
}

export interface PrepackFormulationIngredient {
  name: string
  quantity: string
  function?: string
}

export interface PrepackFormulationAuditLog {
  id: string
  hospital_id: string
  prepack_item_id: string
  user_id?: string | null
  user_name: string
  user_role?: string | null
  action: string
  changed_fields: string[]
  old_values: Record<string, any>
  new_values: Record<string, any>
  change_summary: string
  created_at: string
}

export interface PrepackBatch {
  id: string
  hospital_id: string
  prepack_item_id: string
  batch_number: string
  mfg_batch_number: string
  mfg_expiry_date: string
  pack_date: string
  prepack_expiry_date: string
  quantity_packed: number
  current_balance: number
  wastage_quantity: number
  packed_by?: string | null
  packed_by_name?: string | null
  verified_by?: string | null
  verified_by_name?: string | null
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_notes?: string | null
  qr_code_data?: string | null
  status: BatchStatus
  created_at: string
  updated_at: string
  // Linked item details
  prepack_item?: PrepackItem
  // Calculated runtime helpers
  days_to_expiry?: number
  is_expired?: boolean
  is_near_expiry?: boolean
}

export interface PrepackUsageLog {
  id: string
  hospital_id: string
  batch_id: string
  prepack_item_id: string
  transaction_type: UsageTransactionType
  quantity: number
  department_id?: string | null
  ward_name?: string | null
  recipient_name?: string | null
  issued_by?: string | null
  issued_by_name?: string | null
  reference_no?: string | null
  remarks?: string | null
  created_at: string
  batch?: PrepackBatch
  prepack_item?: PrepackItem
}

/** Store-to-Counter Transfer Model */
export interface PrepackTransfer {
  id: string
  hospital_id: string
  transfer_number: string
  prepack_item_id: string
  drug_id?: string | null
  quantity_transferred: number
  from_location: string
  to_location: string
  source_batch_no?: string | null
  source_expiry_date?: string | null
  store_stock_before: number
  store_stock_after: number
  counter_stock_before: number
  counter_stock_after: number
  transferred_by?: string | null
  transferred_by_name: string
  received_by_name?: string | null
  transfer_date: string
  reference_no?: string | null
  status: 'pending' | 'completed' | 'cancelled'
  remarks?: string | null
  created_at: string
  updated_at: string
  prepack_item?: PrepackItem
}

/** Statutory Malaysian Treasury KEW.PS-4 Kad Petak Transaction Model */
export interface PrepackKewPs4Transaction {
  id: string
  hospital_id: string
  prepack_item_id: string
  drug_id?: string | null
  batch_id?: string | null
  transaction_date: string
  transaction_type: PrepackKewPs4TransactionType
  transaction_number: string
  source_destination: string
  receipt_qty: number | null
  issue_qty: number | null
  balance_qty: number
  balance_type: 'store_stock' | 'counter_stock' | 'finished_pack' | 'aggregate'
  officer_name: string
  officer_id?: string | null
  reference_no?: string | null
  batch_number?: string | null
  mfg_expiry_date?: string | null
  prepack_expiry_date?: string | null
  remarks?: string | null
  created_at: string
  prepack_item?: PrepackItem
  batch?: PrepackBatch
}

/** Statutory Malaysian Treasury KEW.PS-14 Annual Physical Verification Model */
export interface PrepackStoreVerification {
  id: string
  hospital_id: string
  prepack_item_id: string
  drug_id?: string | null
  verification_year: number
  physical_count: number
  kewps_balance: number
  system_count: number
  diff_physical_kewps: number
  diff_physical_system: number
  is_tally: boolean
  verifier_name: string
  verifier_ic?: string | null
  verifier_jawatan?: string | null
  verified_at: string
  remarks?: string | null
  created_at: string
}

export interface PrepackDashboardStats {
  total_items: number
  total_units_in_stock: number
  total_store_bulk_units: number
  total_counter_raw_units: number
  total_transfers_count: number
  items_needing_repack: number
  zero_stock_items: number
  batches_expiring_soon: number
  today_packed_units: number
  recent_batches: PrepackBatch[]
  critical_items: PrepackItem[]
}

export type LabelFormat = 
  | 'uod_50x25' 
  | 'uod_40x20' 
  | 'bulk_70x35' 
  | 'bulk_60x40' 
  | 'sheet_a4_24'

export interface LabelPrintConfig {
  format: LabelFormat
  quantity: number
  include_qr: boolean
  include_mfg_details: boolean
  hospital_header: string
  warning_text?: string
}
