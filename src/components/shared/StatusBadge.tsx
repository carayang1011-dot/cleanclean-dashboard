import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// 邀約狀態徽章
export function InvitationStatusBadge({ status }: { status: string | null }) {
  const colorMap: Record<string, string> = {
    '是': 'bg-green-100 text-green-700 border-green-200',
    '否': 'bg-gray-100 text-gray-500 border-gray-200',
    '待考慮': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '婉拒': 'bg-red-100 text-red-600 border-red-200',
    '未回': 'bg-slate-100 text-slate-500 border-slate-200',
    '未發': 'bg-slate-100 text-slate-500 border-slate-200',
    '無回應': 'bg-slate-100 text-slate-500 border-slate-200',
    '已發等回': 'bg-blue-100 text-blue-600 border-blue-200',
  }
  const cls = colorMap[status ?? ''] ?? 'bg-gray-100 text-gray-500 border-gray-200'
  return <Badge variant="outline" className={cn('text-xs rounded-lg', cls)}>{status ?? '—'}</Badge>
}

// KOL 狀態徽章
export function KolStatusBadge({ status }: { status: string | null }) {
  const colorMap: Record<string, string> = {
    '已完成': 'bg-green-100 text-green-700 border-green-200',
    '廣告中': 'bg-blue-100 text-blue-700 border-blue-200',
    '結團中': 'bg-orange-100 text-orange-700 border-orange-200',
    '表單已建置': 'bg-purple-100 text-purple-700 border-purple-200',
    '表單未建置': 'bg-gray-100 text-gray-500 border-gray-200',
  }
  const cls = colorMap[status ?? ''] ?? 'bg-gray-100 text-gray-500 border-gray-200'
  return <Badge variant="outline" className={cn('text-xs rounded-lg', cls)}>{status ?? '—'}</Badge>
}

// 合作類型徽章
export function ProjectTypeBadge({ type }: { type: string | null }) {
  const colorMap: Record<string, string> = {
    '業配合作': 'bg-blue-100 text-blue-700 border-blue-200',
    '團購合作': 'bg-pink-100 text-pink-700 border-pink-200',
    '異業合作': 'bg-purple-100 text-purple-700 border-purple-200',
    '置入合作': 'bg-green-100 text-green-700 border-green-200',
    'DAI廣告': 'bg-orange-100 text-orange-700 border-orange-200',
    '專訪合作': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  }
  const cls = colorMap[type ?? ''] ?? 'bg-gray-100 text-gray-500 border-gray-200'
  return <Badge variant="outline" className={cn('text-xs rounded-lg', cls)}>{type ?? '—'}</Badge>
}

// 負責人徽章
export function OwnerBadge({ owner }: { owner: string | null }) {
  const colorMap: Record<string, string> = {
    'Cara': 'bg-rose-100 text-rose-700',
    '阿芸': 'bg-teal-100 text-teal-700',
    '圓圓': 'bg-violet-100 text-violet-700',
    '戴戴': 'bg-amber-100 text-amber-700',
    'Tilly': 'bg-sky-100 text-sky-700',
    'BOSS': 'bg-brand-light text-brand',
  }
  const cls = colorMap[owner ?? ''] ?? 'bg-gray-100 text-gray-500'
  return <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', cls)}>{owner ?? '—'}</span>
}
