import type { User, UserWithRelations } from '@/types'
import { isHospitalOrSystemAdmin } from '@/shared/utils/cylinderRbac'

/**
 * Known Supabase UUID for the primary Hospital Lawas Pharmacy Logistics department (Stor Utama Farmasi).
 */
export const PHARMACY_LOGISTICS_DEPARTMENT_ID = '7a3bd6c4-c8e6-491b-8441-0ee9bd73f880'

/**
 * Checks if a user strictly belongs to the Pharmacy Logistics department (Stor Utama Farmasi).
 * Only staff in Pharmacy Logistics (or System / Hospital Administrators) have authorization to view,
 * maintain, and edit the master inventory drug & non-drug catalogs (Katalog Induk Hospital).
 *
 * Staff stationed in satellite pharmacies, wards, and dispensing units (such as Pharmacy In Patient,
 * Pharmacy Outpatient, Pharmacy Emergency, Pharmacy Substore) are restricted from accessing or
 * viewing the master catalog to prevent accidental modifications or desynchronization.
 *
 * @param user The authenticated user object with optional relations
 * @returns boolean true if authorized to access Pharmacy Logistics master catalog
 */
export function isPharmacyLogisticsUser(user: User | UserWithRelations | any | null | undefined): boolean {
  if (!user) return false

  // 1. System Admin & Hospital Admin possess master administrative override
  if (isHospitalOrSystemAdmin(user)) {
    return true
  }

  // 2. Direct Supabase Department UUID match
  if (user.department_id === PHARMACY_LOGISTICS_DEPARTMENT_ID) {
    return true
  }

  // 3. Department Code validation
  const deptCode = (
    user.department?.department_code ||
    user.department_code ||
    ''
  ).toUpperCase().trim()

  if (deptCode === 'PHARMACY_LOGISTIC' || deptCode === 'LOGISTIC' || deptCode === 'FARMASI_LOGISTIK') {
    return true
  }

  // 4. Department Name string inspection (case-insensitive & whitespace-trimmed)
  const deptName = (
    user.department?.department_name ||
    user.department_name ||
    (typeof user.department === 'string' ? user.department : '') ||
    ''
  ).toLowerCase().trim()

  if (
    deptName.includes('pharmacy logistic') ||
    deptName.includes('farmasi logistik') ||
    deptName.includes('logistik farmasi') ||
    deptName.includes('stor farmasi') ||
    deptName.includes('stor utama farmasi') ||
    deptName.includes('stor logistik')
  ) {
    return true
  }

  return false
}

/**
 * Alias helper explicitly communicating master catalog authorization.
 */
export const canAccessMasterCatalog = isPharmacyLogisticsUser
