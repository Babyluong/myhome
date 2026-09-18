// src/shared/types/mytimeoff.ts
// Time Off (Cuti Gantian) Type Definitions

import type { BaseEntity } from './base'
import type { User } from './auth'
import type { Department, Hospital } from './organization'

export type ToilWorkType = 'rest_day' | 'public_holiday' | 'overtime'
export type ToilStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface ToilClaim extends BaseEntity {
  claim_no?: string
  user_id: string
  hospital_id: string
  department_id: string
  work_date: string          // YYYY-MM-DD
  time_start: string         // HH:MM:SS or HH:MM
  time_end: string           // HH:MM:SS or HH:MM
  hours_worked: number       // computed decimal hours (e.g. 4.5)
  work_type: ToilWorkType
  location: string
  work_description: string
  status: ToilStatus
  approved_by?: string | null
  approved_at?: string | null
  rejection_reason?: string | null
  attachment_url?: string | null
  attachment_name?: string | null
  // Joins
  user?: User
  approver?: User
  department?: Department
  hospital?: Hospital
}

export interface ToilBalance extends BaseEntity {
  user_id: string
  hospital_id: string
  year: number
  total_hours_earned: number
  total_hours_used: number
  balance_hours: number      // total_hours_earned - total_hours_used
  user?: User
}

export interface ToilRedemption extends BaseEntity {
  redemption_no?: string
  user_id: string
  hospital_id: string
  department_id: string
  redeem_date: string        // YYYY-MM-DD
  redeem_hours: number
  reason?: string | null
  status: ToilStatus
  approved_by?: string | null
  approved_at?: string | null
  rejection_reason?: string | null
  toil_claim_id?: string | null
  // Joins
  user?: User
  approver?: User
  department?: Department
  claim?: ToilClaim
}

export interface ToilAuditLog extends BaseEntity {
  table_name: string
  record_id: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'CANCEL'
  actor_id?: string | null
  actor_name?: string | null
  old_data?: Record<string, any> | null
  new_data?: Record<string, any> | null
}

export interface ToilDashboardStats {
  balanceHours: number
  totalEarnedHours: number
  totalUsedHours: number
  pendingClaimsCount: number
  pendingRedemptionsCount: number
  approvedClaimsCount: number
}
