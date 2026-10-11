// @ts-nocheck
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import { 
  CURRENT_SYSTEM_VERSION, 
  BUILD_COMMIT_HASH, 
  BUILD_TIMESTAMP, 
  RECENT_GIT_COMMITS, 
  SYSTEM_RELEASES 
} from '@/config/systemReleases'

export { CURRENT_SYSTEM_VERSION, BUILD_COMMIT_HASH, BUILD_TIMESTAMP, RECENT_GIT_COMMITS, SYSTEM_RELEASES }

export type SystemAnnouncementType = 'maintenance' | 'system_update' | 'advisory' | 'incident'
export type SystemAnnouncementSeverity = 'info' | 'warning' | 'critical' | 'urgent'
export type SystemAnnouncementStatus = 'draft' | 'published' | 'resolved' | 'archived'

export interface SystemAnnouncement {
  id: string
  title: string
  content: string
  type: SystemAnnouncementType
  severity: SystemAnnouncementSeverity
  status: SystemAnnouncementStatus
  scheduled_start: string | null
  scheduled_end: string | null
  version_tag: string | null
  affected_modules: string[]
  created_by: string | null
  created_by_name: string | null
  is_active: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateAnnouncementInput {
  title: string
  content: string
  type: SystemAnnouncementType
  severity: SystemAnnouncementSeverity
  scheduled_start?: string | null
  scheduled_end?: string | null
  version_tag?: string | null
  affected_modules?: string[]
  created_by?: string | null
  created_by_name?: string | null
  is_active?: boolean
  enable_maintenance_mode?: boolean
}

export interface GitCommitRecord {
  hash: string
  shortHash: string
  author: string
  date: string
  message: string
}

export interface DeploymentMetadata {
  version: string
  buildTime: string
  commitHash: string
  branch: string
  latestCommitDate?: string
  latestCommitMessage?: string
  recentCommits: GitCommitRecord[]
}

/**
 * Background auto-sync helper:
 * Guarantees that built-in releases deployed with production bundles
 * are automatically registered in the live Supabase database.
 */
let isAutoSyncing = false
async function autoSyncMissingReleasesToSupabase(missingReleases: SystemAnnouncement[]) {
  if (isAutoSyncing || !isSupabaseConfigured() || missingReleases.length === 0) return
  isAutoSyncing = true

  try {
    for (const release of missingReleases) {
      const { error } = await supabase
        .from('system_announcements')
        .insert({
          title: release.title,
          content: release.content,
          type: release.type,
          severity: release.severity,
          status: release.status,
          scheduled_start: release.scheduled_start,
          scheduled_end: release.scheduled_end,
          version_tag: release.version_tag,
          affected_modules: release.affected_modules,
          created_by: null,
          created_by_name: release.created_by_name || 'H.O.M.E. System Administrator',
          is_active: release.is_active,
          metadata: release.metadata || {},
          created_at: release.created_at || new Date().toISOString(),
          updated_at: release.updated_at || new Date().toISOString()
        })

      if (error) {
        console.warn(`[AutoSync] Could not sync release ${release.version_tag} to Supabase:`, error.message)
      } else {
        console.info(`[AutoSync] Successfully synced release ${release.version_tag} to live Supabase database`)
      }
    }
  } catch (err) {
    console.warn('[AutoSync] Error during background Supabase release sync:', err)
  } finally {
    isAutoSyncing = false
  }
}

/**
 * Fetch all active announcements (Published and active)
 * Real database query complying with Zero-Mock mandate merged with release registry
 */
export async function getActiveAnnouncements(): Promise<SystemAnnouncement[]> {
  try {
    let dbAnnouncements: SystemAnnouncement[] = []

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'published')
        .is('version_tag', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Error fetching active announcements:', error.message)
      } else if (data) {
        dbAnnouncements = data as SystemAnnouncement[]
      }
    }

    return dbAnnouncements
  } catch (err) {
    console.error('Failed to get active announcements:', err)
    return []
  }
}

/**
 * Fetch system update logs and changelogs for users
 * Merges Supabase records with codebase system release history
 */
export async function getSystemUpdateLogs(): Promise<SystemAnnouncement[]> {
  try {
    let dbLogs: SystemAnnouncement[] = []

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .in('type', ['system_update', 'maintenance'])
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Error fetching system update logs:', error.message)
      } else if (data) {
        // Exclude obsolete build-* tags and normalize content/author
        dbLogs = (data as SystemAnnouncement[])
          .filter(l => !l.version_tag?.toLowerCase().startsWith('build-'))
          .map(l => ({
            ...l,
            content: l.content?.replace(/\(Lawas@2025\)/gi, '')?.replace(/Lawas@2025/gi, 'H.O.M.E. System Administrator'),
            created_by_name: (!l.created_by_name || l.created_by_name.includes('CI/CD') || l.created_by_name.includes('Lawas'))
              ? 'H.O.M.E. System Administrator'
              : l.created_by_name
          }))
      }
    }

    // Deduplicate: If an item exists in database with matching version_tag or title, keep database record
    const existingVersions = new Set(dbLogs.map(l => l.version_tag).filter(Boolean))
    const existingTitles = new Set(dbLogs.map(l => l.title.trim().toLowerCase()))

    // 2. Read live deployment manifest from /version.json
    let liveReleases: SystemAnnouncement[] = []
    try {
      const meta = await getLiveDeploymentMetadata()
      if (meta?.releases && Array.isArray(meta.releases)) {
        liveReleases = meta.releases as SystemAnnouncement[]
      }
    } catch (e) {
      // ignore
    }

    // Merge both live deployment releases and bundled releases
    const candidateReleases = [...liveReleases, ...SYSTEM_RELEASES]
    const supplementalReleases: SystemAnnouncement[] = []
    const seenTitles = new Set<string>()

    for (const rel of candidateReleases) {
      if (!rel.title) continue
      const titleKey = rel.title.trim().toLowerCase()
      const versionKey = rel.version_tag || ''
      if (seenTitles.has(titleKey)) continue
      seenTitles.add(titleKey)

      const isKnownInDb = (versionKey && existingVersions.has(versionKey)) || existingTitles.has(titleKey)
      if (!isKnownInDb) {
        supplementalReleases.push(rel)
      }
    }

    if (supplementalReleases.length > 0 && isSupabaseConfigured()) {
      void autoSyncMissingReleasesToSupabase(supplementalReleases)
    }

    const allLogs = [...dbLogs, ...supplementalReleases]
    allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return allLogs
  } catch (err) {
    console.error('Failed to get update logs:', err)
    return SYSTEM_RELEASES
  }
}

/**
 * Fetch latest live deployment metadata and production git commits
 */
export async function getLiveDeploymentMetadata(): Promise<DeploymentMetadata> {
  try {
    // 1. Fetch public/version.json with cache buster query
    const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      return data as DeploymentMetadata
    }
  } catch (e) {
    // fallback to static build info
  }

  return {
    version: CURRENT_SYSTEM_VERSION,
    buildTime: BUILD_TIMESTAMP,
    commitHash: BUILD_COMMIT_HASH,
    branch: 'refactor/module-folders',
    recentCommits: RECENT_GIT_COMMITS || []
  }
}

/**
 * Fetch recent production commits directly from deployment metadata or GitHub API
 */
export async function getRecentProductionCommits(): Promise<GitCommitRecord[]> {
  try {
    const meta = await getLiveDeploymentMetadata()
    if (meta.recentCommits && meta.recentCommits.length > 0) {
      return meta.recentCommits
    }

    // Secondary live query: GitHub REST API (public repo)
    const ghRes = await fetch(
      'https://api.github.com/repos/ehslawas/hospital-operation-management-ecosystem/commits?sha=refactor/module-folders&per_page=15',
      { headers: { Accept: 'application/vnd.github.v3+json' }, cache: 'no-cache' }
    )
    if (ghRes.ok) {
      const ghData = await ghRes.json()
      return ghData.map((item: any) => {
        const rawAuthor = item.commit?.author?.name || ''
        const cleanAuthor = (!rawAuthor || rawAuthor.toLowerCase().includes('lawas') || rawAuthor.toLowerCase().includes('ci/cd'))
          ? 'H.O.M.E. System Administrator'
          : rawAuthor
        return {
          hash: item.sha,
          shortHash: item.sha.slice(0, 7),
          author: cleanAuthor,
          date: item.commit.author.date,
          message: item.commit.message.split('\n')[0]
        }
      })
    }
  } catch (err) {
    console.warn('Could not fetch live git commits:', err)
  }

  return RECENT_GIT_COMMITS || []
}

/**
 * Fetch all announcements for administrative management
 */
export async function getAllAnnouncements(): Promise<SystemAnnouncement[]> {
  try {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
      .from('system_announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching all announcements:', error.message)
      return []
    }

    return (data || []) as SystemAnnouncement[]
  } catch (err) {
    console.error('Failed to get all announcements:', err)
    return []
  }
}

/**
 * Create and broadcast a new announcement (Admin Only)
 */
export async function createAnnouncement(input: CreateAnnouncementInput): Promise<SystemAnnouncement | null> {
  try {
    if (!isSupabaseConfigured()) return null

    const record = {
      title: input.title.trim(),
      content: input.content.trim(),
      type: input.type,
      severity: input.severity,
      status: 'published',
      scheduled_start: input.scheduled_start || null,
      scheduled_end: input.scheduled_end || null,
      version_tag: input.version_tag?.trim() || null,
      affected_modules: input.affected_modules || ['All Modules'],
      created_by: input.created_by || null,
      created_by_name: input.created_by_name || 'H.O.M.E. System Administrator',
      is_active: input.is_active !== undefined ? input.is_active : true,
    }

    const { data, error } = await supabase
      .from('system_announcements')
      .insert(record)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating announcement:', error)
      throw error
    }

    return data as SystemAnnouncement
  } catch (err) {
    console.error('Failed to create announcement:', err)
    throw err
  }
}

/**
 * Update an announcement (e.g. resolve, archive, toggle status)
 */
export async function updateAnnouncement(
  id: string,
  updates: Partial<SystemAnnouncement>
): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) return false

    const { error } = await supabase
      .from('system_announcements')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating announcement:', error)
      throw error
    }

    // If resolving a maintenance announcement, check if system_settings maintenance_mode should be turned off
    if (updates.status === 'resolved' || updates.is_active === false) {
      try {
        const { data: remainingActive } = await supabase
          .from('system_announcements')
          .select('id')
          .eq('type', 'maintenance')
          .eq('is_active', true)
          .eq('status', 'published')

        if (!remainingActive || remainingActive.length === 0) {
          await supabase
            .from('system_settings')
            .update({
              maintenance_mode: false,
              maintenance_message: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', 'system-settings')
        }
      } catch (settingsErr) {
        console.warn('Could not reset maintenance mode in system_settings:', settingsErr)
      }
    }

    return true
  } catch (err) {
    console.error('Failed to update announcement:', err)
    throw err
  }
}

/**
 * Delete an announcement permanently
 */
export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) return false

    const { error } = await supabase
      .from('system_announcements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting announcement:', error)
      throw error
    }

    return true
  } catch (err) {
    console.error('Failed to delete announcement:', err)
    throw err
  }
}

/**
 * Subscribe to realtime announcement updates
 */
export function subscribeToAnnouncements(onUpdate: () => void): () => void {
  try {
    const channel = supabase
      .channel('public:system_announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_announcements' },
        () => {
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  } catch (err) {
    console.warn('Could not subscribe to realtime announcements:', err)
    return () => {}
  }
}

/**
 * Live Sync: Check deployment metadata, verify latest releases against Supabase,
 * and auto-heal missing release announcements.
 */
export async function syncLiveProductionReleases(): Promise<{
  logs: SystemAnnouncement[]
  commits: GitCommitRecord[]
  metadata: DeploymentMetadata
}> {
  const metadata = await getLiveDeploymentMetadata()
  const [logs, commits] = await Promise.all([
    getSystemUpdateLogs(),
    getRecentProductionCommits()
  ])
  return { logs, commits, metadata }
}

