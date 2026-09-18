import type { User, UserWithRelations } from '@/types'

/**
 * Checks if a user holds the position/role of Pegawai Farmasi (Pharmacist).
 * Strictly validates against genuine database roles and KKM designations.
 */
export function isPegawaiFarmasi(user: User | UserWithRelations | any | null | undefined): boolean {
  if (!user) return false

  const roleCode = (
    user?.role?.role_code ||
    user?.role_code ||
    (typeof user?.role === 'string' ? user.role : '') ||
    ''
  ).toLowerCase().trim()

  const roleName = (user?.role?.role_name || '').toLowerCase().trim()
  const jawatan = (user?.jawatan || '').toLowerCase().trim()

  // Must NOT be an assistant / penolong / pembantu
  const isAssistant =
    roleCode.includes('assistant') ||
    roleCode.includes('penolong') ||
    roleCode === 'ppf' ||
    jawatan.includes('penolong') ||
    jawatan.includes('pembantu') ||
    roleName.includes('assistant') ||
    roleName.includes('penolong')

  if (isAssistant) return false

  // Check for Pharmacist role codes
  if (
    roleCode === 'pharmacist' ||
    roleCode === 'pharmacy_manager' ||
    roleCode === 'pharmacy_director'
  ) {
    return true
  }

  // Check for KKM designation / jawatan (e.g. "Pegawai Farmasi UF9", "Pegawai Farmasi UF44", "PEGAWAI FARMASI UF 12")
  if (
    jawatan.includes('pegawai farmasi') ||
    jawatan.includes('pharmacist') ||
    roleName.includes('pegawai farmasi') ||
    roleName.includes('pharmacist')
  ) {
    return true
  }

  return false
}

/**
 * Checks if a user holds the position/role of Penolong Pegawai Farmasi (Assistant Pharmacist).
 * Strictly validates against genuine database roles and KKM designations.
 */
export function isPenolongPegawaiFarmasi(user: User | UserWithRelations | any | null | undefined): boolean {
  if (!user) return false

  const roleCode = (
    user?.role?.role_code ||
    user?.role_code ||
    (typeof user?.role === 'string' ? user.role : '') ||
    ''
  ).toLowerCase().trim()

  const roleName = (user?.role?.role_name || '').toLowerCase().trim()
  const jawatan = (user?.jawatan || '').toLowerCase().trim()

  // Check for Assistant Pharmacist role codes
  if (
    roleCode === 'assistant_pharmacist' ||
    roleCode === 'pharmacy_assistant' ||
    roleCode === 'penolong_pegawai_farmasi' ||
    roleCode === 'ppf' ||
    roleCode === 'pharmacy_storekeeper'
  ) {
    return true
  }

  // Check for KKM designation / jawatan (e.g. "Penolong Pegawai farmasi u5", "PENOLONG PEGAWAI FARMASI U7 TBK 2", "PPF")
  if (
    jawatan.includes('penolong pegawai farmasi') ||
    jawatan.includes('pembantu pegawai farmasi') ||
    jawatan.includes('assistant pharmacist') ||
    jawatan.includes('pharmacy assistant') ||
    roleName.includes('assistant pharmacist') ||
    roleName.includes('penolong pegawai farmasi') ||
    roleName.includes('pharmacy assistant')
  ) {
    return true
  }

  return false
}

/**
 * Checks if a user is an administrative user (System Admin or Hospital Admin) with management override.
 */
export function isHospitalOrSystemAdmin(user: User | UserWithRelations | any | null | undefined): boolean {
  if (!user) return false

  const roleCode = (
    user?.role?.role_code ||
    user?.role_code ||
    (typeof user?.role === 'string' ? user.role : '') ||
    ''
  ).toLowerCase().trim()

  const roleName = (user?.role?.role_name || '').toLowerCase().trim()

  return (
    roleCode === 'system_admin' ||
    roleCode === 'superadmin' ||
    roleCode === 'super_admin' ||
    roleCode === 'hospital_admin' ||
    roleCode === 'hospital_administrator' ||
    roleName.includes('system admin') ||
    roleName.includes('superadmin') ||
    roleName.includes('hospital admin')
  )
}

/**
 * Authoritative RBAC check for medical cylinder approval and issuance:
 * ONLY Pegawai Farmasi and Penolong Pegawai Farmasi (plus Admins) are authorized.
 * Clinical ward staff (nurses, doctors, sisters, matrons, AMO, etc.) return FALSE.
 */
export function isCylinderAuthorizedOfficer(user: User | UserWithRelations | any | null | undefined): boolean {
  if (!user) return false
  if (isHospitalOrSystemAdmin(user)) return true
  if (isPegawaiFarmasi(user)) return true
  if (isPenolongPegawaiFarmasi(user)) return true
  return false
}

/**
 * Checks whether the user can approve cylinder requests.
 */
export function canApproveCylinder(user: User | UserWithRelations | any | null | undefined): boolean {
  return isCylinderAuthorizedOfficer(user)
}

/**
 * Checks whether the user can issue / dispatch cylinders.
 */
export function canIssueCylinder(user: User | UserWithRelations | any | null | undefined): boolean {
  return isCylinderAuthorizedOfficer(user)
}

/**
 * Checks whether the user can only request cylinders (e.g. Ward nurse, doctor, staff).
 */
export function isCylinderRequesterOnly(user: User | UserWithRelations | any | null | undefined): boolean {
  return !isCylinderAuthorizedOfficer(user)
}
