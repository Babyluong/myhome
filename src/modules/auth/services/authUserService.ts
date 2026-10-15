import { supabase, isSupabaseConfigured } from '../../../services/supabase'
export interface CreateAuthUserResult { success: boolean; authUserId?: string; error?: string; reconciliationRequired?: boolean }
class AdminOperationError extends Error {
  constructor(message: string, public createdAuthUserId?: string) { super(message) }
}
export interface AuthProvisioningScope { hospitalId: string; roleId: string }
async function invoke(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
  const { data, error } = await supabase.functions.invoke('admin-user-ops', { body })
  if (error || data?.error) {
    const details = data || (error?.context instanceof Response ? await error.context.json().catch(() => null) : null)
    throw new AdminOperationError(details?.error || 'Administrative operation unavailable', details?.createdAuthUserId)
  }
  if (!data || typeof data !== 'object') throw new Error('Invalid administrative response')
  return data
}
export async function createAuthUser(email: string, password: string, userId?: string, scope?: AuthProvisioningScope): Promise<CreateAuthUserResult> {
  try {
    if (!scope && userId) {
      const { data, error } = await supabase.from('users').select('hospital_id,role_id').eq('id', userId).maybeSingle()
      if (error) throw new Error('Profile lookup unavailable')
      if (data) scope = { hospitalId: data.hospital_id, roleId: data.role_id }
    }
    if (!scope) throw new Error('Intended hospital and role are required')
    const data = await invoke({ action: 'create_user', email, password, userId, ...scope })
    const user = data.user as { id?: string } | undefined
    if (!data.success || !user?.id) throw new Error('Authentication account was not created')
    return { success: true, authUserId: user.id }
  } catch (error) {
    return { success: false, authUserId: error instanceof AdminOperationError ? error.createdAuthUserId : undefined, reconciliationRequired: error instanceof AdminOperationError && !!error.createdAuthUserId, error: error instanceof AdminOperationError && error.createdAuthUserId ? `${error.message}; Auth ID: ${error.createdAuthUserId}` : error instanceof Error ? error.message : 'Account creation unavailable' }
  }
}
export async function confirmAuthUserEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }
  try {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    return error ? { success: false, error: 'Confirmation email unavailable' } : { success: true }
  } catch { return { success: false, error: 'Confirmation email unavailable' } }
}
export async function checkAuthUserExists(email: string): Promise<{ exists: boolean; userId?: string; error?: string }> {
  try {
    const data = await invoke({ action: 'check_user_exists', email })
    if (typeof data.exists !== 'boolean') throw new Error('Auth lookup unavailable')
    return { exists: data.exists, userId: (data.user as { id?: string } | undefined)?.id }
  } catch (error) { return { exists: false, error: error instanceof Error ? error.message : 'Auth lookup unavailable' } }
}
export async function fixMissingAuthAccount(userId: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const result = await checkAuthUserExists(email)
  if (result.error) return { success: false, error: result.error }
  if (result.exists && result.userId) return updateAuthUserPassword(result.userId, password)
  return createAuthUser(email, password, userId)
}
export async function updateAuthUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await invoke({ action: 'update_password', authUserId: userId, password: newPassword })
    return data.success ? { success: true } : { success: false, error: 'Password update unavailable' }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Password update unavailable' } }
}
export async function adminResetUserPassword(userId: string, _email: string, newPassword: string): Promise<{ success: boolean; error?: string; message?: string }> {
  const result = await updateAuthUserPassword(userId, newPassword)
  return result.success ? { success: true, message: 'Kata laluan berjaya dikemaskini.' } : result
}
