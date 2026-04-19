export type Kol = {
  id: string
  name: string
  level: string | null
  platform: string | null
  category: string | null
  start_date: string | null
  end_date: string | null
  status: string | null
  note: string | null
  followers: string | null
  orders: number | null
  revenue: number | null
  aov: number | null
  commission_rate: number | null
  commission_amount: number | null
  contact_owner: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export type Project = {
  id: string
  name: string
  type: string | null
  status: string | null
  stage: string | null
  next_step: string | null
  owner: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export type MonthlyStat = {
  month: number
  big_host_actual: number | null
  big_host_target: number
  small_host_actual: number | null
  small_host_target: number
  month_achieved: boolean | null
  updated_at: string
  updated_by: string | null
}

export type Podcast = {
  id: string
  name: string
  type: string | null
  status: string | null
  stage: string | null
  next_step: string | null
  owner: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export type Endorser = {
  id: string
  name: string
  recommender: string | null
  reason: string | null
  followers: string | null
  url: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export type Invitation = {
  id: string
  owner: string
  status: string | null
  type: string | null
  name: string
  followers: string | null
  url: string | null
  ig_url: string | null
  fb_url: string | null
  product: string | null
  contact_log: string | null
  quote: string | null
  final_spec: string | null
  ad_authorization: string | null
  note: string | null
  shipping_info: string | null
  gift: string | null
  schedule: string | null
  first_contact_date: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export type Report = {
  id: string
  kind: 'weekly' | 'monthly' | 'meeting'
  title: string
  content: string | null
  date: string | null
  participants: string[] | null
  attachment_url: string | null
  author: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export type Settings = {
  id: number
  h1_target: number
  monthly_target: Record<string, number>
  updated_at: string
}

export type Dimension = {
  dimension: string
  target: number
  done: number
  todo: number
  rate: string
}

export type HistoryRecord = {
  id: string
  source: string | null
  paid: string | null
  collab_type: string | null
  level: string | null
  year: number | null
  start_date: string | null
  end_date: string | null
  creator: string
  platform: string | null
  url: string | null
  product: string | null
  system: string | null
  material: string | null
  owner: string | null
  status: string | null
  discount: string | null
  commission_rate: number | null
  fee_pretax: number | null
  fee_tax: number | null
  orders: number | null
  revenue: number | null
  commission_amount: number | null
  aov: number | null
  ad_auth: string | null
  note: string | null
  shipping_info: string | null
  transfer_info: string | null
  transfer_amount: number | null
  payment_date: string | null
  tax_receipt: string | null
  transfer_note: string | null
}

export const HISTORY_COLLAB_TYPES = ['團購分潤', '純業配'] as const
export const HISTORY_OWNERS = ['Cara', 'Cara&阿芸', 'Peggy', 'Tilly', '媛媛', '戴戴', '跳跳', '阿芸', '默默'] as const
export const HISTORY_STATUSES = ['已完成', '進行中', '廣告中', '結團中', '產品已寄出', '確認可合作', '表單已建置', '表單未建置', '邀約中', '審文｜審片中', '暫不合作'] as const
export const HISTORY_SYSTEMS = ['官網', 'AMA', 'Shopline', '優惠代碼', '團購表單'] as const
export const HISTORY_YEARS = [2023, 2024, 2025, 2026] as const

export const OPERATORS = ['Cara', 'Yun'] as const
export type Operator = typeof OPERATORS[number]

export const KOL_LEVELS = ['核心型', '入門級', '業配', 'Podcast'] as const
export const KOL_PLATFORMS = ['Instagram', 'LINE', 'Facebook', 'YouTube', '其他'] as const
export const KOL_STATUSES = ['已完成', '表單已建置', '表單未建置', '結團中', '廣告中'] as const

export const PROJECT_TYPES = ['業配合作', '團購合作', '異業合作', '置入合作', 'DAI廣告', '專訪合作'] as const
export const PROJECT_STATUSES = ['執行中', '待處理', '已結案'] as const
export const PROJECT_STAGES = ['洽談中', '合作確認（條件定案）', '素材／資源準備（含寄樣、文案、表單）', '上線執行（開團／曝光中）', '結案回報'] as const

export const INVITATION_STATUSES = ['是', '否', '待考慮', '婉拒', '未回', '未發', '無回應', '已發等回'] as const
export const INVITATION_TYPES = ['團購', '業配', '互惠'] as const
export const INVITATION_OWNERS = ['Cara', '阿芸', '圓圓', '戴戴', 'Tilly'] as const
export const INVITATION_PRODUCTS = ['真濃縮洗衣精', '除垢慕斯', '食器清潔皂', '家事皂', '柔濕巾', '牙膏', '潔顏慕斯', '沐浴慕斯', '淨潤膚', '剋菌液', '其他'] as const
