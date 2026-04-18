import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { createLocalClient } from './local-db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const isPlaceholder = !supabaseUrl || supabaseUrl.includes('your-project')

// Server-side only client: uses local JSON-file DB when Supabase credentials are not yet configured
export const db = isPlaceholder
  ? (createLocalClient() as any)
  : createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey)
