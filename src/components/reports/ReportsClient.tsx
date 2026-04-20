'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { MdEditor } from './MdEditor'
import { listReports, createReport, updateReport, deleteReport } from '@/lib/actions/reports'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useOperator } from '@/hooks/useOperator'
import type { Report } from '@/lib/types'
import { OPERATORS } from '@/lib/types'

const schema = z.object({
  kind: z.enum(['weekly', 'monthly', 'meeting']),
  title: z.string().min(1, '請填標題'),
  date: z.string().optional(),
  author: z.string().optional(),
  attachment_url: z.string().optional(),
  participants: z.string().optional(),
  content: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const KIND_LABELS: Record<string, string> = { weekly: '週報', monthly: '月報', meeting: '會議記錄' }

export function ReportsClient() {
  const { operator } = useOperator()
  const [tab, setTab] = useState<'weekly' | 'monthly' | 'meeting'>('weekly')
  const [data, setData] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Report | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { kind: 'weekly' },
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setData(await listReports()) } catch { toast.error('載入失敗') } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtimeTable('reports', fetchData)

  const filtered = data.filter(r => r.kind === tab)

  const openEdit = (r: Report | null) => {
    setEditTarget(r)
    if (r) {
      reset({
        kind: r.kind, title: r.title, date: r.date ?? '', author: r.author ?? '',
        attachment_url: r.attachment_url ?? '',
        participants: r.participants?.join(', ') ?? '',
        content: r.content ?? '',
      })
    } else {
      reset({ kind: tab })
    }
    setDialogOpen(true)
  }

  const onSubmit = async (formData: FormData) => {
    const payload: Omit<Report, 'id' | 'created_at' | 'updated_at'> = {
      kind: formData.kind,
      title: formData.title,
      date: formData.date || null,
      author: formData.author || null,
      attachment_url: formData.attachment_url || null,
      participants: formData.participants ? formData.participants.split(',').map(s => s.trim()).filter(Boolean) : null,
      content: formData.content || null,
      updated_by: operator ?? '訪客',
    }
    try {
      if (editTarget) { await updateReport(editTarget.id, payload); toast.success('已更新') }
      else { await createReport(payload); toast.success('已新增') }
      setDialogOpen(false)
      fetchData()
    } catch { toast.error('儲存失敗') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await deleteReport(deleteTarget.id); toast.success('已刪除'); setDeleteTarget(null); fetchData() }
    catch { toast.error('刪除失敗') } finally { setDeleting(false) }
  }

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="weekly" className="rounded-xl text-xs">週報</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-xl text-xs">月報</TabsTrigger>
            <TabsTrigger value="meeting" className="rounded-xl text-xs">會議記錄</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" className="rounded-xl bg-brand hover:bg-brand-dark gap-1"
          onClick={() => openEdit(null)}>
          <Plus size={14} /> 新增{KIND_LABELS[tab]}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-8"><EmptyState onAdd={() => openEdit(null)} /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className="rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm">{r.title}</h3>
                      {r.date && <span className="text-xs text-muted-foreground">{r.date}</span>}
                      {r.author && <span className="text-xs bg-brand-light text-brand px-2 py-0.5 rounded-lg">{r.author}</span>}
                    </div>
                    {r.participants && r.participants.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-2">參與者：{r.participants.join(' / ')}</p>
                    )}
                    {r.attachment_url && (
                      <a href={r.attachment_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-brand hover:underline flex items-center gap-1 mb-2">
                        附件連結 <ExternalLink size={11} />
                      </a>
                    )}
                    {expanded.has(r.id) && r.content && (
                      <div className="mt-3 prose prose-sm max-w-none border-t pt-3">
                        <pre className="whitespace-pre-wrap text-xs font-sans text-foreground">{r.content}</pre>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {r.content && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 rounded-xl text-xs" onClick={() => toggle(r.id)}>
                        {expanded.has(r.id) ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 px-2 rounded-xl text-xs text-brand"
                      onClick={() => openEdit(r)}>編輯</Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteTarget(r)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editTarget ? '編輯' : '新增'}{KIND_LABELS[watch('kind') ?? tab]}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">類型</label>
                <Select value={watch('kind')} onValueChange={v => setValue('kind', v as FormData['kind'])}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">週報</SelectItem>
                    <SelectItem value="monthly">月報</SelectItem>
                    <SelectItem value="meeting">會議記錄</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">日期</label>
                <Input {...register('date')} type="date" className="rounded-xl" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">標題 *</label>
                <Input {...register('title')} className="rounded-xl" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">撰寫人</label>
                <Select value={watch('author') ?? ''} onValueChange={v => setValue('author', v ?? undefined)}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇撰寫人" /></SelectTrigger>
                  <SelectContent>{OPERATORS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">附件連結</label>
                <Input {...register('attachment_url')} className="rounded-xl" placeholder="https://" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">會議參與者（逗號分隔）</label>
                <Input {...register('participants')} className="rounded-xl" placeholder="BOSS, 阿芸, Cara" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">內容（Markdown）</label>
              <Controller
                control={control}
                name="content"
                render={({ field }) => <MdEditor value={field.value ?? ''} onChange={field.onChange} />}
              />
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
        title={`刪除${KIND_LABELS[deleteTarget?.kind ?? 'weekly']}`}
        description={`確定要刪除「${deleteTarget?.title}」？`}
        onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
