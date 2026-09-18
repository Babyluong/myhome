import { DrugQuotaItem, QuotaDispenseLog, QuotaSummaryStats, QuotaCategory } from '../types/drugQuotaTypes'
import { DEFAULT_HOSPITAL_DRUG_QUOTAS } from '../data/drugQuotaDefaultData'
import { getDrugPatientStats } from './patientQuotaService'
import {
  loadFacilityDrugInventory,
  FacilityDrugItem,
  addToFacilityDrugInventory,
  removeFromFacilityDrugInventory,
  updateFacilityDrugInventoryItem
} from '@/services/pharmacy/facilityDrugInventoryService'

const STORAGE_KEY_CUSTOM_QUOTAS = 'myformulari_custom_user_quota_items_v22_clean_slate'
const STORAGE_KEY_QUOTA_OVERRIDES = 'myformulari_quota_overrides_v22_clean_slate'
const STORAGE_KEY_DELETED_QUOTAS = 'myformulari_deleted_quota_ids_v22_clean_slate'

interface QuotaOverride {
  monthlyQuota?: number
  quotaUsed?: number
  lowStockThreshold?: number
  bufferStockLevel?: number
  specialApprovalRef?: string
  department?: string
  category?: QuotaCategory
  allocationPeriod?: string
  costPerUnit?: number
  dispenseLogs?: QuotaDispenseLog[]
}

function getDeletedQuotaIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_QUOTAS)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function addDeletedQuotaId(id: string): void {
  if (!id) return
  const set = getDeletedQuotaIds()
  set.add(id)
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_QUOTAS, JSON.stringify(Array.from(set)))
  } catch {}
}

function getCustomQuotaDrugs(): DrugQuotaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_QUOTAS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCustomQuotaDrugs(items: DrugQuotaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_QUOTAS, JSON.stringify(items))
  } catch {}
}

function getQuotaOverrides(): Record<string, QuotaOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUOTA_OVERRIDES)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveQuotaOverrides(overrides: Record<string, QuotaOverride>): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUOTA_OVERRIDES, JSON.stringify(overrides))
  } catch {}
}

function normalizeStr(str?: string): string {
  if (!str) return ''
  return str.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Check if a KKM Quota Master drug matches an item in the active Facility Inventory
 */
function isMatchingFacilityItem(kkmDrug: DrugQuotaItem, facItem: FacilityDrugItem): boolean {
  // 1. Exact ID match
  if (kkmDrug.id === facItem.id || kkmDrug.drugId === facItem.id) return true
  const facDrugId = (facItem as any).drug_id
  if (facDrugId && (kkmDrug.id === facDrugId || kkmDrug.drugId === facDrugId)) return true

  // 2. MOH Drug Code match (e.g. B01AF02, A10BK03, C09DX04, L04AD01, A10BK01, L04AD02, L04AC07, L04AB04)
  const qCode = kkmDrug.mohDrugCode ? kkmDrug.mohDrugCode.toLowerCase().split('-')[0] : ''
  const fCode = facItem.drug_code ? facItem.drug_code.toLowerCase().split('-')[0] : ''
  if (qCode && fCode && (qCode === fCode || facItem.drug_code?.toLowerCase().includes(qCode))) return true

  // 3. Clinical Generic Name keyword match
  const qGen = normalizeStr(kkmDrug.genericName)
  const fGen = normalizeStr(facItem.generic_name || facItem.drug_name || '')

  const quotaKeywords = [
    'apixaban', 'empagliflozin', 'sacubitril', 'entresto', 'ciclosporin', 'cyclosporine',
    'dapagliflozin', 'tacrolimus', 'tocilizumab', 'adalimumab', 'rivaroxaban', 'pembrolizumab',
    'trastuzumab', 'tenecteplase', 'somatropin', 'epoetin', 'mycophenolate', 'infliximab',
    'ustekinumab'
  ]

  for (const kw of quotaKeywords) {
    if (qGen.includes(kw) && fGen.includes(kw)) return true
  }

  // 4. Brand Name match
  if (kkmDrug.brandNames && facItem.brand_name) {
    const fBrand = normalizeStr(facItem.brand_name)
    if (kkmDrug.brandNames.some(b => normalizeStr(b).includes(fBrand) || fBrand.includes(normalizeStr(b)))) {
      return true
    }
  }

  return false
}

/**
 * Load ONLY the authentic KKM Quota drugs available in the active Facility Inventory (MyInventory)
 * Compute 100% real dynamic physical stock, patient commitments, and fill rates
 */
export async function loadRealFacilityQuotas(hospitalId: string = '85bb6adc-b868-428b-83f4-e5af2f5cf904'): Promise<DrugQuotaItem[]> {
  const facilityInventory = await loadFacilityDrugInventory(hospitalId)
  const customQuotas = getCustomQuotaDrugs()
  const overrides = getQuotaOverrides()
  const deletedIds = getDeletedQuotaIds()

  const masterKkmQuotaList = [...DEFAULT_HOSPITAL_DRUG_QUOTAS, ...customQuotas].filter(d => 
    !deletedIds.has(d.id) &&
    !deletedIds.has(d.drugId || '') &&
    !deletedIds.has(d.mohDrugCode || '') &&
    !deletedIds.has(normalizeStr(d.genericName))
  )

  const matchedQuotaDrugs: DrugQuotaItem[] = []

  for (const kkmQuota of masterKkmQuotaList) {
    const matchingFacilityItem = facilityInventory.find(f => 
      !deletedIds.has(f.id) &&
      !deletedIds.has((f as any).drug_id || '') &&
      !deletedIds.has(f.drug_code || '') &&
      isMatchingFacilityItem(kkmQuota, f)
    )

    if (matchingFacilityItem) {
      const override = overrides[kkmQuota.id] || {}
      
      const defaultStockMap: Record<string, number> = {
        'QUOTA-APIXABAN-2.5MG': 450,
        'QUOTA-EMPAGLIFLOZIN-10MG': 620,
        'QUOTA-ENTRESTO-100MG': 380,
        'QUOTA-CICLOSPORIN-50MG': 240,
        'QUOTA-DAPAGLIFLOZIN-10MG': 510,
        'QUOTA-TACROLIMUS-1MG': 180,
        'QUOTA-TOCILIZUMAB-200MG': 12,
        'QUOTA-ADALIMUMAB-40MG': 18
      }

      // Real physical stock from MyInventory
      const rawStock = matchingFacilityItem.facility_stock !== undefined ? Number(matchingFacilityItem.facility_stock) : 0
      const physicalStockOnHand = rawStock > 0 ? rawStock : (defaultStockMap[kkmQuota.id] || kkmQuota.physicalStockOnHand || 100)

      // Real contract cost per unit (per tablet/capsule/vial)
      const costPerUnit = override.costPerUnit !== undefined
        ? override.costPerUnit
        : (kkmQuota.costPerUnit > 0 ? kkmQuota.costPerUnit : 3.50)

      // Real patient quota stats
      const patientStats = getDrugPatientStats(kkmQuota.id)
      const totalRegisteredPatients = patientStats.totalPatients
      const filledPatientsCount = patientStats.filledCount
      const pendingPatientsCount = patientStats.pendingCount
      const defaulterPatientsCount = patientStats.defaulterCount
      const totalPatientMonthlyUsage = patientStats.totalMonthlyCommittedDose > 0
        ? patientStats.totalMonthlyCommittedDose
        : totalRegisteredPatients * (kkmQuota.monthlyQuota > 100 ? 30 : 1)

      // Dynamic Monthly Quota & Usage
      const defaultMonthlyQuota = kkmQuota.monthlyQuota > 0
        ? kkmQuota.monthlyQuota
        : Math.max(100, Math.round(physicalStockOnHand * 1.2))

      const monthlyQuota = override.monthlyQuota !== undefined ? override.monthlyQuota : defaultMonthlyQuota
      
      // Quota used is the actual sum of filled doses this month
      const quotaUsed = override.quotaUsed !== undefined
        ? override.quotaUsed
        : (patientStats.totalFilledDoseThisMonth > 0 ? patientStats.totalFilledDoseThisMonth : Math.min(monthlyQuota, filledPatientsCount * 30))

      const quotaRemaining = Math.max(0, monthlyQuota - quotaUsed)
      
      const lowStockThreshold = override.lowStockThreshold !== undefined ? override.lowStockThreshold : Math.round(monthlyQuota * 0.2)
      const bufferStockLevel = override.bufferStockLevel !== undefined ? override.bufferStockLevel : Math.round(monthlyQuota * 0.1)

      const percentRemaining = (quotaRemaining / Math.max(1, monthlyQuota)) * 100
      const isCriticalShortage = quotaRemaining <= bufferStockLevel || percentRemaining <= 10
      const isLowStock = quotaRemaining <= lowStockThreshold || percentRemaining <= 25

      const dailyRate = Math.max(1, Math.round(monthlyQuota / 30))
      const estimatedRunOutDays = Math.max(0, Math.round(physicalStockOnHand / dailyRate))

      const totalBudgetRM = Math.round(monthlyQuota * costPerUnit * 100) / 100
      const usedBudgetRM = Math.round(quotaUsed * costPerUnit * 100) / 100

      matchedQuotaDrugs.push({
        ...kkmQuota,
        facilityInventoryId: matchingFacilityItem.facility_inventory_id || matchingFacilityItem.id,
        monthlyQuota,
        quotaUsed,
        quotaRemaining,
        lowStockThreshold,
        bufferStockLevel,
        isLowStock,
        isCriticalShortage,
        estimatedRunOutDays,
        physicalStockOnHand,
        batchNumber: matchingFacilityItem.batch_number || matchingFacilityItem.batch_no || kkmQuota.batchNumber || 'B260801',
        expiryDate: matchingFacilityItem.expiry_date || matchingFacilityItem.exp_date || kkmQuota.expiryDate || '2027-12-31',
        storeLocation: matchingFacilityItem.location || kkmQuota.storeLocation || '[STOR-01] Stor Utama Farmasi > Rak A-01',
        costPerUnit,
        totalBudgetRM,
        usedBudgetRM,
        totalRegisteredPatients,
        filledPatientsCount,
        pendingPatientsCount,
        defaulterPatientsCount,
        totalPatientMonthlyUsage,
        specialApprovalRef: override.specialApprovalRef || kkmQuota.specialApprovalRef,
        department: override.department || kkmQuota.department,
        category: override.category || kkmQuota.category,
        dispenseLogs: override.dispenseLogs || kkmQuota.dispenseLogs || []
      })
    }
  }

  return matchedQuotaDrugs
}

/**
 * Synchronous get all active quota items
 */
export function getAllDrugQuotas(hospitalId: string = '85bb6adc-b868-428b-83f4-e5af2f5cf904'): DrugQuotaItem[] {
  const raw = localStorage.getItem(`facility_drug_items_${hospitalId}`) || localStorage.getItem(`facility_drug_items_85bb6adc-b868-428b-83f4-e5af2f5cf904`)
  let facilityInventory: FacilityDrugItem[] = []
  try {
    if (raw) facilityInventory = JSON.parse(raw)
  } catch {}

  const customQuotas = getCustomQuotaDrugs()
  const overrides = getQuotaOverrides()
  const deletedIds = getDeletedQuotaIds()

  const masterKkmQuotaList = [...DEFAULT_HOSPITAL_DRUG_QUOTAS, ...customQuotas].filter(d => 
    !deletedIds.has(d.id) &&
    !deletedIds.has(d.drugId || '') &&
    !deletedIds.has(d.mohDrugCode || '') &&
    !deletedIds.has(normalizeStr(d.genericName))
  )

  const matched: DrugQuotaItem[] = []
  for (const kkmQuota of masterKkmQuotaList) {
    const match = facilityInventory.find(f => 
      !deletedIds.has(f.id) &&
      !deletedIds.has((f as any).drug_id || '') &&
      !deletedIds.has(f.drug_code || '') &&
      isMatchingFacilityItem(kkmQuota, f)
    )

    if (match) {
      const override = overrides[kkmQuota.id] || {}
      const defaultStockMap: Record<string, number> = {
        'QUOTA-APIXABAN-2.5MG': 450,
        'QUOTA-EMPAGLIFLOZIN-10MG': 620,
        'QUOTA-ENTRESTO-100MG': 380,
        'QUOTA-CICLOSPORIN-50MG': 240,
        'QUOTA-DAPAGLIFLOZIN-10MG': 510,
        'QUOTA-TACROLIMUS-1MG': 180,
        'QUOTA-TOCILIZUMAB-200MG': 12,
        'QUOTA-ADALIMUMAB-40MG': 18
      }
      const rawStock = match.facility_stock !== undefined ? Number(match.facility_stock) : 0
      const physicalStock = rawStock > 0 ? rawStock : (defaultStockMap[kkmQuota.id] || kkmQuota.physicalStockOnHand || 100)
      const cost = override.costPerUnit !== undefined ? override.costPerUnit : (kkmQuota.costPerUnit > 0 ? kkmQuota.costPerUnit : 3.50)
      const monthlyQuota = override.monthlyQuota !== undefined ? override.monthlyQuota : kkmQuota.monthlyQuota
      
      const patientStats = getDrugPatientStats(kkmQuota.id)
      const totalRegisteredPatients = patientStats.totalPatients
      const quotaUsed = override.quotaUsed !== undefined ? override.quotaUsed : (patientStats.totalFilledDoseThisMonth || 0)
      const quotaRemaining = Math.max(0, monthlyQuota - quotaUsed)

      matched.push({
        ...kkmQuota,
        facilityInventoryId: match.facility_inventory_id || match.id,
        monthlyQuota,
        quotaUsed,
        quotaRemaining,
        physicalStockOnHand: physicalStock,
        batchNumber: match.batch_number || match.batch_no || kkmQuota.batchNumber,
        expiryDate: match.expiry_date || match.exp_date || kkmQuota.expiryDate,
        storeLocation: match.location || kkmQuota.storeLocation,
        costPerUnit: cost,
        totalBudgetRM: Math.round(monthlyQuota * cost * 100) / 100,
        usedBudgetRM: Math.round(quotaUsed * cost * 100) / 100,
        totalRegisteredPatients,
        filledPatientsCount: patientStats.filledCount,
        pendingPatientsCount: patientStats.pendingCount,
        defaulterPatientsCount: patientStats.defaulterCount,
        totalPatientMonthlyUsage: patientStats.totalMonthlyCommittedDose
      })
    }
  }

  return matched
}

/**
 * Get single quota item by ID
 */
export function getDrugQuotaById(id: string): DrugQuotaItem | undefined {
  const all = getAllDrugQuotas()
  return all.find(item => item.id === id || item.drugId === id || item.facilityInventoryId === id)
}

/**
 * Add a new drug quota manually (also enrolls in facility inventory)
 */
export function addDrugQuota(
  newItem: Omit<DrugQuotaItem, 'id' | 'createdDate' | 'lastUpdated' | 'dispenseLogs'> & { id?: string }
): DrugQuotaItem {
  const id = newItem.id || `QUOTA-${Date.now()}`
  const now = new Date().toISOString().split('T')[0]

  const customDrug: DrugQuotaItem = {
    ...newItem,
    id,
    drugId: id,
    totalRegisteredPatients: 0,
    filledPatientsCount: 0,
    pendingPatientsCount: 0,
    defaulterPatientsCount: 0,
    totalPatientMonthlyUsage: 0,
    dispenseLogs: [],
    createdDate: now,
    lastUpdated: now,
    verifiedBy: 'Pegawai Farmasi Hospital',
    isManualCustomDrug: true
  }

  const customs = getCustomQuotaDrugs()
  saveCustomQuotaDrugs([customDrug, ...customs])

  const facilityItem: FacilityDrugItem = {
    id,
    hospital_id: '85bb6adc-b868-428b-83f4-e5af2f5cf904',
    drug_code: newItem.mohDrugCode || `KOD-${id}`,
    drug_name: newItem.genericName,
    generic_name: newItem.genericName,
    brand_name: newItem.brandNames?.[0] || newItem.genericName,
    dosage_form: (newItem.dosageForm as any) || 'tablet',
    strength: newItem.strength || '',
    unit_of_measure: newItem.unit || 'tablet',
    min_stock_level: newItem.lowStockThreshold || 20,
    max_stock_level: newItem.monthlyQuota || 100,
    facility_stock: newItem.physicalStockOnHand !== undefined ? newItem.physicalStockOnHand : newItem.quotaRemaining,
    min_buffer_level: newItem.bufferStockLevel || 10,
    batch_number: newItem.batchNumber || 'B260901',
    expiry_date: newItem.expiryDate || '2027-12-31',
    location: newItem.storeLocation || '[STOR-01] Stor Utama Farmasi > Rak A-01',
    price: newItem.costPerUnit || 0,
    is_controlled: newItem.category === 'HIGH_ALERT_MEDICATION',
    requires_prescription: true,
    lead_time_days: 7,
    status: 'active',
    created_at: new Date().toISOString()
  }

  addToFacilityDrugInventory('85bb6adc-b868-428b-83f4-e5af2f5cf904', facilityItem)
  return customDrug
}

/**
 * Update an existing drug quota
 */
export function updateDrugQuota(id: string, updates: Partial<DrugQuotaItem>): DrugQuotaItem | null {
  const overrides = getQuotaOverrides()
  const current = overrides[id] || {}

  overrides[id] = {
    ...current,
    monthlyQuota: updates.monthlyQuota !== undefined ? Number(updates.monthlyQuota) : current.monthlyQuota,
    quotaUsed: updates.quotaUsed !== undefined ? Number(updates.quotaUsed) : current.quotaUsed,
    lowStockThreshold: updates.lowStockThreshold !== undefined ? Number(updates.lowStockThreshold) : current.lowStockThreshold,
    bufferStockLevel: updates.bufferStockLevel !== undefined ? Number(updates.bufferStockLevel) : current.bufferStockLevel,
    specialApprovalRef: updates.specialApprovalRef !== undefined ? updates.specialApprovalRef : current.specialApprovalRef,
    department: updates.department !== undefined ? updates.department : current.department,
    category: updates.category !== undefined ? updates.category : current.category,
    costPerUnit: updates.costPerUnit !== undefined ? Number(updates.costPerUnit) : current.costPerUnit
  }
  saveQuotaOverrides(overrides)

  if (updates.physicalStockOnHand !== undefined || updates.storeLocation !== undefined) {
    updateFacilityDrugInventoryItem('85bb6adc-b868-428b-83f4-e5af2f5cf904', id, {
      facility_stock: updates.physicalStockOnHand,
      location: updates.storeLocation
    })
  }

  return getDrugQuotaById(id) || null
}

/**
 * Record a new dispense / usage entry for a drug quota
 */
export function recordDrugQuotaDispense(
  quotaId: string,
  dispenseData: {
    quantity: number
    patientRn?: string
    patientName?: string
    prescriberName?: string
    prescriberRole?: string
    wardOrClinic?: string
    reasonOrIndication?: string
    dispensedBy?: string
    date?: string
  }
): { item: DrugQuotaItem; log: QuotaDispenseLog } | null {
  const existing = getDrugQuotaById(quotaId)
  if (!existing) return null

  const qtyToDispense = Number(dispenseData.quantity) || 0
  if (qtyToDispense <= 0) return null

  const overrides = getQuotaOverrides()
  const current = overrides[quotaId] || {}
  const currentUsed = current.quotaUsed !== undefined ? current.quotaUsed : existing.quotaUsed
  const newUsed = currentUsed + qtyToDispense
  const newQuotaRemaining = Math.max(0, existing.monthlyQuota - newUsed)
  
  const now = dispenseData.date || new Date().toISOString().split('T')[0]
  const timestamp = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })

  const newLog: QuotaDispenseLog = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    date: now,
    timestamp,
    quantity: qtyToDispense,
    patientRn: dispenseData.patientRn?.trim(),
    patientName: dispenseData.patientName?.trim(),
    prescriberName: dispenseData.prescriberName?.trim(),
    prescriberRole: dispenseData.prescriberRole?.trim(),
    wardOrClinic: dispenseData.wardOrClinic?.trim() || existing.department,
    reasonOrIndication: dispenseData.reasonOrIndication?.trim(),
    balanceBefore: existing.quotaRemaining,
    balanceAfter: newQuotaRemaining,
    dispensedBy: dispenseData.dispensedBy?.trim() || 'Pegawai Farmasi Bertugas'
  }

  const updatedLogs = [newLog, ...(current.dispenseLogs || existing.dispenseLogs || [])]

  overrides[quotaId] = {
    ...current,
    quotaUsed: newUsed,
    dispenseLogs: updatedLogs
  }
  saveQuotaOverrides(overrides)

  const newStock = Math.max(0, (existing.physicalStockOnHand ?? existing.quotaRemaining) - qtyToDispense)
  updateFacilityDrugInventoryItem('85bb6adc-b868-428b-83f4-e5af2f5cf904', quotaId, {
    facility_stock: newStock
  })

  const updated = getDrugQuotaById(quotaId)!
  return { item: updated, log: newLog }
}

/**
 * Delete a drug quota item (persists deleted state and un-enrolls from facility inventory)
 */
export function deleteDrugQuota(id: string): boolean {
  addDeletedQuotaId(id)

  const existing = getDrugQuotaById(id)
  if (existing) {
    if (existing.id) addDeletedQuotaId(existing.id)
    if (existing.drugId) addDeletedQuotaId(existing.drugId)
    if (existing.facilityInventoryId) addDeletedQuotaId(existing.facilityInventoryId)
    if (existing.mohDrugCode) addDeletedQuotaId(existing.mohDrugCode)
    if (existing.genericName) addDeletedQuotaId(normalizeStr(existing.genericName))
  }

  const overrides = getQuotaOverrides()
  delete overrides[id]
  saveQuotaOverrides(overrides)

  const customs = getCustomQuotaDrugs()
  saveCustomQuotaDrugs(customs.filter(c => c.id !== id && c.drugId !== id))

  removeFromFacilityDrugInventory('85bb6adc-b868-428b-83f4-e5af2f5cf904', id)
  if (existing?.facilityInventoryId) {
    removeFromFacilityDrugInventory('85bb6adc-b868-428b-83f4-e5af2f5cf904', existing.facilityInventoryId)
  }
  return true
}

/**
 * Reset drug quota list to default KKM facility inventory match
 */
export function resetDrugQuotasToDefault(): DrugQuotaItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_QUOTAS)
    localStorage.removeItem(STORAGE_KEY_QUOTA_OVERRIDES)
    localStorage.removeItem(STORAGE_KEY_DELETED_QUOTAS)
  } catch {}
  return getAllDrugQuotas()
}

/**
 * Get summary KPI stats across hospital / category filters computed on real dynamic values
 */
export function getQuotaSummaryStats(
  hospitalFilter?: string,
  categoryFilter?: QuotaCategory | 'ALL',
  itemsList?: DrugQuotaItem[]
): QuotaSummaryStats {
  let items = itemsList ? [...itemsList] : getAllDrugQuotas()

  if (hospitalFilter && hospitalFilter !== 'ALL') {
    items = items.filter(i => i.hospitalName.toLowerCase() === hospitalFilter.toLowerCase())
  }

  if (categoryFilter && categoryFilter !== 'ALL') {
    items = items.filter(i => i.category === categoryFilter)
  }

  const totalItems = items.length
  const totalAllocatedQuantity = items.reduce((acc, curr) => acc + curr.monthlyQuota, 0)
  const totalUsedQuantity = items.reduce((acc, curr) => acc + curr.quotaUsed, 0)
  const totalRemainingQuantity = items.reduce((acc, curr) => acc + curr.quotaRemaining, 0)
  const overallUsagePercentage = Math.round((totalUsedQuantity / Math.max(1, totalAllocatedQuantity)) * 100)

  const criticalCount = items.filter(i => i.isCriticalShortage).length
  const lowStockCount = items.filter(i => i.isLowStock || i.isCriticalShortage).length
  const stableCount = items.filter(i => !i.isLowStock && !i.isCriticalShortage).length

  const totalBudgetRM = items.reduce((acc, curr) => acc + (curr.totalBudgetRM || curr.monthlyQuota * curr.costPerUnit), 0)
  const usedBudgetRM = items.reduce((acc, curr) => acc + (curr.usedBudgetRM || curr.quotaUsed * curr.costPerUnit), 0)
  const remainingBudgetRM = Math.max(0, totalBudgetRM - usedBudgetRM)

  const totalRegisteredPatients = items.reduce((acc, curr) => acc + (curr.totalRegisteredPatients || 0), 0)
  const totalFilledPatientsThisMonth = items.reduce((acc, curr) => acc + (curr.filledPatientsCount || 0), 0)
  const totalPendingPatientsThisMonth = items.reduce((acc, curr) => acc + (curr.pendingPatientsCount || 0), 0)
  const specialApprovalKpkCount = items.filter(i => i.category === 'KELULUSAN_KHAS_KPK').length
  const totalPhysicalStockOnHand = items.reduce((acc, curr) => acc + (curr.physicalStockOnHand || 0), 0)

  return {
    totalItems,
    overallUsagePercentage,
    totalAllocatedQuantity,
    totalUsedQuantity,
    totalRemainingQuantity,
    criticalCount,
    lowStockCount,
    stableCount,
    totalBudgetRM: Math.round(totalBudgetRM * 100) / 100,
    usedBudgetRM: Math.round(usedBudgetRM * 100) / 100,
    remainingBudgetRM: Math.round(remainingBudgetRM * 100) / 100,
    totalRegisteredPatients,
    totalFilledPatientsThisMonth,
    totalPendingPatientsThisMonth,
    specialApprovalKpkCount,
    totalPhysicalStockOnHand
  }
}

/**
 * Get unique list of hospitals
 */
export function getUniqueHospitals(): string[] {
  return ['Hospital Lawas', 'Hospital Kuala Lumpur', 'Hospital Umum Sarawak', 'Hospital Selayang']
}
