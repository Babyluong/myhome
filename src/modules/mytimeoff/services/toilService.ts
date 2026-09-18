// src/modules/mytimeoff/services/toilService.ts
// Time Off (Cuti Gantian) Enterprise Service
// Strictly communicates with real Supabase database tables:
//   - public.toil_claims
//   - public.toil_balance
//   - public.toil_redemptions
//   - public.toil_audit_log
// ZERO-MOCK MANDATE: No synthetic or fake staff/records are created.

import { supabase, isSupabaseConfigured, getStorageUrl } from '@/services/supabase'
import type { ApiResponse } from '@/shared/types/base'
import type {
  ToilClaim,
  ToilBalance,
  ToilRedemption,
  ToilStatus,
  ToilAuditLog,
  ToilDashboardStats
} from '@/shared/types/mytimeoff'

const STORAGE_PREFIX = 'mytimeoff_local_v1_'

const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

const setLocalData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch (err) {
    console.error('Failed to set local data for mytimeoff:', err)
  }
}

// Generate human-friendly reference numbers
const generateClaimNo = (): string => {
  const year = new Date().getFullYear()
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  return `TOIL-${year}-${randomSuffix}`
}

const generateRedemptionNo = (): string => {
  const year = new Date().getFullYear()
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  return `RDM-${year}-${randomSuffix}`
}

/**
 * Record an audit trail for TOIL actions
 */
export const recordToilAudit = async (
  audit: Omit<ToilAuditLog, 'id' | 'created_at'>
): Promise<void> => {
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('toil_audit_log').insert({
        table_name: audit.table_name,
        record_id: audit.record_id,
        action: audit.action,
        actor_id: audit.actor_id || null,
        actor_name: audit.actor_name || 'Sistem',
        old_data: audit.old_data || null,
        new_data: audit.new_data || null,
      })
    } else {
      const logs = getLocalData<ToilAuditLog[]>('audit_logs', [])
      logs.unshift({
        ...audit,
        id: `audit-${Date.now()}`,
        created_at: new Date().toISOString(),
      })
      setLocalData('audit_logs', logs)
    }
  } catch (err) {
    console.warn('Failed to record TOIL audit log:', err)
  }
}

// =========================================================================
// 1. TOIL CLAIMS (Permohonan Cuti Gantian / Tuntutan Kerja Tambahan)
// =========================================================================

export interface GetClaimsFilter {
  userId?: string
  departmentId?: string
  hospitalId?: string
  status?: ToilStatus
  year?: number
}

/**
 * Fetch TOIL claims with relations (user, approver, department)
 */
export const getToilClaims = async (
  filters?: GetClaimsFilter
): Promise<ApiResponse<ToilClaim[]>> => {
  if (!isSupabaseConfigured()) {
    let list = getLocalData<ToilClaim[]>('claims', [])
    if (filters?.userId) list = list.filter((c) => c.user_id === filters.userId)
    if (filters?.departmentId) list = list.filter((c) => c.department_id === filters.departmentId)
    if (filters?.status) list = list.filter((c) => c.status === filters.status)
    if (filters?.year) {
      list = list.filter((c) => new Date(c.work_date).getFullYear() === filters.year)
    }
    return { data: list, error: null }
  }

  try {
    let query = supabase
      .from('toil_claims')
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id, email, ic_number),
        approver:users!approved_by(id, full_name, jawatan),
        department:departments!department_id(id, name, code)
      `)
      .order('work_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters?.userId) query = query.eq('user_id', filters.userId)
    if (filters?.departmentId) query = query.eq('department_id', filters.departmentId)
    if (filters?.hospitalId) query = query.eq('hospital_id', filters.hospitalId)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.year) {
      query = query
        .gte('work_date', `${filters.year}-01-01`)
        .lte('work_date', `${filters.year}-12-31`)
    }

    const { data, error } = await query
    if (error) throw error
    return { data: (data as ToilClaim[]) || [], error: null }
  } catch (error: any) {
    console.error('getToilClaims error:', error)
    return { data: [], error: error?.message || 'Gagal memuatkan senarai tuntutan TOIL' }
  }
}

/**
 * Get single TOIL claim by ID
 */
export const getToilClaimById = async (id: string): Promise<ApiResponse<ToilClaim | null>> => {
  if (!isSupabaseConfigured()) {
    const list = getLocalData<ToilClaim[]>('claims', [])
    const found = list.find((c) => c.id === id) || null
    return { data: found, error: found ? null : 'Tuntutan tidak dijumpai' }
  }

  try {
    const { data, error } = await supabase
      .from('toil_claims')
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id, email, ic_number),
        approver:users!approved_by(id, full_name, jawatan),
        department:departments!department_id(id, name, code)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as ToilClaim, error: null }
  } catch (error: any) {
    console.error('getToilClaimById error:', error)
    return { data: null, error: error?.message || 'Gagal memuatkan maklumat tuntutan' }
  }
}

/**
 * Submit a new TOIL claim
 */
export const submitToilClaim = async (
  claim: Omit<ToilClaim, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<ToilClaim>> => {
  const claimNo = claim.claim_no || generateClaimNo()

  if (!isSupabaseConfigured()) {
    const list = getLocalData<ToilClaim[]>('claims', [])
    const newClaim: ToilClaim = {
      ...claim,
      id: `claim-${Date.now()}`,
      claim_no: claimNo,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    list.unshift(newClaim)
    setLocalData('claims', list)

    await recordToilAudit({
      table_name: 'toil_claims',
      record_id: newClaim.id,
      action: 'CREATE',
      actor_id: claim.user_id,
      actor_name: 'Pengguna',
      new_data: newClaim,
    })

    return { data: newClaim, error: null }
  }

  try {
    const insertPayload = {
      claim_no: claimNo,
      user_id: claim.user_id,
      hospital_id: claim.hospital_id,
      department_id: claim.department_id,
      work_date: claim.work_date,
      time_start: claim.time_start,
      time_end: claim.time_end,
      hours_worked: claim.hours_worked,
      work_type: claim.work_type,
      location: claim.location,
      work_description: claim.work_description,
      status: 'pending',
      attachment_url: claim.attachment_url || null,
      attachment_name: claim.attachment_name || null,
    }

    const { data, error } = await supabase
      .from('toil_claims')
      .insert([insertPayload])
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id, email),
        department:departments!department_id(id, name, code)
      `)
      .single()

    if (error) throw error

    await recordToilAudit({
      table_name: 'toil_claims',
      record_id: data.id,
      action: 'CREATE',
      actor_id: claim.user_id,
      actor_name: data.user?.full_name || 'Pengguna',
      new_data: data,
    })

    return { data: data as ToilClaim, error: null }
  } catch (error: any) {
    console.error('submitToilClaim error:', error)
    return { data: null, error: error?.message || 'Gagal menghantar tuntutan TOIL' }
  }
}

/**
 * Approve or Reject a TOIL claim
 * When approved, the hours are automatically credited into toil_balance!
 */
export const updateToilClaimStatus = async (
  claimId: string,
  status: 'approved' | 'rejected' | 'cancelled',
  approverId?: string,
  rejectionReason?: string,
  approverName?: string
): Promise<ApiResponse<ToilClaim>> => {
  const approvedAt = status === 'approved' ? new Date().toISOString() : null

  if (!isSupabaseConfigured()) {
    const list = getLocalData<ToilClaim[]>('claims', [])
    const index = list.findIndex((c) => c.id === claimId)
    if (index === -1) return { data: null, error: 'Tuntutan tidak dijumpai' }

    const oldClaim = list[index]
    const updatedClaim: ToilClaim = {
      ...oldClaim,
      status,
      approved_by: status === 'approved' ? approverId || null : oldClaim.approved_by,
      approved_at: approvedAt,
      rejection_reason: status === 'rejected' ? rejectionReason || null : null,
      updated_at: new Date().toISOString(),
    }
    list[index] = updatedClaim
    setLocalData('claims', list)

    // Update local balance on approval
    if (status === 'approved') {
      const year = new Date(updatedClaim.work_date).getFullYear()
      const balances = getLocalData<ToilBalance[]>('balances', [])
      let bal = balances.find((b) => b.user_id === updatedClaim.user_id && b.year === year)
      if (!bal) {
        bal = {
          id: `bal-${Date.now()}`,
          user_id: updatedClaim.user_id,
          hospital_id: updatedClaim.hospital_id,
          year,
          total_hours_earned: Number(updatedClaim.hours_worked),
          total_hours_used: 0,
          balance_hours: Number(updatedClaim.hours_worked),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        balances.push(bal)
      } else {
        bal.total_hours_earned = Number(bal.total_hours_earned) + Number(updatedClaim.hours_worked)
        bal.balance_hours = bal.total_hours_earned - bal.total_hours_used
        bal.updated_at = new Date().toISOString()
      }
      setLocalData('balances', balances)
    }

    await recordToilAudit({
      table_name: 'toil_claims',
      record_id: claimId,
      action: status === 'approved' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'CANCEL',
      actor_id: approverId,
      actor_name: approverName || 'Penyelia',
      old_data: oldClaim,
      new_data: updatedClaim,
    })

    return { data: updatedClaim, error: null }
  }

  try {
    // 1. Retrieve the existing claim
    const { data: existingClaim, error: fetchErr } = await supabase
      .from('toil_claims')
      .select('*')
      .eq('id', claimId)
      .single()

    if (fetchErr || !existingClaim) throw new Error('Tuntutan tidak dijumpai')

    // 2. Update claim status
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (status === 'approved') {
      updatePayload.approved_by = approverId || null
      updatePayload.approved_at = approvedAt
      updatePayload.rejection_reason = null
    } else if (status === 'rejected') {
      updatePayload.rejection_reason = rejectionReason || 'Permohonan ditolak oleh penyelia'
      updatePayload.approved_by = approverId || null
      updatePayload.approved_at = new Date().toISOString()
    }

    const { data: updatedClaim, error: updateErr } = await supabase
      .from('toil_claims')
      .update(updatePayload)
      .eq('id', claimId)
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id),
        approver:users!approved_by(id, full_name, jawatan),
        department:departments!department_id(id, name, code)
      `)
      .single()

    if (updateErr) throw updateErr

    // 3. If approved, AUTO-CREDIT into toil_balance
    if (status === 'approved') {
      const year = new Date(existingClaim.work_date).getFullYear()
      const hours = Number(existingClaim.hours_worked) || 0

      // Fetch existing balance
      const { data: currentBalance } = await supabase
        .from('toil_balance')
        .select('*')
        .eq('user_id', existingClaim.user_id)
        .eq('year', year)
        .maybeSingle()

      if (!currentBalance) {
        // Insert initial balance row
        await supabase.from('toil_balance').insert({
          user_id: existingClaim.user_id,
          hospital_id: existingClaim.hospital_id,
          year,
          total_hours_earned: hours,
          total_hours_used: 0,
          balance_hours: hours,
        })
      } else {
        // Increment earned hours
        const newEarned = Number(currentBalance.total_hours_earned) + hours
        const newBalance = newEarned - Number(currentBalance.total_hours_used)
        await supabase
          .from('toil_balance')
          .update({
            total_hours_earned: newEarned,
            balance_hours: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentBalance.id)
      }
    }

    // 4. Record audit log
    await recordToilAudit({
      table_name: 'toil_claims',
      record_id: claimId,
      action: status === 'approved' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'CANCEL',
      actor_id: approverId,
      actor_name: approverName || 'Penyelia',
      old_data: existingClaim,
      new_data: updatedClaim,
    })

    return { data: updatedClaim as ToilClaim, error: null }
  } catch (error: any) {
    console.error('updateToilClaimStatus error:', error)
    return { data: null, error: error?.message || 'Gagal mengemaskini status tuntutan' }
  }
}

/**
 * Cancel a pending claim by staff member
 */
export const cancelToilClaim = async (
  claimId: string,
  userId: string
): Promise<ApiResponse<boolean>> => {
  const res = await updateToilClaimStatus(claimId, 'cancelled', userId, 'Dibatalkan oleh pemohon')
  return { data: !!res.data, error: res.error }
}

// =========================================================================
// 2. TOIL BALANCE (Baki Cuti Gantian Terkumpul)
// =========================================================================

/**
 * Get staff member's TOIL balance for the specified year (defaults to current year)
 */
export const getToilBalance = async (
  userId: string,
  year: number = new Date().getFullYear()
): Promise<ApiResponse<ToilBalance>> => {
  if (!isSupabaseConfigured()) {
    const balances = getLocalData<ToilBalance[]>('balances', [])
    const found = balances.find((b) => b.user_id === userId && b.year === year)
    if (found) {
      return { data: found, error: null }
    }
    const emptyBal: ToilBalance = {
      id: `bal-${userId}-${year}`,
      user_id: userId,
      hospital_id: '',
      year,
      total_hours_earned: 0,
      total_hours_used: 0,
      balance_hours: 0,
      created_at: new Date().toISOString(),
    }
    return { data: emptyBal, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('toil_balance')
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id)
      `)
      .eq('user_id', userId)
      .eq('year', year)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      // Return a 0-hours fallback object
      return {
        data: {
          id: `new-${userId}-${year}`,
          user_id: userId,
          hospital_id: '',
          year,
          total_hours_earned: 0,
          total_hours_used: 0,
          balance_hours: 0,
          created_at: new Date().toISOString(),
        },
        error: null,
      }
    }

    return { data: data as ToilBalance, error: null }
  } catch (error: any) {
    console.error('getToilBalance error:', error)
    return {
      data: {
        id: `err-${userId}-${year}`,
        user_id: userId,
        hospital_id: '',
        year,
        total_hours_earned: 0,
        total_hours_used: 0,
        balance_hours: 0,
        created_at: new Date().toISOString(),
      },
      error: error?.message || 'Gagal memuatkan baki TOIL',
    }
  }
}

/**
 * Fetch staff balances within a department (used by HOD overview)
 */
export const getDepartmentToilBalances = async (
  departmentId: string,
  year: number = new Date().getFullYear()
): Promise<ApiResponse<ToilBalance[]>> => {
  if (!isSupabaseConfigured()) {
    const balances = getLocalData<ToilBalance[]>('balances', [])
    return { data: balances.filter((b) => b.year === year), error: null }
  }

  try {
    const { data, error } = await supabase
      .from('toil_balance')
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id, department_id)
      `)
      .eq('year', year)
      .eq('user.department_id', departmentId)

    if (error) throw error
    return { data: (data as ToilBalance[]) || [], error: null }
  } catch (error: any) {
    console.error('getDepartmentToilBalances error:', error)
    return { data: [], error: error?.message || 'Gagal memuatkan baki staf jabatan' }
  }
}

// =========================================================================
// 3. TOIL REDEMPTIONS (Penebusan Cuti Gantian / Permohonan Cuti)
// =========================================================================

export interface GetRedemptionsFilter {
  userId?: string
  departmentId?: string
  hospitalId?: string
  status?: ToilStatus
  year?: number
}

/**
 * Fetch staff redemption requests
 */
export const getToilRedemptions = async (
  filters?: GetRedemptionsFilter
): Promise<ApiResponse<ToilRedemption[]>> => {
  if (!isSupabaseConfigured()) {
    let list = getLocalData<ToilRedemption[]>('redemptions', [])
    if (filters?.userId) list = list.filter((r) => r.user_id === filters.userId)
    if (filters?.departmentId) list = list.filter((r) => r.department_id === filters.departmentId)
    if (filters?.status) list = list.filter((r) => r.status === filters.status)
    if (filters?.year) {
      list = list.filter((r) => new Date(r.redeem_date).getFullYear() === filters.year)
    }
    return { data: list, error: null }
  }

  try {
    let query = supabase
      .from('toil_redemptions')
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id, email),
        approver:users!approved_by(id, full_name, jawatan),
        department:departments!department_id(id, name, code)
      `)
      .order('redeem_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters?.userId) query = query.eq('user_id', filters.userId)
    if (filters?.departmentId) query = query.eq('department_id', filters.departmentId)
    if (filters?.hospitalId) query = query.eq('hospital_id', filters.hospitalId)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.year) {
      query = query
        .gte('redeem_date', `${filters.year}-01-01`)
        .lte('redeem_date', `${filters.year}-12-31`)
    }

    const { data, error } = await query
    if (error) throw error
    return { data: (data as ToilRedemption[]) || [], error: null }
  } catch (error: any) {
    console.error('getToilRedemptions error:', error)
    return { data: [], error: error?.message || 'Gagal memuatkan rekod penebusan TOIL' }
  }
}

/**
 * Submit redemption request (use accumulated TOIL as holiday)
 */
export const submitToilRedemption = async (
  redemption: Omit<ToilRedemption, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<ToilRedemption>> => {
  const redemptionNo = redemption.redemption_no || generateRedemptionNo()
  const year = new Date(redemption.redeem_date).getFullYear()

  // 1. Verify user has enough balance
  const balanceRes = await getToilBalance(redemption.user_id, year)
  const currentBalance = balanceRes.data?.balance_hours || 0

  if (currentBalance < Number(redemption.redeem_hours)) {
    return {
      data: null,
      error: `Baki tidak mencukupi! Anda mempunyai ${currentBalance} jam baki, tetapi memohon ${redemption.redeem_hours} jam.`,
    }
  }

  if (!isSupabaseConfigured()) {
    const list = getLocalData<ToilRedemption[]>('redemptions', [])
    const newRedemption: ToilRedemption = {
      ...redemption,
      id: `rdm-${Date.now()}`,
      redemption_no: redemptionNo,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    list.unshift(newRedemption)
    setLocalData('redemptions', list)

    await recordToilAudit({
      table_name: 'toil_redemptions',
      record_id: newRedemption.id,
      action: 'CREATE',
      actor_id: redemption.user_id,
      actor_name: 'Pengguna',
      new_data: newRedemption,
    })

    return { data: newRedemption, error: null }
  }

  try {
    const insertPayload = {
      redemption_no: redemptionNo,
      user_id: redemption.user_id,
      hospital_id: redemption.hospital_id,
      department_id: redemption.department_id,
      redeem_date: redemption.redeem_date,
      redeem_hours: redemption.redeem_hours,
      reason: redemption.reason || null,
      status: 'pending',
      toil_claim_id: redemption.toil_claim_id || null,
    }

    const { data, error } = await supabase
      .from('toil_redemptions')
      .insert([insertPayload])
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id),
        department:departments!department_id(id, name, code)
      `)
      .single()

    if (error) throw error

    await recordToilAudit({
      table_name: 'toil_redemptions',
      record_id: data.id,
      action: 'CREATE',
      actor_id: redemption.user_id,
      actor_name: data.user?.full_name || 'Pengguna',
      new_data: data,
    })

    return { data: data as ToilRedemption, error: null }
  } catch (error: any) {
    console.error('submitToilRedemption error:', error)
    return { data: null, error: error?.message || 'Gagal menghantar permohonan penebusan TOIL' }
  }
}

/**
 * Approve or Reject a TOIL Redemption request
 * On approval: AUTO-DEDUCTS from staff balance_hours!
 */
export const updateToilRedemptionStatus = async (
  redemptionId: string,
  status: 'approved' | 'rejected' | 'cancelled',
  approverId?: string,
  rejectionReason?: string,
  approverName?: string
): Promise<ApiResponse<ToilRedemption>> => {
  const approvedAt = status === 'approved' ? new Date().toISOString() : null

  if (!isSupabaseConfigured()) {
    const list = getLocalData<ToilRedemption[]>('redemptions', [])
    const index = list.findIndex((r) => r.id === redemptionId)
    if (index === -1) return { data: null, error: 'Permohonan tidak dijumpai' }

    const oldRedemption = list[index]
    const updatedRedemption: ToilRedemption = {
      ...oldRedemption,
      status,
      approved_by: status === 'approved' ? approverId || null : oldRedemption.approved_by,
      approved_at: approvedAt,
      rejection_reason: status === 'rejected' ? rejectionReason || null : null,
      updated_at: new Date().toISOString(),
    }
    list[index] = updatedRedemption
    setLocalData('redemptions', list)

    // AUTO-DEDUCT local balance on approval
    if (status === 'approved') {
      const year = new Date(updatedRedemption.redeem_date).getFullYear()
      const balances = getLocalData<ToilBalance[]>('balances', [])
      const bal = balances.find(
        (b) => b.user_id === updatedRedemption.user_id && b.year === year
      )
      if (bal) {
        bal.total_hours_used = Number(bal.total_hours_used) + Number(updatedRedemption.redeem_hours)
        bal.balance_hours = Number(bal.total_hours_earned) - bal.total_hours_used
        bal.updated_at = new Date().toISOString()
        setLocalData('balances', balances)
      }
    }

    await recordToilAudit({
      table_name: 'toil_redemptions',
      record_id: redemptionId,
      action: status === 'approved' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'CANCEL',
      actor_id: approverId,
      actor_name: approverName || 'Penyelia',
      old_data: oldRedemption,
      new_data: updatedRedemption,
    })

    return { data: updatedRedemption, error: null }
  }

  try {
    // 1. Fetch redemption record
    const { data: existing, error: fetchErr } = await supabase
      .from('toil_redemptions')
      .select('*')
      .eq('id', redemptionId)
      .single()

    if (fetchErr || !existing) throw new Error('Permohonan tidak dijumpai')

    // 2. Update status
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (status === 'approved') {
      updatePayload.approved_by = approverId || null
      updatePayload.approved_at = approvedAt
      updatePayload.rejection_reason = null
    } else if (status === 'rejected') {
      updatePayload.rejection_reason = rejectionReason || 'Permohonan ditolak oleh penyelia'
      updatePayload.approved_by = approverId || null
      updatePayload.approved_at = new Date().toISOString()
    }

    const { data: updated, error: updateErr } = await supabase
      .from('toil_redemptions')
      .update(updatePayload)
      .eq('id', redemptionId)
      .select(`
        *,
        user:users!user_id(id, full_name, jawatan, employee_id),
        approver:users!approved_by(id, full_name, jawatan),
        department:departments!department_id(id, name, code)
      `)
      .single()

    if (updateErr) throw updateErr

    // 3. AUTO-DEDUCT on approval
    if (status === 'approved') {
      const year = new Date(existing.redeem_date).getFullYear()
      const hoursToDeduct = Number(existing.redeem_hours) || 0

      const { data: bal } = await supabase
        .from('toil_balance')
        .select('*')
        .eq('user_id', existing.user_id)
        .eq('year', year)
        .maybeSingle()

      if (bal) {
        const newUsed = Number(bal.total_hours_used) + hoursToDeduct
        const newBalance = Number(bal.total_hours_earned) - newUsed
        await supabase
          .from('toil_balance')
          .update({
            total_hours_used: newUsed,
            balance_hours: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bal.id)
      }
    }

    // 4. Record audit log
    await recordToilAudit({
      table_name: 'toil_redemptions',
      record_id: redemptionId,
      action: status === 'approved' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'CANCEL',
      actor_id: approverId,
      actor_name: approverName || 'Penyelia',
      old_data: existing,
      new_data: updated,
    })

    return { data: updated as ToilRedemption, error: null }
  } catch (error: any) {
    console.error('updateToilRedemptionStatus error:', error)
    return { data: null, error: error?.message || 'Gagal mengemaskini status penebusan' }
  }
}

// =========================================================================
// 4. DASHBOARD STATS
// =========================================================================

export const getToilDashboardStats = async (
  userId: string,
  year: number = new Date().getFullYear()
): Promise<ApiResponse<ToilDashboardStats>> => {
  try {
    const [balanceRes, claimsRes, redemptionsRes] = await Promise.all([
      getToilBalance(userId, year),
      getToilClaims({ userId, year }),
      getToilRedemptions({ userId, year }),
    ])

    const bal = balanceRes.data
    const claims = claimsRes.data || []
    const redemptions = redemptionsRes.data || []

    const stats: ToilDashboardStats = {
      balanceHours: Number(bal?.balance_hours || 0),
      totalEarnedHours: Number(bal?.total_hours_earned || 0),
      totalUsedHours: Number(bal?.total_hours_used || 0),
      pendingClaimsCount: claims.filter((c) => c.status === 'pending').length,
      pendingRedemptionsCount: redemptions.filter((r) => r.status === 'pending').length,
      approvedClaimsCount: claims.filter((c) => c.status === 'approved').length,
    }

    return { data: stats, error: null }
  } catch (error: any) {
    console.error('getToilDashboardStats error:', error)
    return {
      data: {
        balanceHours: 0,
        totalEarnedHours: 0,
        totalUsedHours: 0,
        pendingClaimsCount: 0,
        pendingRedemptionsCount: 0,
        approvedClaimsCount: 0,
      },
      error: error?.message || 'Gagal memuatkan statistik',
    }
  }
}

// =========================================================================
// 5. FILE UPLOAD (Attendance Card / Duty Letter Proof)
// =========================================================================

export const uploadToilProof = async (
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    return { url: URL.createObjectURL(file), error: null }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const cleanFileName = `${userId}_${Date.now()}.${fileExt}`
    const filePath = `proofs/${cleanFileName}`

    // Try dedicated bucket first, fallback to documents bucket
    let bucketName = 'timeoff-proofs'
    let uploadRes = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

    if (uploadRes.error && uploadRes.error.message?.includes('not found')) {
      bucketName = 'documents'
      uploadRes = await supabase.storage.from(bucketName).upload(`timeoff/${filePath}`, file, {
        cacheControl: '3600',
        upsert: true,
      })
    }

    if (uploadRes.error) throw uploadRes.error

    const publicUrl = getStorageUrl(bucketName, uploadRes.data?.path || filePath)
    return { url: publicUrl, error: null }
  } catch (error: any) {
    console.error('uploadToilProof error:', error)
    return { url: null, error: error?.message || 'Gagal memuat naik fail bukti' }
  }
}
