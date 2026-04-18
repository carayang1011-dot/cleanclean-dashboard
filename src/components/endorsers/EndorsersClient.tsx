'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { OwnerBadge } from '@/components/shared/StatusBadge'
import { listEndorsers, createEndorser, updateEndorser, deleteEndorser } from '@/lib/actions/endorsers'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useOperator } from '@/hooks/useOperator'
import type { Endorser } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, '請填名稱'),
  recommender: z.string().optional(),
  reason: z.string().optional(),
  followers: z.string().optional(),
  url: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function EndorsersClient() {
  const { operator } = useOperator()
  const [data, setData] = useState<Endorser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Endorser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Endorser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await listEndorsers()) } catch { toast.error('載入失敗') } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtimeTable('endorsers', fetchData)

  const openEdit = (e: Endorser | null) => {
    setEditTarget(e)
    reset(e ? { name: e.name, recommender: e.recommender ?? '', reason: e.reason ?? '', followers: e.followers ?? '', url: e.url ?? '' } : {})
    setDialogOpen(true)
  }

  const onSubmit = async (formData: FormData) => {
    const payload = { ...formData, updated_by: operator ?? '訪客' } as Omit<Endorser, 'id' | 'created_at' | 'updated_at'>
    try {
      if (editTarget) { await updateEndorser(editTarget.id, payload); toast.success('已更新') }
      else { await createEndorser(payload); toast.success('已新增') }
      setDialogOpen(false)
      fetchData()
    } catch { toast.error('儲存失敗') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await deleteEndorser(deleteTarget.id); toast.success('已刪除'); setDeleteTarget(null); fetchData() }
    catch { toast.error('刪除失敗') } finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="rounded-xl bg-brand hover:bg-brand-dark gap-1"
          onClick={() => openEdit(null)} disabled={!operator}>
          <Plus size={14} /> 新增代言人
        </Button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>名稱</TableHead>
              <TableHead>推薦人</TableHead>
              <TableHead>推薦原因</TableHead>
              <TableHead>粉絲數</TableHead>
              <TableHead>連結</TableHead>
              <TableHead className="w-16">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-32"><EmptyState onAdd={operator ? () => openEdit(null) : undefined} /></TableCell></TableRow>
            ) : data.map(row => (
              <TableRow key={row.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openEdit(row)}>
                <TableCell className="font-medium text-sm">{row.name}</TableCell>
                <TableCell><OwnerBadge owner={row.recommender} /></TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-48">{row.reason ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.followers ?? '—'}</TableCell>
                <TableCell>
                  {row.url ? (
                    <a href={row.url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-brand hover:underline text-xs flex items-center gap-1">
                      連結 <ExternalLink size={11} />
                    </a>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={e => { e.stopPropagation(); setDeleteTarget(row) }} disabled={!operator}>
                    <Trash2 size={13} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>{editTarget ? '編輯代言人' : '新增代言人'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">名稱 *</label>
              <Input {...register('name')} className="rounded-xl" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">推薦人</label>
                <Input {...register('recommender')} className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">粉絲數</label>
                <Input {...register('followers')} className="rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">推薦原因</label>
              <textarea {...register('reason')} className="w-full border border-input rounded-xl px-3 py-2 text-sm min-h-[60px] bg-background resize-y" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">連結</label>
              <Input {...register('url')} className="rounded-xl" placeholder="https://" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">取消</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-brand hover:bg-brand-dark">
                {isSubmitting ? '儲存中…' : '儲存'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}
        title="刪除代言人" description={`確定要刪除「${deleteTarget?.name}」？`}
        onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
