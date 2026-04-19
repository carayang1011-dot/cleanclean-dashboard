'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Search, Plus, ArrowUpDown, Trash2, Copy, CheckSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { KolStatusBadge, OwnerBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { KolDialog } from './KolDialog'
import { listKols, createKol, updateKol, deleteKol } from '@/lib/actions/kols'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useOperator } from '@/hooks/useOperator'
import { formatNTD, formatDateRange } from '@/lib/format'
import type { Kol } from '@/lib/types'
import { KOL_LEVELS, KOL_PLATFORMS, KOL_STATUSES, INVITATION_OWNERS } from '@/lib/types'

const ALL = '全部'
type SortKey = keyof Kol
type SortDir = 'asc' | 'desc'

export function KolsClient() {
  const searchParams = useSearchParams()
  const { operator } = useOperator()

  const [data, setData] = useState<Kol[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState(ALL)
  const [platform, setPlatform] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [contactOwner, setContactOwner] = useState(ALL)
  const [month, setMonth] = useState(searchParams.get('month') ?? ALL)
  const [sortKey, setSortKey] = useState<SortKey>('start_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Kol | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Kol | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 全選 / 複製
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await listKols()
      setData(rows)
    } catch {
      toast.error('載入失敗')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtimeTable('kols', fetchData)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let rows = data.filter(r => {
      if (level !== ALL && r.level !== level) return false
      if (platform !== ALL && r.platform !== platform) return false
      if (status !== ALL && r.status !== status) return false
      if (contactOwner !== ALL && r.contact_owner !== contactOwner) return false
      if (month !== ALL) {
        const m = parseInt(month)
        if (!r.start_date) return false
        const d = new Date(r.start_date)
        if (d.getMonth() + 1 !== m) return false
      }
      if (search) {
        const q = search.toLowerCase()
        return r.name.toLowerCase().includes(q) || (r.note ?? '').toLowerCase().includes(q)
      }
      return true
    })
    rows.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [data, level, platform, status, contactOwner, month, search, sortKey, sortDir])

  // 清掉不在 filtered 裡的選取
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
    aov: filtered.length ? filtered.reduce((s, r) => s + (r.aov ?? 0), 0) / filtered.filter(r => r.aov).length : 0,
  }), [filtered])

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(r => r.id)))
    }
  }

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
    const headers = ['名稱', '等級', '平台', '上線期間', '狀態', '訂單', '業績', '客單價', '抽成%', '抽成金額', '接洽人', '備註']
    const lines = [
      headers.join('\t'),
      ...rows.map(r => [
        r.name,
        r.level ?? '',
        r.platform ?? '',
        formatDateRange(r.start_date, r.end_date),
        r.status ?? '',
        r.orders ?? '',
        r.revenue ?? '',
        r.aov ?? '',
        r.commission_rate != null ? `${r.commission_rate}%` : '',
        r.commission_amount ?? '',
        r.contact_owner ?? '',
        r.note ?? '',
      ].join('\t'))
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    toast.success(`已複製 ${rows.length} 筆，可貼入 Excel`)
  }

  const handleSave = async (formData: Partial<Kol>) => {
    const payload = { ...formData, updated_by: operator ?? '訪客' } as Omit<Kol, 'id' | 'created_at' | 'updated_at'>
    try {
      if (editTarget) {
        await updateKol(editTarget.id, payload)
        toast.success('已更新')
      } else {
        await createKol(payload)
        toast.success('已新增')
      }
      fetchData()
    } catch {
      toast.error('儲存失敗')
      throw new Error('save failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteKol(deleteTarget.id)
      toast.success('已刪除')
      setDeleteTarget(null)
      fetchData()
    } catch {
      toast.error('刪除失敗')
    } finally {
      setDeleting(false)
    }
  }

  const SortHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort(k)}>
      <span className="flex items-center gap-1">{label}<ArrowUpDown size={11} className={sortKey === k ? 'text-brand' : 'text-muted-foreground/40'} /></span>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      {/* 頂部篩選 */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-8 rounded-xl" placeholder="搜尋名稱 / 備註" />
          </div>
          <SelectF label="等級" value={level} onChange={setLevel} opts={KOL_LEVELS as unknown as string[]} />
          <SelectF label="平台" value={platform} onChange={setPlatform} opts={KOL_PLATFORMS as unknown as string[]} />
          <SelectF label="狀態" value={status} onChange={setStatus} opts={KOL_STATUSES as unknown as string[]} />
          <SelectF label="接洽人員" value={contactOwner} onChange={setContactOwner} opts={INVITATION_OWNERS as unknown as string[]} />
          <SelectF label="月份" value={month} onChange={setMonth} opts={['1','2','3','4','5','6'].map(m => `${m}月`)} rawOpts={['1','2','3','4','5','6']} />
          <Button size="sm" className="rounded-xl bg-brand hover:bg-brand-dark gap-1" onClick={() => { setEditTarget(null); setDialogOpen(true) }}>
            <Plus size={14} /> 新增
          </Button>
        </div>

        {/* 即時統計 + 複製按鈕 */}
        <div className="flex gap-4 text-sm items-center">
          <span className="text-muted-foreground">篩選 <strong className="text-foreground">{filtered.length}</strong> 筆</span>
          <span>總業績 <strong className="text-brand">{formatNTD(summary.revenue)}</strong></span>
          <span>總訂單 <strong>{summary.orders}</strong></span>
          <span>平均客單 <strong>{formatNTD(Math.round(summary.aov))}</strong></span>
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
              {/* 全選 checkbox */}
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded cursor-pointer accent-brand"
                  title="全選"
                />
              </TableHead>
              <TableHead className="w-16">等級</TableHead>
              <SortHead label="名稱" k="name" />
              <TableHead>平台</TableHead>
              <SortHead label="上線期間" k="start_date" />
              <TableHead>狀態</TableHead>
              <SortHead label="訂單" k="orders" />
              <SortHead label="業績" k="revenue" />
              <SortHead label="客單價" k="aov" />
              <TableHead>抽成%</TableHead>
              <TableHead>抽成金額</TableHead>
              <TableHead>接洽人</TableHead>
              <TableHead className="w-16">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 13 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={13} className="h-32"><EmptyState onAdd={() => { setEditTarget(null); setDialogOpen(true) }} /></TableCell></TableRow>
            ) : filtered.map(row => (
              <TableRow
                key={row.id}
                className={`cursor-pointer hover:bg-gray-50 ${selected.has(row.id) ? 'bg-brand/5' : ''}`}
                onClick={() => { setEditTarget(row); setDialogOpen(true) }}
              >
                <TableCell onClick={e => toggleRow(row.id, e)}>
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => {}}
                    className="rounded cursor-pointer accent-brand"
                  />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.level ?? '—'}</TableCell>
                <TableCell className="font-medium text-sm">{row.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.platform ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateRange(row.start_date, row.end_date)}</TableCell>
                <TableCell><KolStatusBadge status={row.status} /></TableCell>
                <TableCell className="text-sm">{row.orders ?? '—'}</TableCell>
                <TableCell className="text-sm font-medium text-brand">{formatNTD(row.revenue)}</TableCell>
                <TableCell className="text-sm">{formatNTD(row.aov)}</TableCell>
                <TableCell className="text-xs">{row.commission_rate != null ? `${row.commission_rate}%` : '—'}</TableCell>
                <TableCell className="text-sm">{formatNTD(row.commission_amount)}</TableCell>
                <TableCell><OwnerBadge owner={row.contact_owner} /></TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={e => { e.stopPropagation(); setDeleteTarget(row) }}>
                    <Trash2 size={13} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <KolDialog open={dialogOpen} onOpenChange={setDialogOpen} kol={editTarget} onSave={handleSave} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}
        title="刪除 KOL/KOC" description={`確定要刪除「${deleteTarget?.name}」？此操作不可復原。`}
        onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}

function SelectF({ label, value, onChange, opts, rawOpts }: {
  label: string; value: string; onChange: (v: string) => void; opts: string[]; rawOpts?: string[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 rounded-xl text-xs w-32"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}：全部</SelectItem>
        {opts.map((o, i) => <SelectItem key={o} value={rawOpts ? rawOpts[i] : o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
