/**
 * Paediatric Catalogue Service (MyFormulari <-> MyInventory Bridge)
 * 100% Real Database Queries: pharmacy_unit_catalog, pharmacy_unit_catalog_items, drugs, facility_drug_inventory
 */

import { supabase, isSupabaseConfigured } from '@/services/supabase'
import { getDrugPrescriberCategory } from '@/lib/drugCategorizer'
import { getAllPaediatricPresets } from './paediatricDoseService'
import type { ApiResponse } from '@/types'

export const PAEDIATRIC_DEPARTMENT_ID = '9e864dc8-6a6c-47c6-9d74-57d87ccd06e9'
export const PAEDIATRIC_MODULE_CODE = 'paediatric_ward'
export const DEFAULT_HOSPITAL_ID = '85bb6adc-b868-428b-83f4-e5af2f5cf904'

export interface PaediatricCatalogueDrugInfo {
  id: string
  drug_code: string
  drug_name: string
  generic_name: string | null
  brand_name: string | null
  dosage_form: string
  strength: string | null
  unit_of_measure: string | null
  category_id?: string | null
  is_controlled?: boolean
  storage_conditions?: string | null
  procurement_vote?: string | null
  price?: number | null
  packaging_description?: string | null
}

export interface PaediatricCatalogueItem {
  id: string
  catalog_id: string
  hospital_id: string
  item_type: 'drug'
  drug_id: string
  is_active: boolean
  min_limit: number
  max_limit: number | null
  reorder_level: number
  procurement_vote?: string | null
  created_at: string
  updated_at: string
  drug: PaediatricCatalogueDrugInfo
  facility_stock: number
  facility_min_buffer: number
  store_location: string
  batch_number?: string | null
  expiry_date?: string | null
  clinical_group: string
  prescriber_category: string
  has_paediatric_dose_protocol: boolean
}

export interface PaediatricCatalogHeader {
  id: string
  hospital_id: string
  department_id: string
  module_code: string
  current_drug_count: number
  status: string
}

/**
 * Determine clinical categorization for paediatric drugs
 */
export function classifyPaediatricDrug(drugName: string, genericName?: string | null): string {
  const text = `${drugName} ${genericName || ''}`.toLowerCase()

  if (
    text.includes('amoxicillin') ||
    text.includes('ampicillin') ||
    text.includes('ceftriaxone') ||
    text.includes('cefuroxime') ||
    text.includes('cefotaxime') ||
    text.includes('gentamicin') ||
    text.includes('azithromycin') ||
    text.includes('erythromycin') ||
    text.includes('penicillin') ||
    text.includes('acyclovir') ||
    text.includes('cloxacillin') ||
    text.includes('metronidazole') ||
    text.includes('vancomycin') ||
    text.includes('meropenem') ||
    text.includes('oseltamivir') ||
    text.includes('albendazole')
  ) {
    return 'Antibiotics / Antimicrobials'
  }

  if (
    text.includes('paracetamol') ||
    text.includes('ibuprofen') ||
    text.includes('mefenamic') ||
    text.includes('diclofenac') ||
    text.includes('morphine') ||
    text.includes('fentanyl') ||
    text.includes('tramadol')
  ) {
    return 'Analgesics & Antipyretics'
  }

  if (
    text.includes('salbutamol') ||
    text.includes('budesonide') ||
    text.includes('ipratropium') ||
    text.includes('bromhexine') ||
    text.includes('chlorpheniramine') ||
    text.includes('cetirizine') ||
    text.includes('loratadine') ||
    text.includes('montelukast') ||
    text.includes('inhaler') ||
    text.includes('syrup') && text.includes('cough')
  ) {
    return 'Respiratory & Allergy'
  }

  if (
    text.includes('diazepam') ||
    text.includes('midazolam') ||
    text.includes('adrenaline') ||
    text.includes('epinephrine') ||
    text.includes('atropine') ||
    text.includes('sodium valproate') ||
    text.includes('carbamazepine') ||
    text.includes('phenytoin') ||
    text.includes('phenobarbitone') ||
    text.includes('prostin')
  ) {
    return 'Emergency, CNS & Resuscitation'
  }

  if (
    text.includes('ors') ||
    text.includes('rehydration') ||
    text.includes('dextrose') ||
    text.includes('sodium chloride') ||
    text.includes('potassium') ||
    text.includes('hartmann') ||
    text.includes('saline')
  ) {
    return 'Fluids & Electrolytes'
  }

  if (
    text.includes('metoclopramide') ||
    text.includes('ondansetron') ||
    text.includes('domperidone') ||
    text.includes('lactulose') ||
    text.includes('omeprazole') ||
    text.includes('ranitidine') ||
    text.includes('probiotic') ||
    text.includes('magnesium')
  ) {
    return 'Gastrointestinal'
  }

  if (
    text.includes('eye drop') ||
    text.includes('ear drop') ||
    text.includes('ointment') ||
    text.includes('cream') ||
    text.includes('nasal')
  ) {
    return 'Ophthalmic, Otic & Topical'
  }

  return 'General & Supplements'
}

/**
 * Retrieve or automatically provision the Paediatric Unit catalog header
 */
export async function getOrCreatePaediatricUnitCatalog(
  hospitalId: string = DEFAULT_HOSPITAL_ID
): Promise<PaediatricCatalogHeader> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client not configured')
  }

  // 1. Try to find existing
  const { data: existing, error: selectErr } = await supabase
    .from('pharmacy_unit_catalog')
    .select('id, hospital_id, department_id, module_code, current_drug_count, status')
    .or(`department_id.eq.${PAEDIATRIC_DEPARTMENT_ID},module_code.eq.${PAEDIATRIC_MODULE_CODE}`)
    .maybeSingle()

  if (selectErr) {
    console.error('Error fetching paediatric catalog header:', selectErr)
  }

  if (existing) {
    return existing as PaediatricCatalogHeader
  }

  // 2. Create if not found
  const { data: created, error: insertErr } = await supabase
    .from('pharmacy_unit_catalog')
    .insert({
      hospital_id: hospitalId,
      department_id: PAEDIATRIC_DEPARTMENT_ID,
      module_code: PAEDIATRIC_MODULE_CODE,
      can_indent_drugs: true,
      can_indent_non_drugs: true,
      current_drug_count: 0,
      current_non_drug_count: 0,
      status: 'active',
    })
    .select('id, hospital_id, department_id, module_code, current_drug_count, status')
    .single()

  if (insertErr) {
    console.error('Error creating paediatric unit catalog:', insertErr)
    throw insertErr
  }

  return created as PaediatricCatalogHeader
}

/**
 * Load all drugs registered in the Paediatric Catalogue with facility stock & presets joined
 */
export async function loadPaediatricCatalogue(
  hospitalId: string = DEFAULT_HOSPITAL_ID
): Promise<{
  catalog: PaediatricCatalogHeader
  items: PaediatricCatalogueItem[]
}> {
  const catalog = await getOrCreatePaediatricUnitCatalog(hospitalId)

  // 1. Query unit catalog items with drug master data
  const { data: rawItems, error: itemsErr } = await supabase
    .from('pharmacy_unit_catalog_items')
    .select(`
      id,
      catalog_id,
      hospital_id,
      item_type,
      drug_id,
      is_active,
      min_limit,
      max_limit,
      reorder_level,
      procurement_vote,
      created_at,
      updated_at,
      drug:drugs (
        id,
        drug_code,
        drug_name,
        generic_name,
        brand_name,
        dosage_form,
        strength,
        unit_of_measure,
        category_id,
        is_controlled,
        storage_conditions,
        procurement_vote,
        price,
        packaging_description
      )
    `)
    .eq('catalog_id', catalog.id)
    .eq('item_type', 'drug')
    .order('created_at', { ascending: false })

  if (itemsErr) {
    console.error('Error loading paediatric catalog items:', itemsErr)
    throw itemsErr
  }

  const itemsList = (rawItems || []).filter((item: any) => item.drug != null)
  const drugIds = itemsList.map((i: any) => i.drug_id).filter(Boolean)

  // 2. Fetch live facility stock balances for these drugs
  let stockMap = new Map<string, { stock: number; minBuffer: number; location: string; batch?: string; exp?: string }>()
  if (drugIds.length > 0) {
    const { data: facilityData } = await supabase
      .from('facility_drug_inventory')
      .select('drug_id, facility_stock, min_buffer_level, location, batch_number, expiry_date')
      .in('drug_id', drugIds)

    if (facilityData) {
      facilityData.forEach((f: any) => {
        stockMap.set(f.drug_id, {
          stock: f.facility_stock ?? 0,
          minBuffer: f.min_buffer_level ?? 20,
          location: f.location || 'Stor Utama Farmasi',
          batch: f.batch_number,
          exp: f.expiry_date,
        })
      })
    }
  }

  // 3. Check for existing paediatric dosage presets in system
  const allPresets = getAllPaediatricPresets()
  const presetNames = new Set(allPresets.map(p => p.drugName.trim().toLowerCase()))

  // 4. Map to complete PaediatricCatalogueItem
  const finalItems: PaediatricCatalogueItem[] = itemsList.map((row: any) => {
    const drug: PaediatricCatalogueDrugInfo = row.drug
    const facility = stockMap.get(drug.id)

    const drugNameLower = (drug.drug_name || '').toLowerCase()
    const genericNameLower = (drug.generic_name || '').toLowerCase()
    
    // Check if preset matches drug name or generic name
    const hasPreset = Array.from(presetNames).some(presetName => 
      drugNameLower.includes(presetName) || (genericNameLower && genericNameLower.includes(presetName))
    )

    return {
      id: row.id,
      catalog_id: row.catalog_id,
      hospital_id: row.hospital_id,
      item_type: 'drug',
      drug_id: row.drug_id,
      is_active: row.is_active ?? true,
      min_limit: row.min_limit ?? 5,
      max_limit: row.max_limit ?? null,
      reorder_level: row.reorder_level ?? 10,
      procurement_vote: row.procurement_vote || drug.procurement_vote || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      drug,
      facility_stock: facility?.stock ?? 0,
      facility_min_buffer: facility?.minBuffer ?? 20,
      store_location: facility?.location || 'Main Pharmacy Store > Paediatric Shelf',
      batch_number: facility?.batch,
      expiry_date: facility?.exp,
      clinical_group: classifyPaediatricDrug(drug.drug_name, drug.generic_name),
      prescriber_category: getDrugPrescriberCategory({
        ...drug,
        generic_name: drug.generic_name || undefined,
      }),
      has_paediatric_dose_protocol: hasPreset,
    }
  })

  // Sort items alphabetically A-Z by drug name
  finalItems.sort((a, b) => {
    const nameA = (a.drug?.drug_name || '').trim().toLowerCase()
    const nameB = (b.drug?.drug_name || '').trim().toLowerCase()
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true })
  })

  return { catalog, items: finalItems }
}

/**
 * Pick drugs from MyInventory catalogue and add them to the Paediatric Catalogue
 */
export async function addDrugsToPaediatricCatalogue(
  catalogId: string,
  hospitalId: string,
  userId: string,
  drugsToAdd: Array<{
    drug_id: string
    min_limit?: number
    max_limit?: number
    reorder_level?: number
    vote?: string | null
  }>
): Promise<{ addedCount: number }> {
  if (drugsToAdd.length === 0) return { addedCount: 0 }

  const rows = drugsToAdd.map(d => ({
    catalog_id: catalogId,
    hospital_id: hospitalId,
    item_type: 'drug',
    drug_id: d.drug_id,
    is_active: true,
    min_limit: d.min_limit ?? 5,
    max_limit: d.max_limit ?? 30,
    reorder_level: d.reorder_level ?? 10,
    procurement_vote: d.vote || null,
    last_updated_by: userId,
    last_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const { data, error } = await supabase
    .from('pharmacy_unit_catalog_items')
    .insert(rows)
    .select('id')

  if (error) {
    console.error('Error inserting drugs into paediatric catalog:', error)
    throw error
  }

  // Update total count
  const { count } = await supabase
    .from('pharmacy_unit_catalog_items')
    .select('*', { count: 'exact', head: true })
    .eq('catalog_id', catalogId)
    .eq('item_type', 'drug')

  if (count !== null) {
    await supabase
      .from('pharmacy_unit_catalog')
      .update({ current_drug_count: count, updated_at: new Date().toISOString() })
      .eq('id', catalogId)
  }

  return { addedCount: data?.length || 0 }
}

/**
 * Update stock limits or active status for a paediatric item
 */
export async function updatePaediatricCatalogueItem(
  itemId: string,
  updates: {
    min_limit?: number
    max_limit?: number | null
    reorder_level?: number
    is_active?: boolean
  }
): Promise<void> {
  const { error } = await supabase
    .from('pharmacy_unit_catalog_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)

  if (error) {
    console.error('Error updating paediatric catalog item:', error)
    throw error
  }
}

/**
 * Delete / Remove a drug from the Paediatric Catalogue
 */
export async function removePaediatricCatalogueItem(
  itemId: string,
  catalogId: string
): Promise<void> {
  const { error } = await supabase
    .from('pharmacy_unit_catalog_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error deleting paediatric catalog item:', error)
    throw error
  }

  // Sync count
  const { count } = await supabase
    .from('pharmacy_unit_catalog_items')
    .select('*', { count: 'exact', head: true })
    .eq('catalog_id', catalogId)
    .eq('item_type', 'drug')

  if (count !== null) {
    await supabase
      .from('pharmacy_unit_catalog')
      .update({ current_drug_count: count, updated_at: new Date().toISOString() })
      .eq('id', catalogId)
  }
}

/**
 * Search the MyInventory master drugs table for the picker modal
 */
export async function searchMyInventoryDrugsForPicker(
  hospitalId: string,
  searchQuery: string = '',
  voteFilter: string = 'all',
  existingDrugIds: string[] = [],
  page: number = 1,
  pageSize: number = 20
): Promise<{ drugs: PaediatricCatalogueDrugInfo[]; total: number }> {
  let query = supabase
    .from('drugs')
    .select(
      `
      id,
      drug_code,
      drug_name,
      generic_name,
      brand_name,
      dosage_form,
      strength,
      unit_of_measure,
      category_id,
      is_controlled,
      storage_conditions,
      procurement_vote,
      price,
      packaging_description
    `,
      { count: 'exact' }
    )
    .order('drug_name', { ascending: true })

  if (voteFilter && voteFilter !== 'all') {
    query = query.ilike('procurement_vote', voteFilter)
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim()
    query = query.or(
      `drug_code.ilike.%${q}%,drug_name.ilike.%${q}%,generic_name.ilike.%${q}%,brand_name.ilike.%${q}%`
    )
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error searching MyInventory drugs:', error)
    throw error
  }

  return {
    drugs: (data || []) as PaediatricCatalogueDrugInfo[],
    total: count || 0,
  }
}
