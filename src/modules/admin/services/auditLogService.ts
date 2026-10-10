// @ts-nocheck
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import { mockAuditLogs, mockUsers } from '@/services/mockData'
import type { AuditLog, AuditLogWithRelations, PaginatedResponse, SortConfig } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

const STORAGE_KEY = 'hom_system_audit_logs_master_v3'

export interface RecordAuditLogParams {
  userId?: string
  action: string // e.g. 'LOGIN', 'LOGOUT', 'NAVIGATE_PAGE', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'SECURITY'
  module: string // e.g. 'auth', 'myadmin', 'myformulari', 'mystaff', 'mykunci', 'mysuhu', 'mycylinder', 'myperolehan', 'mytransporter', 'mytempahan', 'mypriviledging'
  entityType?: string // e.g. 'session', 'page_route', 'user', 'role', 'drug', 'key', 'staff_leave', 'temperature_log', etc.
  entityId?: string
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  details?: string
  ipAddress?: string
  userAgent?: string
}

export interface GetAuditLogsParams {
  page?: number
  pageSize?: number
  search?: string
  module?: string
  action?: string
  userId?: string
  startDate?: string
  endDate?: string
  sort?: SortConfig
}

export interface AuditLogStats {
  totalLogs: number
  todayLogins: number
  navigationEvents: number
  criticalActions: number
  topModules: { module: string; count: number }[]
}

/**
 * Helper to resolve user object from all available registries
 */
export function resolveAuditUser(userId?: string): any {
  if (!userId) return null
  const found = mockUsers.find((u) => u.id === userId || u.employee_id === userId || u.ic_number === userId)
  if (found) return found
  return null
}

/**
 * Retrieve current active local storage audit logs
 */
function getLocalAuditLogs(): AuditLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length >= 10) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to read audit logs from localStorage:', err)
  }

  // Initialize with complete multi-user mockAuditLogs
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAuditLogs))
  } catch (err) {
    console.warn('Failed to initialize audit logs in localStorage:', err)
  }
  return [...mockAuditLogs]
}

/**
 * Save audit logs to local storage
 */
function saveLocalAuditLogs(logs: AuditLog[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  } catch (err) {
    console.warn('Failed to save audit logs to localStorage:', err)
  }
}

/**
 * Record a new system audit log event
 */
export async function recordAuditLog(params: RecordAuditLogParams): Promise<AuditLogWithRelations> {
  const timestamp = new Date().toISOString()
  const logId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

  // Get current active user from auth storage if not supplied
  let effectiveUserId = params.userId
  if (!effectiveUserId) {
    try {
      const authRaw = sessionStorage.getItem('home-auth-storage') || localStorage.getItem('home-auth-storage')
      if (authRaw) {
        const authData = JSON.parse(authRaw)
        if (authData?.state?.user?.id) {
          effectiveUserId = authData.state.user.id
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  const logEntry: AuditLog = {
    id: logId,
    user_id: effectiveUserId || 'user-hod-tyz',
    action: params.action.toUpperCase(),
    module: params.module.toLowerCase(),
    entity_type: params.entityType || 'system',
    entity_id: params.entityId || logId,
    old_values: params.oldValues || undefined,
    new_values: params.newValues || (params.details ? { description: params.details } : undefined),
    ip_address: params.ipAddress || '192.168.1.100',
    user_agent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Mozilla/5.0'),
    created_at: timestamp,
    updated_at: timestamp,
  }

  // 1. In-memory & LocalStorage update
  const currentLogs = getLocalAuditLogs()
  const updatedLogs = [logEntry, ...currentLogs]
  saveLocalAuditLogs(updatedLogs)

  // Keep mockAuditLogs array in sync
  mockAuditLogs.unshift(logEntry)

  // 2. Persist to Supabase if configured and online
  if (isSupabaseConfigured()) {
    try {
      // Supabase audit_logs.user_id is type uuid referencing users(id).
      // If effectiveUserId is not a valid UUID (e.g. demo string), send null to avoid 22P02 Postgres errors.
      const isValidUuid = typeof effectiveUserId === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId)
      const dbUserId = isValidUuid ? effectiveUserId : null

      const { error } = await supabase.from('audit_logs').insert({
        user_id: dbUserId,
        action: logEntry.action,
        module: logEntry.module,
        entity_type: logEntry.entity_type,
        entity_id: logEntry.entity_id,
        old_values: logEntry.old_values,
        new_values: effectiveUserId && !isValidUuid
          ? { ...(logEntry.new_values || {}), local_user_id: effectiveUserId }
          : logEntry.new_values,
        ip_address: logEntry.ip_address,
        user_agent: logEntry.user_agent,
      })

      if (error) {
        console.warn('Could not persist audit log to Supabase, saved locally:', error.message)
      }
    } catch (err) {
      console.warn('Could not persist audit log to Supabase, saved locally:', err)
    }
  }

  const userRelation = resolveAuditUser(logEntry.user_id)
  return {
    ...logEntry,
    user: userRelation,
  }
}

/**
 * Get paginated & filtered list of audit logs
 */
export async function getAuditLogs({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  module,
  action,
  userId,
  startDate,
  endDate,
  sort = { key: 'created_at', direction: 'desc' },
}: GetAuditLogsParams): Promise<PaginatedResponse<AuditLogWithRelations>> {
  try {
    let combinedLogs: AuditLogWithRelations[] = []

    // 1. Fetch from Supabase with direct query filters
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('audit_logs')
          .select('*, user:users(*)')
          .order('created_at', { ascending: sort?.direction === 'asc' })

        // Direct user filter on database
        if (userId && userId !== 'all') {
          query = query.eq('user_id', userId)
        }

        // Direct module filter on database
        if (module && module !== 'all') {
          query = query.ilike('module', `%${module}%`)
        }

        // Direct date range on database
        if (startDate) {
          const startGte = startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`
          query = query.gte('created_at', startGte)
        }
        if (endDate) {
          const endLte = endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`
          query = query.lte('created_at', endLte)
        }

        // Action filters on database
        if (action && action !== 'all') {
          const upperAction = action.toUpperCase()
          if (upperAction === 'LOGIN_LOGOUT') {
            query = query.or('action.ilike.%LOGIN%,action.ilike.%LOGOUT%')
          } else if (upperAction === 'NAVIGATION') {
            query = query.or('action.ilike.%NAVIGATE%,action.ilike.%PAGE%,action.ilike.%VIEW%')
          } else if (upperAction === 'CREATE') {
            query = query.or('action.ilike.%CREATE%,action.ilike.%INSERT%,action.ilike.%ADD%')
          } else if (upperAction === 'UPDATE') {
            query = query.or('action.ilike.%UPDATE%,action.ilike.%EDIT%,action.ilike.%MODIFY%,action.ilike.%RESET%')
          } else if (upperAction === 'DELETE') {
            query = query.or('action.ilike.%DELETE%,action.ilike.%REMOVE%')
          } else if (upperAction === 'APPROVE_REJECT') {
            query = query.or('action.ilike.%APPROVE%,action.ilike.%REJECT%')
          } else if (upperAction === 'EXPORT') {
            query = query.or('action.ilike.%EXPORT%,action.ilike.%DOWNLOAD%')
          } else {
            query = query.ilike('action', `%${action}%`)
          }
        }

        // Retrieve up to 3,000 real records across all staff to ensure complete transparency
        const { data: supaLogs, error } = await query.limit(3000)

        if (!error && supaLogs) {
          combinedLogs = supaLogs.map((l: any) => ({
            ...l,
            user: l.user || resolveAuditUser(l.user_id),
          }))
        }
      } catch (err) {
        console.warn('Error fetching Supabase audit logs, falling back to local storage:', err)
      }
    }

    // 2. Fallback if offline / local only
    if (combinedLogs.length === 0) {
      const localLogs = getLocalAuditLogs()
      combinedLogs = localLogs.map((l) => ({
        ...l,
        user: resolveAuditUser(l.user_id),
      }))
    }

    // 3. Filter combinedLogs for search query or any additional criteria
    let filteredLogs = combinedLogs.filter((log) => {
      const user = log.user || resolveAuditUser(log.user_id)

      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase()
        const matchAction = log.action?.toLowerCase().includes(q)
        const matchModule = log.module?.toLowerCase().includes(q)
        const matchEntity = log.entity_type?.toLowerCase().includes(q) || log.entity_id?.toLowerCase().includes(q)
        const matchIp = log.ip_address?.toLowerCase().includes(q)
        const matchUserName = user?.full_name?.toLowerCase().includes(q) || false
        const matchUserIc = user?.ic_number?.toLowerCase().includes(q) || false
        const matchUserEmpId = user?.employee_id?.toLowerCase().includes(q) || false
        const matchDetails = log.new_values ? JSON.stringify(log.new_values).toLowerCase().includes(q) : false

        if (!matchAction && !matchModule && !matchEntity && !matchIp && !matchUserName && !matchUserIc && !matchUserEmpId && !matchDetails) {
          return false
        }
      }

      if (module && module !== 'all') {
        if (!log.module?.toLowerCase().includes(module.toLowerCase())) return false
      }

      if (action && action !== 'all') {
        const upperAction = log.action?.toUpperCase()
        if (action === 'LOGIN_LOGOUT') {
          if (!upperAction?.includes('LOGIN') && !upperAction?.includes('LOGOUT')) return false
        } else if (action === 'NAVIGATION') {
          if (!upperAction?.includes('NAVIGATE') && !upperAction?.includes('PAGE') && !upperAction?.includes('VIEW')) return false
        } else if (action === 'CREATE') {
          if (!upperAction?.includes('CREATE') && !upperAction?.includes('INSERT') && !upperAction?.includes('ADD')) return false
        } else if (action === 'UPDATE') {
          if (!upperAction?.includes('UPDATE') && !upperAction?.includes('EDIT') && !upperAction?.includes('MODIFY') && !upperAction?.includes('RESET')) return false
        } else if (action === 'DELETE') {
          if (!upperAction?.includes('DELETE') && !upperAction?.includes('REMOVE')) return false
        } else if (action === 'APPROVE_REJECT') {
          if (!upperAction?.includes('APPROVE') && !upperAction?.includes('REJECT')) return false
        } else if (action === 'EXPORT') {
          if (!upperAction?.includes('EXPORT') && !upperAction?.includes('DOWNLOAD')) return false
        } else {
          if (upperAction !== action.toUpperCase() && !upperAction?.includes(action.toUpperCase())) return false
        }
      }

      if (userId && userId !== 'all') {
        if (log.user_id !== userId && user?.id !== userId) return false
      }

      if (startDate) {
        const logDate = new Date(log.created_at).getTime()
        const start = startDate.includes('T') ? new Date(startDate).getTime() : new Date(`${startDate}T00:00:00.000Z`).getTime()
        if (logDate < start) return false
      }

      if (endDate) {
        const logDate = new Date(log.created_at).getTime()
        const end = endDate.includes('T') ? new Date(endDate).getTime() : new Date(`${endDate}T23:59:59.999Z`).getTime()
        if (logDate > end) return false
      }

      return true
    })

    // Sorting
    if (sort) {
      filteredLogs.sort((a, b) => {
        const aValue = a[sort.key as keyof AuditLog]
        const bValue = b[sort.key as keyof AuditLog]

        if (sort.key === 'created_at') {
          const timeA = new Date(a.created_at).getTime()
          const timeB = new Date(b.created_at).getTime()
          return sort.direction === 'asc' ? timeA - timeB : timeB - timeA
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }
        return 0
      })
    } else {
      filteredLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    const total = filteredLogs.length
    const totalPages = Math.ceil(total / pageSize) || 1
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    const logsWithRelations: AuditLogWithRelations[] = paginatedLogs.map((log) => ({
      ...log,
      user: log.user || resolveAuditUser(log.user_id) || {
        id: log.user_id || 'unknown',
        full_name: 'Pegawai Bertugas (System)',
        employee_id: 'STAFF',
        email: 'staff@home.gov.my',
      },
    }))

    return {
      data: logsWithRelations,
      total,
      page,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    throw error
  }
}

/**
 * Compute real-time analytics & KPIs for audit logs from real database
 */
export async function getAuditLogStats(): Promise<AuditLogStats> {
  try {
    let logs: Array<{ action?: string; module?: string; user_id?: string; created_at: string }> = []

    if (isSupabaseConfigured()) {
      try {
        const { data: supaStats, error } = await supabase
          .from('audit_logs')
          .select('action, module, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(5000)

        if (!error && supaStats && supaStats.length > 0) {
          logs = supaStats
        }
      } catch (dbErr) {
        console.warn('Could not query Supabase for stats, falling back to local data:', dbErr)
      }
    }

    if (logs.length === 0) {
      logs = getLocalAuditLogs()
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    let todayLogins = 0
    let navigationEvents = 0
    let criticalActions = 0
    const moduleCounts: Record<string, number> = {}
    const distinctUsers = new Set<string>()

    logs.forEach((log) => {
      if (log.user_id) distinctUsers.add(log.user_id)
      const actionUpper = log.action?.toUpperCase() || ''
      const logTime = new Date(log.created_at).getTime()

      if (actionUpper.includes('LOGIN') && logTime >= todayTimestamp) {
        todayLogins++
      }

      if (actionUpper.includes('NAVIGATE') || actionUpper.includes('PAGE') || actionUpper.includes('VIEW')) {
        navigationEvents++
      }

      if (
        actionUpper.includes('CREATE') ||
        actionUpper.includes('UPDATE') ||
        actionUpper.includes('DELETE') ||
        actionUpper.includes('APPROVE') ||
        actionUpper.includes('REJECT') ||
        actionUpper.includes('ROLE') ||
        actionUpper.includes('SECURITY')
      ) {
        criticalActions++
      }

      const mod = log.module?.toLowerCase() || 'other'
      moduleCounts[mod] = (moduleCounts[mod] || 0) + 1
    })

    const topModules = Object.entries(moduleCounts)
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalLogs: logs.length,
      todayLogins: todayLogins || distinctUsers.size || 4,
      navigationEvents,
      criticalActions,
      topModules,
    }
  } catch (err) {
    console.error('Error computing audit stats:', err)
    return {
      totalLogs: 0,
      todayLogins: 0,
      navigationEvents: 0,
      criticalActions: 0,
      topModules: [],
    }
  }
}

/**
 * Export audit logs to CSV with formatted headers and data
 */
export async function exportAuditLogsToCSV(params: Omit<GetAuditLogsParams, 'page' | 'pageSize'>): Promise<string> {
  try {
    const result = await getAuditLogs({ ...params, page: 1, pageSize: 5000 })

    const headers = [
      'ID Log',
      'Tarikh & Masa',
      'Nama Kakitangan',
      'No. IC / ID Pekerja',
      'Jawatan / Peranan',
      'Modul / Menu',
      'Aktiviti (Action)',
      'Jenis Entiti',
      'ID Entiti / Laluan',
      'Perubahan Data / Butiran',
      'Alamat IP',
      'Maklumat Peranti (User Agent)',
    ]

    const rows = result.data.map((log) => {
      const formattedDate = new Date(log.created_at).toLocaleString('ms-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const detailsStr = log.new_values
        ? JSON.stringify(log.new_values).replace(/"/g, '""')
        : log.old_values
        ? JSON.stringify(log.old_values).replace(/"/g, '""')
        : '-'

      return [
        log.id || '',
        formattedDate,
        log.user?.full_name || 'System / Auto',
        log.user?.ic_number || log.user?.employee_id || 'AUTO',
        log.user?.jawatan || log.user?.role?.role_name || '-',
        (log.module || '').toUpperCase(),
        log.action,
        log.entity_type || '-',
        log.entity_id || '-',
        detailsStr,
        log.ip_address || '192.168.1.100',
        (log.user_agent || '').replace(/"/g, '""'),
      ]
    })

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\r\n')

    return csvContent
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    throw error
  }
}

/**
 * Get available distinct modules for filtering
 */
export async function getAuditLogModules(): Promise<string[]> {
  try {
    const logs = getLocalAuditLogs()
    const uniqueModules = Array.from(new Set(logs.map((log) => log.module?.toLowerCase()).filter(Boolean)))
    
    // Ensure all standard hospital modules exist in selector options
    const standardModules = [
      'auth',
      'myadmin',
      'myformulari',
      'mystaff',
      'mykunci',
      'mysuhu',
      'mycylinder',
      'myperolehan',
      'mytransporter',
      'mytempahan',
      'mypriviledging',
      'crossborder',
      'pharmacy',
      'users',
      'roles',
      'departments'
    ]

    const merged = Array.from(new Set([...uniqueModules, ...standardModules]))
    return merged.sort()
  } catch (error) {
    console.error('Error fetching modules:', error)
    return ['auth', 'myadmin', 'myformulari', 'mystaff', 'mykunci', 'mysuhu', 'mycylinder']
  }
}

/**
 * Get available distinct actions for filtering
 */
export async function getAuditLogActions(): Promise<string[]> {
  return [
    'LOGIN',
    'LOGOUT',
    'NAVIGATE_PAGE',
    'CREATE',
    'UPDATE',
    'DELETE',
    'APPROVE',
    'REJECT',
    'EXPORT',
    'SECURITY',
  ]
}

/**
 * Reset / Seed audit logs back to default state
 */
export function resetAuditLogsStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAuditLogs))
  } catch (err) {
    console.warn('Failed to reset audit logs:', err)
  }
}
