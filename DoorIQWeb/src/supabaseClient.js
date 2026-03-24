import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // This ensures the JWT is saved in the browser
    autoRefreshToken: true, // This prevents the "Invalid Refresh Token" error by fixing it automatically
    detectSessionInUrl: true
  }
})