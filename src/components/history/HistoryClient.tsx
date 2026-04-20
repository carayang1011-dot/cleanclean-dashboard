'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Search, ArrowUpDown, Copy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HistoryDetailModal } from './HistoryDetailModal'
import { formatNTD, formatDateRange } from '@/lib/format'
import type { HistoryRecord } from '@/lib/types'
import { HISTORY_COLLAB_TYPES, HISTORY_OWNERS, HISTORY_STATUSES, HISTORY_SYSTEMS, HISTORY_YEARS } from '@/lib/types'

const ALL = '全部'
type SortKey = keyof HistoryRecord
type SortDir = 'asc' | 'desc'

export function HistoryClient({ initialData }: { initialData: HistoryRecord[] }) {
  const [data] = useState<HistoryRecord[]>(initialData)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState(ALL)
  const [collabType, setCollabType] = useState(ALL)
  const [platform, setPlatform] = useState(ALL)
  const [system, setSystem] = useState(ALL)
  const [owner, setOwner] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [paid, setPaid] = useState(ALL)
  const [sortKey, setSortKey] = useState<SortKey>('start_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailRecord, setDetailRecord] = useState<HistoryRecord | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // Unique platforms from data (simplified)
  const platformOpts = useMemo(() => {
    const set = new Set(data.map(r => r.platform).filter(Boolean) as string[])
    // Simplify: collapse platform combos into main platform names for filtering
    const mains = new Set<string>()
    set.forEach(p => {
      if (p.toUpperCase().includes('IG') || p.toLowerCase().includes('instagram')) mains.add('IG / Instagram')
      else if (p.toUpperCase().includes('FB') || p.toLowerCase().includes('facebook') || p.includes('社團')) mains.add('FB / 社團')
      else if (p.toLowerCase().includes('youtube')) mains.add('YouTube')
      else if (p.toLowerCase().includes('podcast')) mains.add('Podcast')
      else if (p.toLowerCase().includes('line')) mains.add('LINE')
      else if (p.toLowerCase().includes('blog')) mains.add('BLOG')
      else mains.add(p)
    })
    return [...mains].sort()
  }, [data])

  const filtered = useMemo(() => {
    let rows = data.filter(r => {
      if (year !== ALL && String(r.year) !== year) return false
      if (collabType !== ALL && r.collab_type !== collabType) return false
      if (system !== ALL && r.system !== system) return false
      if (owner !== ALL && r.owner !== owner) return false
      if (status !== ALL && r.status !== status) return false
      if (paid !== ALL && r.paid !== paid) return false
      if (platform !== ALL) {
        const p = r.platform ?? ''
        const lp = platform.toLowerCase()
        if (lp.includes('ig') || lp.includes('instagram')) {
          if (!p.toUpperCase().includes('IG') && !p.toLowerCase().includes('instagram')) return false
        } else if (lp.includes('fb') || lp.includes('社團')) {
          if (!p.toUpperCase().includes('FB') && !p.toLowerCase().includes('facebook') && !p.includes('社團')) return false
        } else if (lp.includes('youtube')) {
          if (!p.toLowerCase().includes('youtube')) return false
        } else if (lp.includes('podcast')) {
          if (!p.toLowerCase().includes('podcast')) return false
        } else if (lp.includes('line')) {
          if (!p.toLowerCase().includes('line')) return false
        } else if (lp.includes('blog')) {
          if (!p.toLowerCase().includes('blog')) return false
        } else {
          if (r.platform !== platform) return false
        }
      }
      if (search) {
        const q = search.toLowerCase()
        return (r.creator?.toLowerCase().includes(q)) ||
          (r.product?.toLowerCase().includes(q)) ||
          (r.note?.toLowerCase().includes(q)) ||
          (r.owner?.toLowerCase().includes(q))
      }
      return true
    })
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [data, year, collabType, platform, system, owner, status, paid, search, sortKey, sortDir])

  // Sync selection to filtered
  useEffect(() => {
    setSelected(prev => {
      const ids = new Set(filtered.map(r => r.id))
      const next = new Set([...prev].filter(id => ids.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [filtered])

  const summary = useMemo(() => ({
    revenue: filtered.reduce((s, r) => s + (r.revenue ?? 0), 0),
    orders: filtered.reduce((s, r) => s + (r.orders ?? 0), 0),
    commission: filtered.reduce((s, r) => s + (r.commission_amount ?? 0), 0),
  }), [filtered])

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id))
  const toggleAll = () => allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(r => r.id)))
  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleCopy = () => {
    const rows = filtered.filter(r => selected.has(r.id))
    const headers = ['創作者', '年度', '合作型式', '等級', '平台', '開團系統', '上線期間', '合作狀態', '素材形式', '接洽人', '訂單', '營收', '客單價', '分潤%', '分潤金額', '合作費(未稅)', '已匯款', '付款日', '備註']
    const lines = [
      headers.join('\t'),
      ...rows.map(r => [
        r.creator,
        r.year ?? '',
        r.collab_type ?? '',
        r.level ?? '',
        r.platform ?? '',
        r.system ?? '',
        formatDateRange(r.start_date, r.end_date),
        r.status ?? '',
        r.material ?? '',
        r.owner ?? '',
        r.orders ?? '',
        r.revenue ?? '',
        r.aov != null ? Math.round(r.aov) : '',
        r.commission_rate != null ? `${(r.commission_rate * 100).toFixed(0)}%` : '',
        r.commission_amount ?? '',
        r.fee_pretax ?? '',
        r.paid ?? '',
        r.payment_date ?? '',
        r.note ?? '',
      ].join('\t'))
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    toast.success(`已複製 ${rows.length} 筆，可貼入 Excel`)
  }

  const SortHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort(k)}>
      <span className="flex items-center gap-1">{label}<ArrowUpDown size={11} className={sortKey === k ? 'text-brand' : 'text-muted-foreground/40'} /></span>
    </TableHead>
  )

  const statusColor = (s: string | null) => {
    if (!s) return 'bg-gray-100 text-gray-500'
    if (s === '已完成') return 'bg-green-100 text-green-700'
    if (s === '廣告中' || s === '結團中' || s === '進行中') return 'bg-blue-100 text-blue-700'
    if (s === '暫不合作') return 'bg-red-100 text-red-500'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="space-y-4">
      {/* 篩選列 */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-8 rounded-xl" placeholder="搜尋創作者 / 產品 / 備註" />
          </div>
          <SelectF label="年度" value={year} onChange={setYear} opts={HISTORY_YEARS.map(String)} />
          <SelectF label="合作型式" value={collabType} onChange={setCollabType} opts={HISTORY_COLLAB_TYPES as unknown as string[]} />
          <SelectF label="平台" value={platform} onChange={setPlatform} opts={platformOpts} />
          <SelectF label="開團系統" value={system} onChange={setSystem} opts={HISTORY_SYSTEMS as unknown as string[]} />
          <SelectF label="接洽人" value={owner} onChange={setOwner} opts={HISTORY_OWNERS as unknown as string[]} />
          <SelectF label="狀態" value={status} onChange={setStatus} opts={HISTORY_STATUSES as unknown as string[]} />
          <SelectF label="已匯款" value={paid} onChange={setPaid} opts={['是', '否']} />
        </div>

        {/* 統計列 */}
        <div className="flex gap-4 text-sm items-center flex-wrap">
          <span className="text-muted-foreground">篩選 <strong className="text-foreground">{filtered.length}</strong> / {data.length} 筆</span>
          <span>總營收 <strong className="text-brand">{formatNTD(summary.revenue)}</strong></span>
          <span>總訂單 <strong>{summary.orders}</strong></span>
          <span>總分潤 <strong>{formatNTD(summary.commission)}</strong></span>
          {selected.size > 0 && (
            <Button size="sm" variant="outline" className="rounded-xl gap-1 ml-auto text-xs h-7 border-brand text-brand hover:bg-brand/5" onClick={handleCopy}>
              <Copy size={12} /> 複製 {selected.size} 筆
            </Button>
          )}
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="rounded cursor-pointer accent-brand" title="全選" />
              </TableHead>
              <TableHead className="w-14">年度</TableHead>
              <SortHead label="創作者" k="creator" />
              <TableHead>合作型式</TableHead>
              <TableHead>平台</TableHead>
              <TableHead>開團系統</TableHead>
              <SortHead label="上線期間" k="start_date" />
              <TableHead>狀態</TableHead>
              <TableHead>接洽人</TableHead>
              <SortHead label="訂單" k="orders" />
              <SortHead label="營收" k="revenue" />
              <SortHead label="客單價" k="aov" />
              <TableHead>分潤%</TableHead>
              <SortHead label="分潤金額" k="commission_amount" />
              <TableHead>已匯款</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="h-32 text-center text-muted-foreground text-sm">
                  沒有符合條件的紀錄
                </TableCell>
              </TableRow>
            ) : filtered.map(row => (
              <TableRow
                key={row.id}
                className={`cursor-pointer hover:bg-gray-50 ${selected.has(row.id) ? 'bg-brand/5' : ''}`}
                onClick={() => { setDetailRecord(row); setModalOpen(true) }}
              >
                <TableCell onClick={e => toggleRow(row.id, e)}>
                  <input type="checkbox" checked={selected.has(row.id)} onChange={() => {}}
                    className="rounded cursor-pointer accent-brand" />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.year ?? '—'}</TableCell>
                <TableCell className="font-medium text-sm whitespace-nowrap">{row.creator}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{row.collab_type ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate" title={row.platform ?? ''}>{row.platform ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.system ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateRange(row.start_date, row.end_date)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(row.status)}`}>
                    {row.status ?? '—'}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.owner ?? '—'}</TableCell>
                <TableCell className="text-sm">{row.orders ?? '—'}</TableCell>
                <TableCell className="text-sm font-medium text-brand">{formatNTD(row.revenue)}</TableCell>
                <TableCell className="text-sm">{row.aov != null ? formatNTD(Math.round(row.aov)) : '—'}</TableCell>
                <TableCell className="text-xs">{row.commission_rate != null ? `${(row.commission_rate * 100).toFixed(0)}%` : '—'}</TableCell>
                <TableCell className="text-sm">{formatNTD(row.commission_amount)}</TableCell>
                <TableCell>
                  <span className={`text-xs font-medium ${row.paid === '是' ? 'text-green-600' : 'text-gray-400'}`}>
                    {row.paid ?? '—'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <HistoryDetailModal record={detailRecord} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

function SelectF({ label, value, onChange, opts }: {
  label: string; value: string; onChange: (v: string) => void; opts: string[]
}) {
  return (
    <Select value={value} onValueChange={v => onChange(v ?? '')}>
      <SelectTrigger className="h-8 rounded-xl text-xs w-32"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}：全部</SelectItem>
        {opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
