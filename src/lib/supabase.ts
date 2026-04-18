import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 前端 / 客戶端元件用（anon key）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server Action / seed 腳本用（service_role key，僅 server 端）
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey
  return createClient(supabaseUrl, serviceKey)
}
