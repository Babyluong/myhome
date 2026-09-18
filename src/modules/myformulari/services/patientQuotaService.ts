import { PatientQuotaRecord, PatientRefillHistoryItem } from '../types/drugQuotaTypes'
import { DEFAULT_PATIENT_QUOTA_RECORDS } from '../data/patientQuotaDefaultData'
import { recordDrugQuotaDispense, getDrugQuotaById } from './drugQuotaService'

const STORAGE_KEY_PATIENT_QUOTA = 'myformulari_patient_quota_registry_v21_clean_slate'

/**
 * Get all patient quota records from localStorage (starts empty for clean slate)
 */
export function getAllPatientQuotas(): PatientQuotaRecord[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_PATIENT_QUOTA)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed to read patient quota database', err)
  }

  return []
}

/**
 * Save patient quota list to localStorage
 */
function saveAllPatientQuotas(records: PatientQuotaRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PATIENT_QUOTA, JSON.stringify(records))
  } catch (err) {
    console.error('Failed to save patient quota database', err)
  }
}

/**
 * Get all registered patients for a specific quota drug ID
 */
export function getPatientsForDrugQuota(quotaDrugId: string): PatientQuotaRecord[] {
  const all = getAllPatientQuotas()
  const qIdLower = quotaDrugId.toLowerCase()
  return all.filter(p => {
    if (p.quotaDrugId === quotaDrugId) return true
    const pIdLower = p.quotaDrugId.toLowerCase()
    if (pIdLower.includes('apx') && (qIdLower.includes('apx') || qIdLower.includes('apixaban'))) return true
    if (pIdLower.includes('apixaban') && (qIdLower.includes('apx') || qIdLower.includes('apixaban'))) return true
    if (pIdLower.includes('emp') && (qIdLower.includes('emp') || qIdLower.includes('empagliflozin'))) return true
    if (pIdLower.includes('ent') && (qIdLower.includes('ent') || qIdLower.includes('entresto') || qIdLower.includes('sacubitril'))) return true
    if (pIdLower.includes('cic') && (qIdLower.includes('cic') || qIdLower.includes('ciclosporin') || qIdLower.includes('neoral'))) return true
    if (pIdLower.includes('dap') && (qIdLower.includes('dap') || qIdLower.includes('dapagliflozin') || qIdLower.includes('forxiga'))) return true
    if (pIdLower.includes('tcz') && (qIdLower.includes('tcz') || qIdLower.includes('tocilizumab') || qIdLower.includes('actemra'))) return true
    if (pIdLower.includes('ada') && (qIdLower.includes('ada') || qIdLower.includes('adalimumab') || qIdLower.includes('humira'))) return true
    if (pIdLower.includes('tac') && (qIdLower.includes('tac') || qIdLower.includes('tacrolimus') || qIdLower.includes('prograf'))) return true
    if (pIdLower.includes('pem') && (qIdLower.includes('pem') || qIdLower.includes('pembrolizumab') || qIdLower.includes('keytruda'))) return true
    return false
  })
}

/**
 * Get single patient quota record by ID
 */
export function getPatientQuotaById(patientId: string): PatientQuotaRecord | undefined {
  const all = getAllPatientQuotas()
  return all.find(p => p.id === patientId)
}

/**
 * Add a new named patient to the quota registry
 */
export function addPatientQuota(
  newPatient: Omit<PatientQuotaRecord, 'id' | 'createdDate' | 'lastUpdated' | 'refillHistory'> & { id?: string }
): PatientQuotaRecord {
  const all = getAllPatientQuotas()
  const now = new Date().toISOString().split('T')[0]
  const id = newPatient.id || `PAT-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

  // Calculate default next refill due date (30 days from now if not provided)
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 30)
  const nextRefillDueDate = newPatient.nextRefillDueDate || defaultDueDate.toISOString().split('T')[0]

  const createdPatient: PatientQuotaRecord = {
    ...newPatient,
    id,
    monthlyDoseUnits: Number(newPatient.monthlyDoseUnits) || 30,
    currentMonthStatus: newPatient.currentMonthStatus || 'BELUM_DIISI',
    nextRefillDueDate,
    refillHistory: [],
    createdDate: now,
    lastUpdated: now
  }

  const updated = [createdPatient, ...all]
  saveAllPatientQuotas(updated)
  return createdPatient
}

/**
 * Record monthly refill for an individual patient
 */
export function recordPatientRefill(
  patientId: string,
  quantity: number,
  dispensedBy: string = 'Pegawai Farmasi Bertugas',
  remarks?: string,
  date?: string
): { patient: PatientQuotaRecord; refillItem: PatientRefillHistoryItem } | null {
  const all = getAllPatientQuotas()
  const index = all.findIndex(p => p.id === patientId)
  if (index === -1) return null

  const patient = all[index]
  const refillQty = Number(quantity) || patient.monthlyDoseUnits || 30
  const now = date || new Date().toISOString().split('T')[0]
  const timestamp = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })

  // Calculate next DNS (Date Next Supply = +30 days)
  const nextDate = new Date(now)
  nextDate.setDate(nextDate.getDate() + 30)
  const nextDueDateStr = nextDate.toISOString().split('T')[0]

  const currentMonthName = new Date(now).toLocaleString('ms-MY', { month: 'long', year: 'numeric' })

  const refillItem: PatientRefillHistoryItem = {
    id: `REF-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    date: now,
    timestamp,
    quantity: refillQty,
    dispensedBy,
    refillCycleMonth: currentMonthName,
    nextDueDate: nextDueDateStr,
    remarks: remarks || `Bekalan ubat kuota ${refillQty} unit bagi kitaran ${currentMonthName}.`
  }

  const updatedPatient: PatientQuotaRecord = {
    ...patient,
    currentMonthStatus: 'TELAH_DIISI',
    lastRefillDate: now,
    lastRefillQuantity: refillQty,
    nextRefillDueDate: nextDueDateStr,
    refillHistory: [refillItem, ...(patient.refillHistory || [])],
    lastUpdated: now
  }

  all[index] = updatedPatient
  saveAllPatientQuotas(all)

  // Decrement facility quota and log to audit trail
  recordDrugQuotaDispense(patient.quotaDrugId, {
    quantity: refillQty,
    patientRn: patient.patientRn,
    patientName: patient.patientName,
    prescriberName: patient.prescriberName,
    prescriberRole: patient.clinicDepartment,
    wardOrClinic: patient.clinicDepartment,
    reasonOrIndication: patient.clinicalIndication,
    dispensedBy,
    date: now
  })

  return { patient: updatedPatient, refillItem }
}

/**
 * Update an existing patient quota record
 */
export function updatePatientQuota(patientId: string, updates: Partial<PatientQuotaRecord>): PatientQuotaRecord | null {
  const all = getAllPatientQuotas()
  const index = all.findIndex(p => p.id === patientId)
  if (index === -1) return null

  const patient = all[index]
  const now = new Date().toISOString().split('T')[0]

  const updated: PatientQuotaRecord = {
    ...patient,
    ...updates,
    monthlyDoseUnits: updates.monthlyDoseUnits !== undefined ? Number(updates.monthlyDoseUnits) : patient.monthlyDoseUnits,
    lastUpdated: now
  }

  all[index] = updated
  saveAllPatientQuotas(all)
  return updated
}

/**
 * Delete a patient quota record
 */
export function deletePatientQuota(patientId: string): boolean {
  const all = getAllPatientQuotas()
  const filtered = all.filter(p => p.id !== patientId)
  if (filtered.length === all.length) return false
  saveAllPatientQuotas(filtered)
  return true
}

/**
 * Get detailed patient statistics and refill status for a specific quota drug
 */
export function getDrugPatientStats(quotaDrugId: string) {
  const patients = getPatientsForDrugQuota(quotaDrugId)
  const totalPatients = patients.length
  const filledPatients = patients.filter(p => p.currentMonthStatus === 'TELAH_DIISI')
  const pendingPatients = patients.filter(p => p.currentMonthStatus === 'BELUM_DIISI')
  const defaulterPatients = patients.filter(p => p.currentMonthStatus === 'TERLEPAS_TEMUJANJI')

  const filledCount = filledPatients.length
  const pendingCount = pendingPatients.length
  const defaulterCount = defaulterPatients.length

  const totalMonthlyCommittedDose = patients.reduce((sum, p) => sum + (p.monthlyDoseUnits || 0), 0)
  const totalFilledDoseThisMonth = filledPatients.reduce((sum, p) => sum + (p.lastRefillQuantity || p.monthlyDoseUnits || 0), 0)
  const totalPendingDoseThisMonth = pendingPatients.reduce((sum, p) => sum + (p.monthlyDoseUnits || 0), 0)

  const fillPercentage = totalPatients > 0 ? Math.round((filledCount / totalPatients) * 100) : 0

  return {
    totalPatients,
    filledCount,
    pendingCount,
    defaulterCount,
    totalMonthlyCommittedDose,
    totalFilledDoseThisMonth,
    totalPendingDoseThisMonth,
    fillPercentage
  }
}
