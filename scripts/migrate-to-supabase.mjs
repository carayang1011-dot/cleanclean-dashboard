// Usage: node scripts/migrate-to-supabase.mjs
// Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'local-data')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || url.includes('your-project') || !key || key.includes('your-')) {
  console.error('❌ 請先設定 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 環境變數')
  process.exit(1)
}

const supabase = createClient(url, key)

const tables = ['kols', 'invitations', 'endorsers', 'projects', 'podcasts', 'reports', 'monthly_stats', 'settings']

for (const table of tables) {
  try {
    const raw = JSON.parse(readFileSync(join(dataDir, `${table}.json`), 'utf-8'))
    const rows = Array.isArray(raw) ? raw : [raw]
    if (!rows.length) { console.log(`⚠️  ${table}: 空的，跳過`); continue }

    const pk = table === 'monthly_stats' ? 'month' : 'id'
    const { error } = await supabase.from(table).upsert(rows, { onConflict: pk })
    if (error) {
      console.error(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: 匯入 ${rows.length} 筆`)
    }
  } catch (e) {
    console.error(`❌ ${table}: ${e.message}`)
  }
}

console.log('\n完成！')
