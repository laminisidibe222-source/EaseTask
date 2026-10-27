import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug — open browser Console (F12) to see these values
console.log('🔍 VITE_SUPABASE_URL:', supabaseUrl || '❌ undefined')
console.log('🔍 VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ loaded' : '❌ undefined')

// Check: both exist AND URL is not a placeholder
export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project')
)

// Create client — if not configured, use empty object with safe dummy methods
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { auth: { signInWithPassword: async () => ({ error: null }), signUp: async () => ({ error: null }) } }