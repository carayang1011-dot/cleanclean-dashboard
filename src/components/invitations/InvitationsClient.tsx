'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Search, X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { InvitationStatusBadge, OwnerBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { InvitationDialog } from './InvitationDialog'
import { listInvitations, createInvitation, updateInvitation, deleteInvitation } from '@/lib/actions/invitations'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useOperator } from '@/hooks/useOperator'
import type { Invitation } from '@/lib/types'
import { INVITATION_OWNERS, INVITATION_STATUSES, INVITATION_TYPES, INVITATION_PRODUCTS } from '@/lib/types'
import { Trash2 } from 'lucide-react'

const ALL = '全部'

export function InvitationsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { operator } = useOperator()

  const [data, setData] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // 篩選狀態（從 URL query string 初始化）
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [owner, setOwner] = useState(searchParams.get('owner') ?? ALL)
  const [type, setType] = useState(searchParams.get('type') ?? ALL)
  const [status, setStatus] = useState(searchParams.get('status') ?? ALL)
  const [product, setProduct] = useState(searchParams.get('product') ?? ALL)
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '')
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') ?? '')

  // Dialog 狀態
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Invitation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await listInvitations()
      setTotal(rows.length)
      setData(rows)
    } catch (e) {
      toast.error('載入失敗')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtimeTable('invitations', fetchData)

  // 同步篩選到 URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (owner !== ALL) params.set('owner', owner)
    if (type !== ALL) params.set('type', type)
    if (status !== ALL) params.set('status', status)
    if (product !== ALL) params.set('product', product)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    router.replace(`/invitations?${params.toString()}`, { scroll: false })
  }, [search, owner, type, status, product, dateFrom, dateTo, router])

  // 前端篩選
  const filtered = useMemo(() => {
    return data.filter(row => {
      if (owner !== ALL && row.owner !== owner) return false
      if (type !== ALL && row.type !== type) return false
      if (status !== ALL && row.status !== status) return false
      if (product !== ALL && !row.product?.includes(product)) return false
      if (dateFrom && row.first_contact_date && row.first_contact_date < dateFrom) return false
      if (dateTo && row.first_contact_date && row.first_contact_date > dateTo) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          row.name.toLowerCase().includes(q) ||
          (row.product ?? '').toLowerCase().includes(q) ||
          (row.note ?? '').toLowerCase().includes(q) ||
          (row.contact_log ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [data, search, owner, type, status, product, dateFrom, dateTo])

  // 統計
  const stats = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach(r => { counts[r.status ?? '未知'] = (counts[r.status ?? '未知'] ?? 0) + 1 })
    return counts
  }, [filtered])

  const clearFilters = () => {
    setSearch(''); setOwner(ALL); setType(ALL); setStatus(ALL)
    setProduct(ALL); setDateFrom(''); setDateTo('')
  }

  const handleSave = async (formData: Partial<Invitation>) => {
    const payload = { ...formData, updated_by: operator ?? '訪客' } as Omit<Invitation, 'id' | 'created_at' | 'updated_at'>
    try {
      if (editTarget) {
        await updateInvitation(editTarget.id, payload)
        toast.success('已更新')
      } else {
        await createInvitation(payload)
        toast.success('已新增')
      }
      fetchData()
    } catch {
      toast.error('儲存失敗')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteInvitation(deleteTarget.id)
      toast.success('已刪除')
      setDeleteTarget(null)
      fetchData()
    } catch {
      toast.error('刪除失敗')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 搜尋與篩選列 */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3 sticky top-[57px] z-30">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 rounded-xl"
              placeholder="搜尋姓名 / 商品 / 備註 / 聯絡狀況"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-xl text-muted-foreground">
            <X size={14} className="mr-1" /> 清除
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-brand hover:bg-brand-dark gap-1"
            onClick={() => { setEditTarget(null); setDialogOpen(true) }}
          >
            <Plus size={14} /> 新增邀約
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <SelectFilter label="負責人" value={owner} onChange={setOwner} options={INVITATION_OWNERS as unknown as string[]} />
          <SelectFilter label="合作方式" value={type} onChange={setType} options={INVITATION_TYPES as unknown as string[]} />
          <SelectFilter label="是否合作" value={status} onChange={setStatus} options={INVITATION_STATUSES as unknown as string[]} />
          <SelectFilter label="商品" value={product} onChange={setProduct} options={INVITATION_PRODUCTS as unknown as string[]} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            首次邀約
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded-xl h-8 text-xs w-36" />
            ~
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded-xl h-8 text-xs w-36" />
          </div>
          <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
            共 {total} 筆，顯示 {filtered.length} 筆
          </span>
        </div>
      </div>

      {/* 狀態統計 */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <span key={k} className="bg-white border rounded-lg px-2 py-1">
              {k} <strong>{v}</strong>
            </span>
          ))}
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-20">負責人</TableHead>
              <TableHead className="w-24">是否合作</TableHead>
              <TableHead className="w-16">方式</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead className="w-20">粉絲數</TableHead>
              <TableHead className="w-28">商品</TableHead>
              <TableHead className="max-w-48">聯絡狀況</TableHead>
              <TableHead className="max-w-36">備註</TableHead>
              <TableHead className="w-16">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32">
                  <EmptyState onAdd={() => { setEditTarget(null); setDialogOpen(true) }} />
                </TableCell>
              </TableRow>
            ) : filtered.map(row => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => { setEditTarget(row); setDialogOpen(true) }}
              >
                <TableCell><OwnerBadge owner={row.owner} /></TableCell>
                <TableCell><InvitationStatusBadge status={row.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.type ?? '—'}</TableCell>
                <TableCell className="font-medium text-sm">{row.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.followers ?? '—'}</TableCell>
                <TableCell className="text-xs">{row.product ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-48">
                  <span className="line-clamp-2" title={row.contact_log ?? ''}>{row.contact_log ?? '—'}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-36">
                  <span className="line-clamp-2">{row.note ?? '—'}</span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={e => { e.stopPropagation(); setDeleteTarget(row) }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 新增/編輯 Dialog */}
      <InvitationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invitation={editTarget}
        defaultOwner={operator ?? undefined}
        onSave={handleSave}
      />

      {/* 刪除確認 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="刪除邀約"
        description={`確定要刪除「${deleteTarget?.name}」的邀約記錄嗎？此操作不可復原。`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

// 小型篩選下拉
function SelectFilter({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
      <SelectTrigger className="h-8 rounded-xl text-xs w-32">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}：全部</SelectItem>
        {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
