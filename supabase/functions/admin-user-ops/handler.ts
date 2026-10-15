import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type', 'Content-Type': 'application/json' }
class OperationError extends Error { constructor(public status: number, message: string) { super(message) } }
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
export function createAdminUserOpsHandler(client: SupabaseClient) {
  return async (req: Request): Promise<Response> => {
    const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers })
    if (req.method === 'OPTIONS') return respond({})
    if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405)
    try {
      const bearer = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
      if (!bearer) throw new OperationError(401, 'Authentication required')
      const { data: auth, error: authError } = await client.auth.getUser(bearer)
      if (authError || !auth.user) throw new OperationError(401, 'Invalid session')
      const { data: actor, error: actorError } = await client.from('users').select('id,hospital_id,role_id,status').eq('id', auth.user.id).maybeSingle()
      if (actorError) throw new OperationError(503, 'Actor lookup unavailable')
      if (!actor || actor.status !== 'active') throw new OperationError(403, 'Active administrator required')
      const roleFor = async (id: string) => {
        const { data, error } = await client.from('roles').select('id,role_code,hospital_id').eq('id', id).maybeSingle()
        if (error || !data) throw new OperationError(503, 'Role lookup unavailable')
        return data
      }
      const actorRole = await roleFor(actor.role_id)
      if (actorRole.hospital_id && actorRole.hospital_id !== actor.hospital_id) throw new OperationError(403, 'Actor role outside hospital')
      if (!['system_admin', 'hospital_admin'].includes(actorRole.role_code)) throw new OperationError(403, 'Administrator required')
      const body = await req.json().catch(() => { throw new OperationError(400, 'Invalid JSON') })
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new OperationError(400, 'Object body required')
      const { action, email, password, userId, authUserId, hospitalId, roleId } = body
      if (!['create_user','check_user_exists','update_password','delete_user'].includes(action)) throw new OperationError(400, 'Invalid action')
      const authorize = (hospital: string | null, role: string) => {
        if (actorRole.role_code === 'system_admin') return
        if (!hospital || hospital !== actor.hospital_id || role === 'system_admin') throw new OperationError(403, 'Target outside administrator scope')
      }
      const audit = async (stage: string, targetId: string | null, hospital: string | null) => {
        const { error } = await client.from('audit_logs').insert({ user_id: actor.id, action: `AUTH_${action.toUpperCase()}_${stage}`, module: 'admin', entity_type: 'auth_user', entity_id: targetId, new_values: { hospital_id: hospital } })
        if (error) throw new OperationError(503, stage === 'REQUESTED' ? 'Audit unavailable; operation cancelled' : 'Operation performed; audit reconciliation required')
      }
      if (action === 'create_user') {
        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 6 || !uuid(hospitalId) || !uuid(roleId)) throw new OperationError(400, 'Email, password, intended hospital and role required')
        const role = await roleFor(roleId)
        if (role.hospital_id && role.hospital_id !== hospitalId) throw new OperationError(403, 'Role outside target hospital')
        authorize(hospitalId, role.role_code)
        const { data: hospital, error: hospitalError } = await client.from('hospitals').select('id').eq('id', hospitalId).maybeSingle()
        if (hospitalError || !hospital) throw new OperationError(400, 'Target hospital unavailable')
        if (userId) {
          if (!uuid(userId)) throw new OperationError(400, 'Invalid profile ID')
          const { data: profile, error } = await client.from('users').select('id,email,hospital_id,role_id').eq('id', userId).maybeSingle()
          if (error) throw new OperationError(503, 'Target lookup unavailable')
          if (profile && (profile.email?.toLowerCase() !== email.toLowerCase() || profile.hospital_id !== hospitalId)) throw new OperationError(403, 'Profile mapping mismatch')
        }
        await audit('REQUESTED', typeof userId === 'string' ? userId : null, hospitalId)
        const { data, error } = await client.auth.admin.createUser({ ...(typeof userId === 'string' ? { id: userId } : {}), email, password, email_confirm: true, app_metadata: { provisioned_by: actor.id, hospital_id: hospitalId, role_id: roleId } })
        if (error || !data.user) throw new OperationError(409, 'Auth account creation failed')
        if (typeof userId === 'string' && data.user.id !== userId) {
          const { error: cleanupError } = await client.auth.admin.deleteUser(data.user.id)
          return respond({ success: false, error: cleanupError ? 'Auth ID mismatch; created account requires reconciliation' : 'Auth ID mismatch; created account rolled back', createdAuthUserId: cleanupError ? data.user.id : undefined, reconciliationRequired: !!cleanupError }, 503)
        }
        try { await audit('COMPLETED', data.user.id, hospitalId) } catch {
          const { error: rollbackError } = await client.auth.admin.deleteUser(data.user.id)
          return respond({ success: false, error: rollbackError ? 'Audit failed; Auth account requires reconciliation' : 'Audit failed; account creation rolled back', createdAuthUserId: rollbackError ? data.user.id : undefined, reconciliationRequired: !!rollbackError }, 503)
        }
        return respond({ success: true, user: { id: data.user.id, email: data.user.email } })
      }
      if (action === 'check_user_exists') {
        if (typeof email !== 'string' || !email) throw new OperationError(400, 'Email required')
        const { data: profile, error } = await client.from('users').select('id,hospital_id,role_id').eq('email', email).maybeSingle()
        if (error) throw new OperationError(503, 'Target lookup unavailable')
        if (profile) authorize(profile.hospital_id, (await roleFor(profile.role_id)).role_code)
        else if (actorRole.role_code !== 'system_admin') throw new OperationError(403, 'Target profile required')
        const seenUsers = new Set<string>()
        for (let page = 1; ; page++) {
          const { data, error: listError } = await client.auth.admin.listUsers({ page, perPage: 1000 })
          if (listError) throw new OperationError(503, 'Auth lookup unavailable')
          const found = data.users.find(user => user.email?.toLowerCase() === email.toLowerCase())
          if (found) {
            if (profile && found.id !== profile.id) throw new OperationError(409, 'Public profile and Auth identity require reconciliation')
            return respond({ exists: true, user: { id: found.id, email: found.email } })
          }
          if (data.users.length === 0) return respond({ exists: false })
          if (data.users.every(user => seenUsers.has(user.id))) throw new OperationError(503, 'Auth pagination did not advance')
          data.users.forEach(user => seenUsers.add(user.id))
        }
      }
      if (!uuid(authUserId)) throw new OperationError(400, 'Valid Auth user ID required')
      const { data: profile, error: targetError } = await client.from('users').select('id,hospital_id,role_id').eq('id', authUserId).maybeSingle()
      if (targetError) throw new OperationError(503, 'Target lookup unavailable')
      let targetHospital: string | null = null
      if (profile) {
        targetHospital = profile.hospital_id
        authorize(targetHospital, (await roleFor(profile.role_id)).role_code)
      } else {
        const { data, error } = await client.auth.admin.getUserById(authUserId)
        if (error || !data.user || data.user.app_metadata.provisioned_by !== actor.id) throw new OperationError(403, 'Target profile required')
        targetHospital = data.user.app_metadata.hospital_id
        authorize(targetHospital, (await roleFor(data.user.app_metadata.role_id)).role_code)
        if (action !== 'delete_user') throw new OperationError(403, 'Unmapped account permits provisioning rollback only')
      }
      if (action === 'delete_user' && authUserId === actor.id) throw new OperationError(403, 'Administrator cannot delete own account here')
      if (action === 'update_password' && (typeof password !== 'string' || password.length < 6)) throw new OperationError(400, 'Valid password required')
      await audit('REQUESTED', authUserId, targetHospital)
      const result = action === 'delete_user' ? await client.auth.admin.deleteUser(authUserId) : await client.auth.admin.updateUserById(authUserId, { password, email_confirm: true })
      if (result.error) throw new OperationError(409, 'Auth operation failed')
      await audit('COMPLETED', authUserId, targetHospital)
      return respond({ success: true })
    } catch (error) {
      return respond({ error: error instanceof OperationError ? error.message : 'Administrative operation unavailable' }, error instanceof OperationError ? error.status : 500)
    }
  }
}
