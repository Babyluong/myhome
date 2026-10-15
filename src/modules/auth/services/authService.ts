import { supabase, isSupabaseConfigured } from '../../../services/supabase'
import { recordAuditLog } from '@/services/auditLogService'
import type { UserStatus, UserWithRelations } from '@/shared/types'
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES } from '@/shared/lib/constants'

export interface LoginResult {
  success: boolean
  user?: UserWithRelations
  error?: string
  attemptsRemaining?: number
  isLocked?: boolean
  requiresPasswordReset?: boolean
  requiresEmailConfirmation?: boolean
}

export interface ResetPasswordResult {
  success: boolean
  error?: string
}

interface LoginAccount {
  id: string
  employee_id: string
  email: string | null
  status: UserStatus
  account_locked_until: string | null
  failed_login_attempts: number | null
}

function isLoginAccount(value: unknown): value is LoginAccount {
  if (typeof value !== 'object' || value === null) return false
  const account = value as Record<string, unknown>
  return typeof account.id === 'string'
    && typeof account.employee_id === 'string'
    && (typeof account.email === 'string' || account.email === null)
    && (account.status === 'active' || account.status === 'inactive'
      || account.status === 'pending' || account.status === 'suspended')
    && (typeof account.account_locked_until === 'string' || account.account_locked_until === null)
    && (typeof account.failed_login_attempts === 'number' || account.failed_login_attempts === null)
}

/**
 * Authenticate user with employee ID and password
 */
export async function login(employeeId: string, password: string): Promise<LoginResult> {
  try {
    if (isSupabaseConfigured()) {
      return await loginWithSupabase(employeeId, password)
    } else {
      return { success: false, error: 'Authentication service is unavailable because Supabase is not configured.' }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Supabase login (for production)
 */
async function loginWithSupabase(employeeId: string, password: string): Promise<LoginResult> {
  // First, find user by employee ID to get email
  // We use RPC instead of direct table access to bypass RLS for unauthenticated users
  const { data: accountData, error: userError } = await supabase
    .rpc('get_user_by_employee_id', { p_employee_id: employeeId })
    .maybeSingle()

  if (userError) {
    console.error('Employee account lookup failed:', userError)
    return { success: false, error: 'Unable to verify account. Please try again.' }
  }

  if (accountData === null || accountData === undefined) {
    return {
      success: false,
      error: 'Invalid employee ID or password',
    }
  }

  if (!isLoginAccount(accountData)) {
    console.error('Employee account lookup returned an invalid account record')
    return {
      success: false,
      error: 'Account configuration error. Please contact administrator.',
    }
  }

  const userData = accountData

  // Check account status
  if (userData.status === 'pending') {
    return {
      success: false,
      error: 'Your account is pending approval. Please wait for admin approval.',
    }
  }

  if (userData.status === 'suspended') {
    return {
      success: false,
      error: 'Your account has been suspended. Please contact administrator.',
    }
  }

  if (userData.status === 'inactive') {
    return {
      success: false,
      error: 'Your account is inactive. Please contact administrator.',
    }
  }

  // Check if account is locked
  if (userData.account_locked_until) {
    const lockExpiry = new Date(userData.account_locked_until).getTime()
    if (Date.now() < lockExpiry) {
      const remainingMinutes = Math.ceil((lockExpiry - Date.now()) / 60000)
      return {
        success: false,
        error: `Account is locked. Please try again in ${remainingMinutes} minutes.`,
        isLocked: true,
        requiresPasswordReset: true,
      }
    }
  }

  // Validate email exists
  if (!userData.email) {
    console.error('User found but email is missing:', userData)
    return {
      success: false,
      error: 'Account configuration error. Please contact administrator.',
    }
  }

  // Authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: userData.email,
    password,
  })

  if (authError || !authData.user) {
    // Log the actual error for debugging
    console.error('Supabase Auth error:', authError)
    console.error('User data:', { email: userData.email, employee_id: userData.employee_id })
    
    // Check for specific error types
    if (authError?.message?.includes('Email not confirmed') || 
        authError?.message?.includes('email_not_confirmed')) {
      // Email exists but is not confirmed
      return {
        success: false,
        error: 'Please check your email and confirm your account before logging in. If you did not receive a confirmation email, please contact administrator.',
        requiresEmailConfirmation: true,
      }
    }
    
    if (authError?.message?.includes('Invalid login credentials') || 
        authError?.message?.includes('Invalid login') ||
        (authError?.status === 400 && !authError?.message?.includes('Email not confirmed'))) {
      // User exists in users table but credentials are wrong or user doesn't exist in Auth
      // This could mean:
      // 1. The password is incorrect
      // 2. The auth account doesn't exist (shouldn't happen if approval succeeded)
      // 3. The password was set incorrectly during account creation
      console.error('Auth login failed. User exists in database but auth credentials are invalid.')
      console.error('This may indicate the password was set incorrectly during account approval.')
      console.error('Solution: Contact your hospital admin to reset your password.')
      
      return {
        success: false,
        error: 'Invalid employee ID or password. If you recently had your account approved, please contact your hospital admin to reset your password.',
      }
    }
    
    // Record failed attempt
    const newAttempts = (userData.failed_login_attempts || 0) + 1
    const attemptsRemaining = MAX_LOGIN_ATTEMPTS - newAttempts

    // Update failed attempts in database
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      await supabase
        .from('users')
        .update({
          failed_login_attempts: newAttempts,
          account_locked_until: new Date(
            Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
          ).toISOString(),
          last_failed_login: new Date().toISOString(),
        })
        .eq('id', userData.id)

      return {
        success: false,
        error: 'Too many failed attempts. Account is now locked.',
        attemptsRemaining: 0,
        isLocked: true,
        requiresPasswordReset: true,
      }
    }

    await supabase
      .from('users')
      .update({
        failed_login_attempts: newAttempts,
        last_failed_login: new Date().toISOString(),
      })
      .eq('id', userData.id)

    return {
      success: false,
      error: `Invalid employee ID or password. ${attemptsRemaining} attempts remaining.`,
      attemptsRemaining,
    }
  }

  // CRITICAL INTEGRITY CHECK:
  // Our app expects `public.users.id` to match `auth.users.id` (auth uid).
  // If these diverge (often caused by creating Auth users in the dashboard without setting the UID),
  // RLS and profile lookups will break in unpredictable ways.
  if (authData.user.id !== userData.id) {
    console.error('AUTH ID MISMATCH:', {
      employee_id: userData.employee_id,
      email: userData.email,
      users_table_id: userData.id,
      auth_user_id: authData.user.id,
    })

    // Immediately sign out to avoid leaving a session that cannot access its profile via RLS
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (e) {
      console.warn('Failed to sign out after auth id mismatch (continuing):', e)
    }

    return {
      success: false,
      error:
        'Account configuration error: your login account is not linked to your profile record. ' +
        'Please contact a System Admin to repair the account (Auth UID mismatch).',
    }
  }

  // Successful login - reset failed attempts and update last login
  await supabase
    .from('users')
    .update({
      failed_login_attempts: 0,
      account_locked_until: null,
      last_login: new Date().toISOString(),
    })
    .eq('id', userData.id)

  // Create audit log for login
  try {
    await recordAuditLog({
      userId: userData.id,
      action: 'LOGIN',
      module: 'auth',
      entityType: 'users',
      entityId: userData.id,
      details: `Pengguna berjaya log masuk ke sistem melalui Supabase.`,
    })
  } catch (logErr) {
    console.error('Failed to log login event:', logErr)
  }

  // Fetch full user data with relations
  // Note: We use the !column_name syntax to disambiguate relationships
  // since some tables (hospitals, departments) have multiple foreign keys to users
  const { data: fullUser, error: fullUserError } = await supabase
    .from('users')
    .select(`
      *,
      role:roles!role_id(*),
      department:departments!department_id(*),
      hospital:hospitals!hospital_id(*)
    `)
    .eq('id', userData.id)
    .maybeSingle()

  if (fullUserError || !fullUser) {
    if (fullUserError) console.error('Error fetching full user data:', fullUserError)
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (signOutError) {
      console.warn('Failed to clear session after profile lookup failure:', signOutError)
    }
    return { success: false, error: 'Unable to load your account profile. Please try again.' }
  }

  return {
    success: true,
    user: fullUser as UserWithRelations,
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<ResetPasswordResult> {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return { success: true }
    } else {
      return { success: false, error: 'Password reset is unavailable because Supabase is not configured.' }
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: 'Failed to send reset email. Please try again.',
    }
  }
}

/**
 * Reset password with new password
 */
export async function resetPassword(newPassword: string): Promise<ResetPasswordResult> {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { success: true }
    } else {
      return { success: false, error: 'Password update is unavailable because Supabase is not configured.' }
    }
  } catch (error) {
    console.error('Password update error:', error)
    return {
      success: false,
      error: 'Failed to update password. Please try again.',
    }
  }
}

/**
 * Logout user
 * Uses 'local' scope to logout only the current session (not all sessions)
 * 'global' scope requires admin privileges and would revoke all sessions
 * Handles errors gracefully - even if logout fails, we clear local state
 */
export async function logout(): Promise<void> {
  const { clearOfflineIdentity } = await import('@/services/offlineSession')
  clearOfflineIdentity()
  // Record logout event
  try {
    recordAuditLog({
      action: 'LOGOUT',
      module: 'auth',
      entityType: 'session',
      details: 'Pengguna log keluar dari sistem.',
    })
  } catch (err) {
    console.warn('Failed to record logout audit:', err)
  }

  if (isSupabaseConfigured()) {
    try {
      // Try to sign out with local scope first
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      
      if (error) {
        console.warn('Error signing out with local scope, trying without scope:', error)
        
        // Fallback: try without scope parameter
        try {
          await supabase.auth.signOut()
        } catch (fallbackError) {
          console.warn('Error signing out (fallback):', fallbackError)
          // Continue anyway - we'll clear local state below
        }
      }
    } catch (error) {
      // If signOut completely fails, log but don't throw
      // The important thing is to clear local state
      console.warn('Logout error (continuing with local state cleanup):', error)
    }
  }
  
  // Always clear local storage/session storage regardless of Supabase logout result
  // This ensures the UI reflects logged out state even if API call fails
  try {
    if (typeof window !== 'undefined') {
      // Clear Supabase session from localStorage
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase') || key === 'home-auth-session-v2'
      )
      supabaseKeys.forEach(key => localStorage.removeItem(key))
      
      // Clear session storage
      sessionStorage.clear()
    }
  } catch (storageError) {
    console.warn('Error clearing storage:', storageError)
  }
}

/**
 * Get current session
 */
export async function getSession() {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.auth.getSession()
    return data.session
  }
  return null
}

