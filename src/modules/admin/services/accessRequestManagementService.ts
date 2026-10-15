import { supabase, isSupabaseConfigured } from '@/services/supabase'
import type { AccessRequestWithRelations, PaginatedResponse, FilterConfig, SortConfig } from '@/types'
import { DEFAULT_PAGE_SIZE, SYSTEM_ROLES } from '@/lib/constants'
import { createAuthUser } from '@/services/authUserService'
import { decryptPassword } from '@/lib/encryptionUtils'

export interface GetAccessRequestsParams {
  page?: number
  pageSize?: number
  search?: string
  filters?: FilterConfig[]
  sort?: SortConfig
  status?: string
  hospitalId?: string
}

/**
 * Helper: Get current user's role and hospital info
 */
async function getCurrentUserInfo(userId: string): Promise<{
  roleCode: string | null
  hospitalId: string | null
  isSystemAdmin: boolean
  isHospitalAdmin: boolean
} | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Access request service is unavailable because Supabase is not configured.')
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        role:roles!role_id(role_code),
        hospital_id
      `)
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    if (!user) return null

    const roleData = Array.isArray(user.role) ? user.role[0] : user.role
    const roleCode = roleData?.role_code || null
    const hospitalId = user.hospital_id || null

    return {
      roleCode,
      hospitalId,
      isSystemAdmin: roleCode === SYSTEM_ROLES.SYSTEM_ADMIN,
      isHospitalAdmin: roleCode === SYSTEM_ROLES.HOSPITAL_ADMIN,
    }
  } catch (error) {
    console.error('Error in getCurrentUserInfo:', error)
    throw error
  }
}

/**
 * Helper: Validate that Hospital Admin can only access their own hospital's requests
 */
async function validateHospitalAccess(
  requestHospitalId: string | null,
  approverUserId: string
): Promise<{ valid: boolean; error?: string }> {
  if (!approverUserId) return { valid: false, error: 'Administrator identity is required.' }

  const userInfo = await getCurrentUserInfo(approverUserId)
  
  if (!userInfo) return { valid: false, error: 'Unable to verify administrator access.' }

  // System Admin can access all hospitals
  if (userInfo.isSystemAdmin) {
    return { valid: true }
  }

  // Hospital Admin can only access their own hospital
  if (userInfo.isHospitalAdmin) {
    if (!requestHospitalId || !userInfo.hospitalId) {
      return { valid: false, error: 'Hospital information is missing' }
    }
    
    if (requestHospitalId !== userInfo.hospitalId) {
      return {
        valid: false,
        error: 'You do not have permission to approve access requests for other hospitals. ' +
               'You can only approve requests for your own hospital.'
      }
    }
    
    return { valid: true }
  }

  // Only System Admin and Hospital Admin can approve requests
  return {
    valid: false,
    error: 'You do not have permission to approve access requests. ' +
           'Only System Administrators and Hospital Administrators can approve requests.'
  }
}

/**
 * Helper: Validate that admin roles cannot be assigned during approval
 */
async function validateRoleAssignment(roleId: string): Promise<{ valid: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { valid: false, error: 'Role validation is unavailable because Supabase is not configured.' }
  }

  try {
    // Get role info
    const { data: role, error } = await supabase
      .from('roles')
      .select('role_code')
      .eq('id', roleId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching role:', error)
      return { valid: false, error: 'Failed to validate role' }
    }

    if (!role) {
      return { valid: false, error: 'Role not found' }
    }

    // Prevent assigning admin roles through access request approval
    if (role.role_code === SYSTEM_ROLES.SYSTEM_ADMIN || role.role_code === SYSTEM_ROLES.HOSPITAL_ADMIN) {
      return {
        valid: false,
        error: `Cannot assign ${role.role_code === SYSTEM_ROLES.SYSTEM_ADMIN ? 'System Admin' : 'Hospital Admin'} role through access request approval. ` +
               'Admin roles must be assigned manually by System Administrators.'
      }
    }

    return { valid: true }
  } catch (error) {
    console.error('Error in validateRoleAssignment:', error)
    return { valid: false, error: 'Failed to validate role assignment' }
  }
}

/**
 * Get paginated list of access requests
 */
export async function getAccessRequests(params: GetAccessRequestsParams = {}): Promise<PaginatedResponse<AccessRequestWithRelations>> {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search = '',
    sort,
    status,
    hospitalId,
  } = params

  try {
    if (isSupabaseConfigured()) {
      // Supabase implementation
      let query = supabase
        .from('access_requests')
        .select(`
          *,
          hospital:hospitals(*),
          department:departments(*),
          reviewed_by_user:users!access_requests_reviewed_by_fkey(*)
        `, { count: 'exact' })

      // Apply filters
      if (hospitalId) {
        query = query.eq('hospital_id', hospitalId)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Apply search
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,ic_number.ilike.%${search}%`)
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.key, { ascending: sort.direction === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: (data || []) as AccessRequestWithRelations[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    } else {
      throw new Error('Access request service is unavailable because Supabase is not configured.')
    }
  } catch (error) {
    console.error('Error fetching access requests:', error)
    throw error
  }
}

/**
 * Get access request by ID
 * Optionally validate that the requester has permission to view this request
 */
export async function getAccessRequestById(
  requestId: string,
  requesterUserId?: string
): Promise<AccessRequestWithRelations | null> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('access_requests')
        .select(`
          *,
          hospital:hospitals(*),
          department:departments(*),
          reviewed_by_user:users!access_requests_reviewed_by_fkey(*)
        `)
        .eq('id', requestId)
        .maybeSingle()

      if (error) throw error
      
      // If requesterUserId is provided, validate access
      if (requesterUserId && data) {
        const accessValidation = await validateHospitalAccess(data.hospital_id, requesterUserId)
        if (!accessValidation.valid) {
          throw new Error(accessValidation.error || 'Access denied')
        }
      }
      
      return data as AccessRequestWithRelations
    } else {
      throw new Error('Access request service is unavailable because Supabase is not configured.')
    }
  } catch (error) {
    console.error('Error fetching access request:', error)
    throw error
  }
}

/**
 * Approve access request and create user account
 */
export async function approveAccessRequest(
  requestId: string,
  approvedBy: string,
  roleId: string
): Promise<{ 
  success: boolean
  error?: string
  userId?: string
  employeeId?: string
  email?: string
}> {
  let statusUpdated = false
  let createdUserId: string | null = null
  let isNewUser = false
  
  try {
    if (isSupabaseConfigured()) {
      // Get the request first (without validation to check if it exists)
      const request = await getAccessRequestById(requestId)
      if (!request) {
        return { success: false, error: 'Access request not found or you do not have permission to view it' }
      }

      // SECURITY: Validate hospital access for this specific request
      const hospitalValidation = await validateHospitalAccess(request.hospital_id, approvedBy)
      if (!hospitalValidation.valid) {
        return { success: false, error: hospitalValidation.error || 'Access denied' }
      }

      // SECURITY: Validate that admin roles cannot be assigned
      const roleValidation = await validateRoleAssignment(roleId)
      if (!roleValidation.valid) {
        return { success: false, error: roleValidation.error || 'Invalid role assignment' }
      }

      // Validate and create user FIRST, then update status only if everything succeeds
      // This prevents marking as "approved" if there are any errors
      
      // Resolve role_id - check if roleId is a UUID or a role code
      let actualRoleId = roleId
      
      // Check if roleId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(roleId)) {
        // It's a role code, not a UUID - look up the actual role UUID
        let roleQuery = supabase
          .from('roles')
          .select('id')
          .eq('role_code', roleId)
        
        if (request.hospital_id) {
          roleQuery = roleQuery.or(`hospital_id.is.null,hospital_id.eq.${request.hospital_id}`)
        } else {
          roleQuery = roleQuery.is('hospital_id', null)
        }
        
        const { data: roleData, error: roleError } = await roleQuery.maybeSingle()
        
        if (roleError) {
          console.error('Error looking up role:', roleError)
          throw new Error(`Failed to look up role: ${roleError.message}`)
        }
        
        if (!roleData || !roleData.id) {
          throw new Error(`Role not found: ${roleId}. Please select a valid role.`)
        }
        
        actualRoleId = roleData.id
        
        // SECURITY: Double-check the resolved role is not an admin role
        const resolvedRoleValidation = await validateRoleAssignment(actualRoleId)
        if (!resolvedRoleValidation.valid) {
          return { success: false, error: resolvedRoleValidation.error || 'Invalid role assignment' }
        }
      } else {
        // SECURITY: If roleId is a UUID, validate it's not an admin role
        const uuidRoleValidation = await validateRoleAssignment(roleId)
        if (!uuidRoleValidation.valid) {
          return { success: false, error: uuidRoleValidation.error || 'Invalid role assignment' }
        }
      }

      // Check if user already exists in public.users table by IC number or email
      const { data: existingUserByIc, error: checkIcError } = await supabase
        .from('users')
        .select('id, employee_id, email, ic_number, hospital_id')
        .eq('ic_number', request.ic_number)
        .maybeSingle()

      const { data: existingUserByEmail, error: checkEmailError } = await supabase
        .from('users')
        .select('id, employee_id, email, ic_number, hospital_id')
        .eq('email', request.email)
        .maybeSingle()

      if (checkIcError) {
        console.error('Error checking for existing user by IC:', checkIcError)
      }
      if (checkEmailError) {
        console.error('Error checking for existing user by email:', checkEmailError)
      }

      // SECURITY & INTEGRITY: Collision checks
      // If existing user with same IC has a different email
      if (existingUserByIc && existingUserByIc.email.toLowerCase() !== request.email.toLowerCase()) {
        return {
          success: false,
          error: `Pengguna dengan No. KP ${request.ic_number} sudah berdaftar di bawah emel yang lain (${existingUserByIc.email}). Sila semak semula No. KP pemohon bagi mengelakkan pertembungan akaun.`,
        }
      }

      // If existing user with same Email has a different IC
      if (existingUserByEmail && existingUserByEmail.ic_number !== request.ic_number) {
        return {
          success: false,
          error: `Pengguna dengan emel ${request.email} sudah berdaftar di bawah No. KP yang berbeza (${existingUserByEmail.ic_number}). Sila semak semula maklumat pemohon.`,
        }
      }

      const existingUser = existingUserByIc || existingUserByEmail

      // Check if existing user is in a different hospital
      if (existingUser && existingUser.hospital_id !== request.hospital_id) {
        return {
          success: false,
          error: `Pengguna dengan No. KP ${request.ic_number} sudah berdaftar di hospital lain. ` +
                 'Sila hubungi Pentadbir Sistem jika perlu membuat pertukaran hospital.'
        }
      }

      // Use IC number as employee_id (remove dashes if present)
      const employeeId = request.ic_number.replace(/-/g, '')
      
      // Decrypt the password for Supabase Auth account creation with fallback
      let plainPassword = `MOH@${employeeId}`
      if (request.password_encrypted) {
        try {
          plainPassword = await decryptPassword(request.password_encrypted)
        } catch (error) {
          console.warn('Error decrypting password from access request, using default temporary password fallback:', error)
        }
      }

      // CRITICAL: Supabase Auth user creation MUST happen FIRST for new users
      // This ensures public.users.id strictly matches auth.users.id (Auth UID)
      const { success: authSuccess, error: authError, authUserId } = await createAuthUser(
        request.email,
        plainPassword,
        existingUser?.id, { hospitalId: request.hospital_id, roleId: actualRoleId }
      )

      if (!authSuccess || (!existingUser && !authUserId)) {
        console.error('Failed to create Auth user:', authError)
        return {
          success: false,
          error: `Gagal mencipta akaun pengesahan (Supabase Auth): ${authError || 'Tiada Auth UID dipulangkan'}. ` +
                 'Akaun pengguna tidak dicipta. Sila cuba lagi atau hubungi pentadbir sistem.',
        }
      }

      const newUserId = existingUser?.id || authUserId!
      isNewUser = !existingUser

      // Prepare user data for public.users
      const userData = {
        email: request.email,
        employee_id: employeeId,
        full_name: request.full_name,
        ic_number: request.ic_number,
        phone_number: request.phone_number,
        date_of_birth: request.date_of_birth,
        gender: request.gender,
        address: request.address,
        profile_photo_url: request.profile_photo_url,
        hospital_id: request.hospital_id,
        department_id: request.department_id,
        role_id: actualRoleId,
        jawatan: request.jawatan,
        status: 'active' as const,
        failed_login_attempts: 0,
        updated_at: new Date().toISOString(),
      }

      let newUser: { id: string; employee_id: string }
      if (existingUser) {
        // Update existing user in the same hospital
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', existingUser.id)
          .select()
          .maybeSingle()
        
        if (updateError) {
          console.error('Error updating existing user:', updateError)
          throw updateError
        }
        
        if (!updatedUser) {
          throw new Error('Gagal mengemaskini profil pengguna sedia ada.')
        }
        newUser = updatedUser
      } else {
        // Insert new user with the exact Auth user ID
        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert({
            ...userData,
            id: newUserId,
            created_by: approvedBy,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting user record:', insertError)
          throw insertError
        }
        newUser = insertedUser
      }

      createdUserId = newUser.id

      // Create emergency contact if provided
      if (request.emergency_contact_name && request.emergency_contact_phone) {
        await supabase.from('emergency_contacts').insert({
          user_id: newUser.id,
          contact_name: request.emergency_contact_name,
          relationship: request.emergency_contact_relationship || 'other',
          phone_primary: request.emergency_contact_phone,
          phone_secondary: undefined,
          address: request.emergency_contact_address,
        })
      }

      // Delete the encrypted password from access_requests for security
      // The password_hash remains for verification purposes
      await supabase
        .from('access_requests')
        .update({ password_encrypted: null })
        .eq('id', requestId)

      // No email sending - user already set their password during access request submission
      // The password_hash is stored in access_requests and can be used for verification

      // NOW update the access request status to "approved" - only after everything succeeded
      const { data: updatedRequest, error: statusUpdateError } = await supabase
        .from('access_requests')
        .update({
          status: 'approved',
          reviewed_by: approvedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('id, status, reviewed_by, reviewed_at')
        .maybeSingle()

      if (statusUpdateError) {
        console.error('Error updating access request status:', statusUpdateError)
        throw new Error(`Failed to update access request status: ${statusUpdateError.message}`)
      }
      
      if (updatedRequest && updatedRequest.status !== 'approved') {
        console.error('Status update did not set status to approved. Updated request:', updatedRequest)
        throw new Error(`Status update failed: Expected 'approved' but got '${updatedRequest.status}'`)
      }
      
      console.log('Status updated successfully:', updatedRequest || requestId)
      statusUpdated = true

      // Return success - no credentials needed since user set their own password
      return { 
        success: true, 
        userId: newUser.id,
        employeeId: newUser.employee_id,
        email: request.email
      }
    } else {
      return { success: false, error: 'Access request service is unavailable because Supabase is not configured.' }
    }
  } catch (error) {
    console.error('Error approving access request:', error)
    
    // Rollback: If status was updated but user creation failed, revert status to pending
    if (statusUpdated && isSupabaseConfigured()) {
      try {
        await supabase
          .from('access_requests')
          .update({
            status: 'pending',
            reviewed_by: null,
            reviewed_at: null,
          })
          .eq('id', requestId)
      } catch (rollbackError) {
        console.error('Error rolling back access request status:', rollbackError)
      }
    }
    
    // Rollback: If user was created but something else failed, delete the user
    if (createdUserId && isNewUser && isSupabaseConfigured()) {
      try {
        await supabase.from('users').delete().eq('id', createdUserId)
      } catch (rollbackError) {
        console.error('Error rolling back user creation:', rollbackError)
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to approve access request' 
    }
  }
}

/**
 * Reject access request
 */
export async function rejectAccessRequest(
  requestId: string,
  rejectedBy: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isSupabaseConfigured()) {
      // SECURITY: Get the request first to validate hospital access
      const request = await getAccessRequestById(requestId, rejectedBy)
      if (!request) {
        return { success: false, error: 'Access request not found or you do not have permission to view it' }
      }

      // SECURITY: Validate hospital access for this specific request
      const hospitalValidation = await validateHospitalAccess(request.hospital_id, rejectedBy)
      if (!hospitalValidation.valid) {
        return { success: false, error: hospitalValidation.error || 'Access denied' }
      }

      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'rejected',
          reviewed_by: rejectedBy,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', requestId)

      if (error) throw error
      return { success: true }
    } else {
      return { success: false, error: 'Access request service is unavailable because Supabase is not configured.' }
    }
  } catch (error) {
    console.error('Error rejecting access request:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reject access request' 
    }
  }
}


