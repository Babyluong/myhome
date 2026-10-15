import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createAdminUserOpsHandler } from './handler.ts'
const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
serve(url && key ? createAdminUserOpsHandler(createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })) : () => new Response(JSON.stringify({ error: 'Server configuration unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } }))
