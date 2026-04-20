'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectTypeBadge, OwnerBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ProjectDialog } from '@/components/projects/ProjectDialog'
import { listPodcasts, createPodcast, updatePodcast, deletePodcast } from '@/lib/actions/podcasts'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useOperator } from '@/hooks/useOperator'
import { formatDateRange } from '@/lib/format'
import type { Podcast } from '@/lib/types'

export function PodcastsClient() {
  const { operator } = useOperator()
  const [data, setData] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Podcast | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Podcast | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await listPodcasts()) } catch { toast.error('載入失敗') } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtimeTable('podcasts', fetchData)

  const handleSave = async (formData: Partial<Podcast>) => {
    const payload = { ...formData, updated_by: operator ?? '訪客' } as Omit<Podcast, 'id' | 'created_at' | 'updated_at'>
    try {
      if (editTarget) { await updatePodcast(editTarget.id, payload); toast.success('已更新') }
      else { await createPodcast(payload); toast.success('已新增') }
      fetchData()
    } catch { toast.error('儲存失敗') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await deletePodcast(deleteTarget.id); toast.success('已刪除'); setDeleteTarget(null); fetchData() }
    catch { toast.error('刪除失敗') } finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="rounded-xl bg-brand hover:bg-brand-dark gap-1"
          onClick={() => { setEditTarget(null); setDialogOpen(true) }}>
          <Plus size={14} /> 新增 Podcast
        </Button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>名稱</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>階段</TableHead>
              <TableHead>負責人</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>下一步</TableHead>
              <TableHead className="w-16">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="h-32"><EmptyState onAdd={() => { setEditTarget(null); setDialogOpen(true) }} /></TableCell></TableRow>
            ) : data.map(row => (
              <TableRow key={row.id} className="cursor-pointer hover:bg-gray-50"
                onClick={() => { setEditTarget(row as unknown as Podcast); setDialogOpen(true) }}>
                <TableCell className="font-medium text-sm">{row.name}</TableCell>
                <TableCell><ProjectTypeBadge type={row.type} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.status ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-36 truncate">{row.stage ?? '—'}</TableCell>
                <TableCell><OwnerBadge owner={row.owner} /></TableCell>
                <TableCell className="text-xs whitespace-nowrap">{formatDateRange(row.start_date, row.end_date)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.next_step ?? '—'}</TableCell>
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
      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editTarget as unknown as any} onSave={handleSave as unknown as any} entityName="Podcast" />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}
        title="刪除 Podcast" description={`確定要刪除「${deleteTarget?.name}」？`}
        onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
