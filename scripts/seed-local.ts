import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'

const SEED_DIR = path.join(process.cwd(), '..', '團購儀表板NOTION', 'dashboard_spec', 'seed')
const DATA_DIR = path.join(process.cwd(), 'src', 'local-data')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const now = new Date().toISOString()

function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(SEED_DIR, filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true, trim: true, relax_quotes: true })
}

function save(table: string, rows: any[]) {
  fs.writeFileSync(path.join(DATA_DIR, `${table}.json`), JSON.stringify(rows, null, 2))
}

function toNullableNum(v: string | undefined): number | null {
  if (!v || v.trim() === '') return null
  const n = parseFloat(v.replace(/,/g, ''))
  return isNaN(n) ? null : n
}

function toNullableStr(v: string | undefined): string | null {
  if (!v || v.trim() === '') return null
  return v.trim()
}

function parseFirstContactDate(contactLog: string | null): string | null {
  if (!contactLog) return null
  const match = contactLog.match(/(\d{1,2})\/(\d{1,2})\s*(發信|敲|回覆|婉拒)/)
  if (!match) return null
  const month = parseInt(match[1])
  const day = parseInt(match[2])
  const year = month > 4 ? 2025 : 2026
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function seedKols() {
  console.log('▶ kols...')
  const rows = readCsv('kols.csv')
  const data = rows.map(r => ({
    id: randomUUID(), created_at: now, updated_at: now,
    name: r.name,
    level: toNullableStr(r.level),
    platform: toNullableStr(r.platform),
    category: toNullableStr(r.category) ?? '居家清潔',
    start_date: toNullableStr(r.start_date),
    end_date: toNullableStr(r.end_date),
    status: toNullableStr(r.status),
    note: toNullableStr(r.note),
    followers: toNullableStr(r.followers),
    orders: r.orders ? parseInt(r.orders) || null : null,
    revenue: toNullableNum(r.revenue),
    aov: toNullableNum(r.aov),
    commission_rate: toNullableNum(r.commission_rate),
    commission_amount: toNullableNum(r.commission_amount),
    contact_owner: toNullableStr(r.contact_owner),
    updated_by: null,
  }))
  save('kols', data)
  console.log(`✅ kols: ${data.length} 筆`)
  return data.length
}

function seedProjects() {
  console.log('▶ projects...')
  const rows = readCsv('projects.csv')
  const data = rows.map(r => ({
    id: randomUUID(), created_at: now, updated_at: now,
    name: r.name,
    type: toNullableStr(r.type),
    status: toNullableStr(r.status),
    stage: toNullableStr(r.stage),
    next_step: toNullableStr(r.next_step),
    owner: toNullableStr(r.owner),
    start_date: toNullableStr(r.start_date),
    end_date: toNullableStr(r.end_date),
    updated_by: null,
  }))
  save('projects', data)
  console.log(`✅ projects: ${data.length} 筆`)
  return data.length
}

function seedMonthlyStats() {
  console.log('▶ monthly_stats...')
  const rows = readCsv('monthly_stats.csv')
  const data = rows.map(r => {
    const monthStr = r.month ?? r['月份'] ?? ''
    const month = parseInt(monthStr.replace('月', ''))
    return {
      month,
      big_host_actual: r.big_host_actual ? parseInt(r.big_host_actual) || null : null,
      big_host_target: 3,
      small_host_actual: r.small_host_actual ? parseInt(r.small_host_actual) || null : null,
      small_host_target: 3,
      month_achieved: r.month_achieved === 'Yes' || r.month_achieved === 'true',
      updated_at: now,
      updated_by: null,
    }
  }).filter(r => !isNaN(r.month))
  save('monthly_stats', data)
  console.log(`✅ monthly_stats: ${data.length} 筆`)
  return data.length
}

function seedPodcasts() {
  console.log('▶ podcasts...')
  const rows = readCsv('podcasts.csv')
  const data = rows.map(r => ({
    id: randomUUID(), created_at: now, updated_at: now,
    name: r.name,
    type: toNullableStr(r.type),
    status: toNullableStr(r.status),
    stage: toNullableStr(r.stage),
    next_step: toNullableStr(r.next_step),
    owner: toNullableStr(r.owner),
    start_date: toNullableStr(r.start_date),
    end_date: toNullableStr(r.end_date),
    updated_by: null,
  }))
  save('podcasts', data)
  console.log(`✅ podcasts: ${data.length} 筆`)
  return data.length
}

function seedEndorsers() {
  console.log('▶ endorsers...')
  const rows = readCsv('endorsers.csv')
  const data = rows.map(r => ({
    id: randomUUID(), created_at: now, updated_at: now,
    name: r.name,
    recommender: toNullableStr(r.recommender),
    reason: toNullableStr(r.reason),
    followers: toNullableStr(r.followers),
    url: toNullableStr(r.url),
    updated_by: null,
  }))
  save('endorsers', data)
  console.log(`✅ endorsers: ${data.length} 筆`)
  return data.length
}

function seedInvitations() {
  console.log('▶ invitations...')
  const rows = readCsv('invitations.csv')
  const data = rows.map(r => ({
    id: randomUUID(), created_at: now, updated_at: now,
    owner: r.owner || '未知',
    status: toNullableStr(r.status),
    type: toNullableStr(r.type),
    name: r.name || '（未命名）',
    followers: toNullableStr(r.followers),
    url: toNullableStr(r.url),
    ig_url: toNullableStr(r.ig_url),
    fb_url: toNullableStr(r.fb_url),
    product: toNullableStr(r.product),
    contact_log: toNullableStr(r.contact_log),
    quote: toNullableStr(r.quote),
    final_spec: toNullableStr(r.final_spec),
    ad_authorization: toNullableStr(r.ad_authorization),
    note: toNullableStr(r.note),
    shipping_info: toNullableStr(r.shipping_info),
    gift: toNullableStr(r.gift),
    schedule: toNullableStr(r.schedule),
    first_contact_date: parseFirstContactDate(toNullableStr(r.contact_log)),
    updated_by: null,
  }))
  save('invitations', data)
  console.log(`✅ invitations: ${data.length} 筆`)
  return data.length
}

function seedSettings() {
  console.log('▶ settings...')
  const summary = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'summary.json'), 'utf-8'))
  const monthly_target: Record<string, number> = {}
  for (let i = 1; i <= 6; i++) {
    monthly_target[String(i)] = summary.monthly_target?.[`${i}月`] ?? 420000
  }
  save('settings', [{
    id: 1,
    h1_target: summary.kpi?.h1_target ?? 2500000,
    monthly_target,
    updated_at: now,
  }])
  console.log('✅ settings')
}

function seedReports() {
  console.log('▶ reports...')
  const reports = [
    { kind: 'weekly', title: '2026/2/9~2/13 週報｜團購組｜阿芸', date: '2026-02-09', author: '阿芸',
      content: `## 上週工作重點、完成事項\n(1) 完成企劃提案會議、提案修改 1 篇及影片拍攝 1 部\n(2) 社群：文案撰寫 3 篇\n(3) 會議與溝通：參與周會、月會、Shopline 團購會議\n(4) 團購：完成系統申請結團 4 團、KOL 結團報表 15 團\n\n## 本週預計進行內容\n(1) 上半年團購計畫表\n(2) 團購表單系統結團 5 團\n\n## 近況分享\nQ1 目標業績：1,250,000；目前業績：**709,435 (56.75%)**` },
    { kind: 'weekly', title: '2026/2/9~2/13 週報｜團購組｜Cara', date: '2026-02-09', author: 'Cara',
      content: `## 上週工作重點\n1. 與阿芸對焦後續 369 計劃內容\n2. 創作者合作進度\n\n### KOL 合作\n- 李多慧 — 過合約中（3 月底 4 月初）\n- 克拉克 — 完成合約，待腳本提供（3 月中）` },
    { kind: 'monthly', title: '2026/01 月報', date: '2026-01-31', author: '阿芸',
      attachment_url: 'https://www.canva.com/design/DAHAaEQ6hgE/ub2i4zGPubIcqWF0y7dTDA/edit',
      content: `## 成功點\n1. **團數突破新高客單價持續拉高**\n2. **除垢慕斯+家事皂銷售突破新高**\n3. **客單價持續拉高**\n\n## 阻礙\n1. 新團主前期醞釀不夠\n2. 外部經紀公司推薦之 KOL 表現不如預期` },
    { kind: 'monthly', title: '2026/02 月報', date: '2026-02-28', author: '阿芸',
      content: `## 成功點\n**一、回購團發揮穩盤作用**\n**二、精準拉高客單價**：本月平均客單價 NT$2,084\n**三、核心產品（洗衣精）跨團表現強勁**` },
    { kind: 'meeting', title: '2026/2/23 13:30-14:00｜BOSS 接洽名單 PASS', date: '2026-02-23',
      participants: ['BOSS', '阿芸', 'Cara'],
      content: `1. **方昶詠合作（業配）**：業配置入洗衣精\n2. **捷安特旅遊（異業）**：贊助旅行組\n3. **享餵（異業）**：贊助 30 份媽媽禮` },
    { kind: 'meeting', title: '2026/3/26 15:00-15:40｜北訓合作對焦', date: '2026-03-26',
      participants: ['阿芸', 'Cara', '北訓'],
      content: `1. 每天提供 KOL 業績\n2. 先試跑 5 團\n3. 對帳流程：20 天結團 → 報表 → 北訓開發票 → 淨淨匯款` },
  ]
  const data = reports.map(r => ({ id: randomUUID(), created_at: now, updated_at: now, updated_by: null, participants: null, attachment_url: null, ...r }))
  save('reports', data)
  console.log(`✅ reports: ${data.length} 筆`)
}

console.log('🌱 開始匯入種子資料...\n')
const counts = {
  kols: seedKols(),
  projects: seedProjects(),
  monthly_stats: seedMonthlyStats(),
  podcasts: seedPodcasts(),
  endorsers: seedEndorsers(),
  invitations: seedInvitations(),
}
seedSettings()
seedReports()

const expected: Record<string, number> = { kols: 55, projects: 31, monthly_stats: 6, podcasts: 5, endorsers: 8, invitations: 357 }
console.log('\n📊 結果：')
Object.entries(counts).forEach(([k, v]) => {
  const ok = v === expected[k]
  console.log(`  ${ok ? '✅' : '⚠️ '} ${k}: ${v}${ok ? '' : ` (預期 ${expected[k]})`}`)
})
console.log('\n🎉 完成！資料已寫入 local-data/')
