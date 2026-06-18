import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Types (you can expand these)
export type BodyLog = {
  id?: number
  user_id?: string
  date: string
  weight_kg: number
  bf: number
  ffmi?: number
  notes?: string | null
  source?: string
  created_at?: string
}

export type WithingsToken = {
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  scope?: string
  last_synced?: string | null
}