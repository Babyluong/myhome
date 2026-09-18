import { PatientQuotaRecord } from '../types/drugQuotaTypes'

/**
 * Clean Slate Default Patient Quota Records (0 patients initially)
 * Patients are registered dynamically by users via the "+ Daftar Pesakit Baru" interface.
 */
export const DEFAULT_PATIENT_QUOTA_RECORDS: PatientQuotaRecord[] = []
