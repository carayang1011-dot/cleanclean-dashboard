import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project')) {
  console.error('❌ 請先在 .env.local 填入正確的 NEXT_PUBLIC_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)
const SEED_DIR = path.join(process.cwd(), '..', '團購儀表板NOTION', 'dashboard_spec', 'seed')

function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(SEED_DIR, filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true, trim: true, relax_quotes: true })
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

// 從 contact_log 抓首次邀約日
function parseFirstContactDate(contactLog: string | null): string | null {
  if (!contactLog) return null
  // 抓 M/D + 動詞（發信|敲|回覆|婉拒）
  const match = contactLog.match(/(\d{1,2})\/(\d{1,2})\s*(發信|敲|回覆|婉拒)/)
  if (!match) return null
  const month = parseInt(match[1])
  const day = parseInt(match[2])
  // 今日是 2026/4，月份 > 4 用 2025，否則用 2026
  const year = month > 4 ? 2025 : 2026
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

async function seedKols() {
  console.log('▶ 匯入 kols...')
  const rows = readCsv('kols.csv')
  const data = rows.map(r => ({
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
  }))
  const { error, count } = await supabase.from('kols').insert(data)
  if (error) { console.error('❌ kols:', error.message); return 0 }
  console.log(`✅ kols: ${data.length} 筆`)
  return data.length
}

async function seedProjects() {
  console.log('▶ 匯入 projects...')
  const rows = readCsv('projects.csv')
  const data = rows.map(r => ({
    name: r.name,
    type: toNullableStr(r.type),
    status: toNullableStr(r.status),
    stage: toNullableStr(r.stage),
    next_step: toNullableStr(r.next_step),
    owner: toNullableStr(r.owner),
    start_date: toNullableStr(r.start_date),
    end_date: toNullableStr(r.end_date),
  }))
  const { error } = await supabase.from('projects').insert(data)
  if (error) { console.error('❌ projects:', error.message); return 0 }
  console.log(`✅ projects: ${data.length} 筆`)
  return data.length
}

async function seedMonthlyStats() {
  console.log('▶ 匯入 monthly_stats...')
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
    }
  }).filter(r => !isNaN(r.month))
  const { error } = await supabase.from('monthly_stats').upsert(data)
  if (error) { console.error('❌ monthly_stats:', error.message); return 0 }
  console.log(`✅ monthly_stats: ${data.length} 筆`)
  return data.length
}

async function seedPodcasts() {
  console.log('▶ 匯入 podcasts...')
  const rows = readCsv('podcasts.csv')
  const data = rows.map(r => ({
    name: r.name,
    type: toNullableStr(r.type),
    status: toNullableStr(r.status),
    stage: toNullableStr(r.stage),
    next_step: toNullableStr(r.next_step),
    owner: toNullableStr(r.owner),
    start_date: toNullableStr(r.start_date),
    end_date: toNullableStr(r.end_date),
  }))
  const { error } = await supabase.from('podcasts').insert(data)
  if (error) { console.error('❌ podcasts:', error.message); return 0 }
  console.log(`✅ podcasts: ${data.length} 筆`)
  return data.length
}

async function seedEndorsers() {
  console.log('▶ 匯入 endorsers...')
  const rows = readCsv('endorsers.csv')
  const data = rows.map(r => ({
    name: r.name,
    recommender: toNullableStr(r.recommender),
    reason: toNullableStr(r.reason),
    followers: toNullableStr(r.followers),
    url: toNullableStr(r.url),
  }))
  const { error } = await supabase.from('endorsers').insert(data)
  if (error) { console.error('❌ endorsers:', error.message); return 0 }
  console.log(`✅ endorsers: ${data.length} 筆`)
  return data.length
}

async function seedInvitations() {
  console.log('▶ 匯入 invitations（357 筆，含 first_contact_date 解析）...')
  const rows = readCsv('invitations.csv')
  const BATCH = 50
  let total = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map(r => ({
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
    }))
    const { error } = await supabase.from('invitations').insert(batch)
    if (error) { console.error(`❌ invitations batch ${i}:`, error.message); continue }
    total += batch.length
    process.stdout.write(`\r  已匯入 ${total}/${rows.length} 筆`)
  }
  console.log(`\n✅ invitations: ${total} 筆`)
  return total
}

async function seedSettings() {
  console.log('▶ 更新 settings...')
  const summary = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'summary.json'), 'utf-8'))
  const monthlyTarget: Record<string, number> = {}
  for (let i = 1; i <= 6; i++) {
    const key = `${i}月`
    monthlyTarget[String(i)] = summary.monthly_target?.[key] ?? 420000
  }
  const { error } = await supabase.from('settings').upsert({
    id: 1,
    h1_target: summary.kpi?.h1_target ?? 2500000,
    monthly_target: monthlyTarget,
  })
  if (error) { console.error('❌ settings:', error.message); return }
  console.log('✅ settings 更新完成')
}

async function seedReports() {
  console.log('▶ 匯入初始報告（附錄 A）...')
  const reports = [
    {
      kind: 'weekly' as const,
      title: '2026/2/9~2/13 週報｜團購組｜阿芸',
      date: '2026-02-09',
      author: '阿芸',
      content: `## 上週工作重點、完成事項
(1) 專案/企劃：完成企劃提案會議、提案修改 1 篇及影片拍攝 1 部。「官網搬家」，發布搬家需求表並完成流程文案撰寫
(2) 社群：文案撰寫 3 篇（含官網搬家）、圖文排程 3 篇
(3) 會議與溝通：參與周會、月會、Shopline 團購會議，進行跨部門進度同步
(4) 團購：完成系統申請結團 4 團、KOL 結團報表 15 團、KOC 請款 15 位，並完成小赫訂單貨態查詢 118 筆
(5) 數據與行政：處理 Linktree 帳號救回與系統設定

## 本週預計進行內容
(1) 上半年團購計畫表(2/24 中午前完成)
(2) 團購表單系統結團 5 團
(3) 部門分頁規劃(2/25 中午前完成)
(4) 粉專封面+line@李仁新視覺更換+檢視各平台視覺是否皆已更新(2/26)

## 近況分享
Q1 目標業績：1,250,000；目前業績：**709,435 (56.75%)**；Q1 還需達成 NT$540,565
年度達成率 14.19%`,
    },
    {
      kind: 'weekly' as const,
      title: '2026/2/9~2/13 週報｜團購組｜Cara',
      date: '2026-02-09',
      author: 'Cara',
      content: `## 上週工作重點、完成事項
1. 與阿芸對焦後續 369 計劃內容
2. 創作者合作進度

### KOL 合作
- 李多慧 — 過合約中（3 月底 4 月初）
- 克拉克 — 完成合約，待腳本提供（3 月中）
- 鴨鴨 — 完成合約，待提供拍攝重點（4/28，導購母親節）

### KOC 合作（業配）
- 米娜（2 月底 3 月初）— 待初稿提供
- 采欣（4 月初）— 待合約回簽
- 三寶藥師 — 待回覆合作品項

### KOC 合作（團購）
- Vina（02/23–03/01）— 本日團購開跑
- 安可星球（03/09–03/17）— 腳本過稿中
- EmiLiA（3/18–3/24）— 待提供腳本

## 本週預計進行內容
- Follow up 各創作者進度
- 持續累積合作名單&邀約`,
    },
    {
      kind: 'monthly' as const,
      title: '2026/01 月報',
      date: '2026-01-31',
      author: '阿芸',
      attachment_url: 'https://www.canva.com/design/DAHAaEQ6hgE/ub2i4zGPubIcqWF0y7dTDA/edit',
      content: `## 成功點
1. **團數突破新高客單價持續拉高**：將各類團主集中在 1 月開團，在有業績的同時，也有 KOL 拍攝大掃除素材，讓更多人看見我們。
2. **除垢慕斯+家事皂銷售突破新高**：透過 KOL 強化 BA（Before/After）對比與「省時、安心」的訴求，有效帶動除垢慕斯與家事皂的交叉銷售。
3. **客單價持續拉高**：策略性移除低毛利、重物流負擔的箱購品項，但在「多瓶裝組合」策略帶動下，平均客單價逆勢成長至 NT$1,907（高於 2025 Q4 均值）。

## 阻礙與困難
1. 新團主前期醞釀不夠，粉絲下單偏保守
2. 外部經紀公司推薦之 KOL 表現不如預期，實際轉換效率與預估值落差過大
3. 牙膏（1%）與柔濕巾（3.3%）的銷售占比極低

## 下階段行動
1. 參考經銷模式，於開團前 1-2 週配置「試用包體驗」或「互動抽獎」
2. 預計於 3 月底前分階段結束合作，將行銷預算轉移至數據表現更穩定的 KOL
3. 未來可將牙膏與柔濕巾作為高價組合的贈品或滿額贈`,
    },
    {
      kind: 'monthly' as const,
      title: '2026/02 月報',
      date: '2026-02-28',
      author: '阿芸',
      content: `## 成功點
**一、回購團發揮穩盤作用，抵銷過年淡季衝擊**
2 月受過年長假影響，工作天數與開團數（7 團）皆不到 1 月的一半。但透過安排高黏著度的回購團（如森哥媽咪 NT$53,288、天兵媽與小元寶 NT$27,159），成功保持基本業績。

**二、精準拉高客單價，單筆貢獻度提升**
本月平均客單價 NT$2,084，高於 1 月 NT$1,907；部分團（天兵媽、Vina）客單甚至達 NT$2,400~2,700。

**三、核心產品（洗衣精）跨團表現強勁**
真濃縮洗衣精在 2 月仍是各團的銷售主力，總銷售額 NT$120,170。

## 阻礙與困難
一、新客首購門檻過高，造成成交率流失
二、目標達成進度放緩，下半年業績壓力增大
三、產品營收結構單一，缺乏第二營收支柱

## 下階段行動
1. 規劃「首購人氣商品組合」（家事達人組、首購旅行組），價格約 NT$990 左右僅限新開團使用
2. 採用「業配+折扣碼」的「微團購」模式，在空窗週次穿插 2-3 個合作
3. 針對不同屬性 KOL 量身打造除洗衣精以外的「必買理由」`,
    },
    {
      kind: 'meeting' as const,
      title: '2026/2/23 13:30-14:00｜BOSS 接洽名單 PASS',
      date: '2026-02-23',
      participants: ['BOSS', '阿芸', 'Cara'],
      content: `1. **方昶詠合作（業配）**：業配置入洗衣精、需寄產品；再製影片內容詢問
2. **捷安特旅遊（異業）**：與捷安特子公司合作單車旅遊；初步合作藍圖：贊助旅行組
3. **享餵（異業）**：母乳推廣機構；贊助 30 份媽媽禮（一季一次）；折扣碼 89 折（序號 BF870，排除絕版、首購、送禮組）`,
    },
    {
      kind: 'meeting' as const,
      title: '2026/3/26 15:00-15:40｜北訓合作對焦',
      date: '2026-03-26',
      participants: ['阿芸', 'Cara', '北訓'],
      content: `1. 每天提供 KOL 業績
2. 希望 KOL 皆為過往 5 萬業績以上
3. 先試跑 5 團；樣品提供 3 瓶
4. 檔期避開特別優惠
5. 對帳流程：20 天結團 → 報表 → 北訓開發票 → 淨淨匯款
6. KOL 合作流程：北訓提供名單 → 淨淨審核 → 樣品寄送 → 確認意願/檔期 → 素材拍攝 → 淨淨過稿
7. 合約為淨淨與北訓簽訂`,
    },
  ]

  const { error } = await supabase.from('reports').insert(reports as any)
  if (error) { console.error('❌ reports:', error.message); return }
  console.log(`✅ reports: ${reports.length} 筆`)
}

async function main() {
  console.log('🌱 開始匯入種子資料...\n')

  const results = {
    kols: await seedKols(),
    projects: await seedProjects(),
    monthly_stats: await seedMonthlyStats(),
    podcasts: await seedPodcasts(),
    endorsers: await seedEndorsers(),
    invitations: await seedInvitations(),
  }

  await seedSettings()
  await seedReports()

  console.log('\n📊 匯入結果摘要：')
  Object.entries(results).forEach(([k, v]) => {
    const expected: Record<string, number> = { kols: 55, projects: 31, monthly_stats: 6, podcasts: 5, endorsers: 8, invitations: 357 }
    const ok = v === expected[k]
    console.log(`  ${ok ? '✅' : '⚠️'} ${k}: ${v} 筆${ok ? '' : `（預期 ${expected[k]}）`}`)
  })
  console.log('\n🎉 完成！')
}

main().catch(err => { console.error(err); process.exit(1) })
