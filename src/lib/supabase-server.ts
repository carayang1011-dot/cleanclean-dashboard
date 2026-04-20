import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { createLocalClient } from './local-db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const isPlaceholder = !supabaseUrl || supabaseUrl.includes('your-project')

// 生產環境必須使用 Service Role Key，避免 anon key 繞過 RLS
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!isPlaceholder && !serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required when Supabase is configured')
}

// Server-side only client: uses local JSON-file DB when Supabase credentials are not yet configured
export const db = isPlaceholder
  ? (createLocalClient() as any)
  : createClient(supabaseUrl, serviceKey!)
