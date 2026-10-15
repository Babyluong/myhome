import { createClient } from '@supabase/supabase-js'
import { offlineSafeFetch } from './offlineFetch'
import { restoreOfflineIdentity, rememberOfflineIdentity, clearOfflineIdentity, getOfflineGeneration, setOfflineSessionContext, isOfflineSessionRevoked } from './offlineSession'

// For local development without Supabase, we'll use mock data
// When ready to connect, add your Supabase URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'home-auth-session-v2',
  },
  global: {
    fetch: offlineSafeFetch,
  },
})

supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) { clearOfflineIdentity(); setOfflineSessionContext(null); return }
  let currentSessionId: string | null = null
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof payload.session_id === 'string') currentSessionId = payload.session_id
  } catch { /* Malformed sessions cannot select an offline cache. */ }
  if (!currentSessionId) { clearOfflineIdentity(); return }
  setOfflineSessionContext(currentSessionId)
  if (isOfflineSessionRevoked(currentSessionId)) return
  restoreOfflineIdentity(session.user.id)
  const generation = getOfflineGeneration()
  if (session) setTimeout(() => {
    void (async () => {
      try {
        // POST verification cannot be served by legacy service-worker GET caches.
        const { data: profiles, error: identityError } = await supabase.rpc('get_my_offline_identity').setHeader('Authorization', `Bearer ${session.access_token}`)
        const { data: current } = await supabase.auth.getSession()
        if (current.session?.user.id !== session.user.id || generation !== getOfflineGeneration() || isOfflineSessionRevoked(currentSessionId!)) return
        if (!identityError && Array.isArray(profiles) && profiles.length === 1 && profiles[0].actor_id === session.user.id && profiles[0].status === 'active') {
          rememberOfflineIdentity({ actorId: session.user.id, hospitalId: profiles[0].hospital_id }, (session.expires_at || 0) * 1000)
        } else if (!identityError || ['PGRST301','PGRST302','42501'].includes(identityError.code)) clearOfflineIdentity()
      } catch { /* A transport failure never renews the previously verified scope. */ }
    })()
  }, 0)
})

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return (
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key'
  )
}

// Helper to get storage bucket URL
export const getStorageUrl = (bucket: string, path: string): string => {
  if (!isSupabaseConfigured()) return ''
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

// Helper to upload file to storage
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    // For local development, return a placeholder URL
    return { url: URL.createObjectURL(file), error: null }
  }

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      // Check if it's a bucket not found error
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        throw new Error(`Storage bucket '${bucket}' does not exist. Please create it in Supabase Dashboard → Storage → New Bucket.`)
      }
      throw uploadError
    }

    const url = getStorageUrl(bucket, path)
    return { url, error: null }
  } catch {
    return { url: null, error: 'File upload failed' }
  }
}

// Helper to delete file from storage
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    return { success: true, error: null }
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Failed to delete file' }
  }
}

// Create a dedicated anonymous client for public operations (no session persistence)
// This ensures we always use the anon role for public form submissions
// Using a singleton pattern to avoid multiple GoTrueClient instances
let anonymousClientInstance: ReturnType<typeof createClient> | null = null

export const createAnonymousClient = () => {
  if (!isSupabaseConfigured()) {
    return supabase // Fallback to main client if not configured
  }
  
  // Return singleton instance if already created
  if (anonymousClientInstance) {
    return anonymousClientInstance
  }
  
  // Create new instance with unique storage key to avoid conflicts
  anonymousClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storageKey: 'supabase.anonymous.auth.token', // Unique storage key to avoid conflicts
    },
    global: {
      fetch: offlineSafeFetch,
    },
  })
  
  return anonymousClientInstance
}

export default supabase

