'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Project } from '@/lib/types'
import { PROJECT_TYPES, PROJECT_STATUSES, PROJECT_STAGES, INVITATION_OWNERS } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, '請填名稱'),
  type: z.string().optional(),
  status: z.string().optional(),
  stage: z.string().optional(),
  next_step: z.string().optional(),
  owner: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
  onSave: (data: FormData) => Promise<void>
  entityName?: string
}

export function ProjectDialog({ open, onOpenChange, project, onSave, entityName = '專案' }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        type: project.type ?? '',
        status: project.status ?? '',
        stage: project.stage ?? '',
        next_step: project.next_step ?? '',
        owner: project.owner ?? '',
        start_date: project.start_date ?? '',
        end_date: project.end_date ?? '',
      })
    } else {
      reset({})
    }
  }, [project, reset])

  const onSubmit = async (data: FormData) => {
    try {
      await onSave(data)
      onOpenChange(false)
    } catch {
      // 儲存失敗時保持 dialog 開啟讓用戶重試，錯誤訊息已由 onSave 處理
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>{project ? `編輯${entityName}` : `新增${entityName}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">名稱 *</label>
            <Input {...register('name')} className="rounded-xl" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">合作類型</label>
              <Select value={watch('type') ?? ''} onValueChange={v => setValue('type', v ?? undefined)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇類型" /></SelectTrigger>
                <SelectContent>{PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">執行狀態</label>
              <Select value={watch('status') ?? ''} onValueChange={v => setValue('status', v ?? undefined)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇狀態" /></SelectTrigger>
                <SelectContent>{PROJECT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">階段</label>
              <Select value={watch('stage') ?? ''} onValueChange={v => setValue('stage', v ?? undefined)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇階段" /></SelectTrigger>
                <SelectContent>{PROJECT_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">負責人</label>
              <Select value={watch('owner') ?? ''} onValueChange={v => setValue('owner', v ?? undefined)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇負責人" /></SelectTrigger>
                <SelectContent>{INVITATION_OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">下一步</label>
              <Input {...register('next_step')} className="rounded-xl" placeholder="如：寄樣, 表單建置" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">開始日</label>
              <Input {...register('start_date')} type="date" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">結束日</label>
              <Input {...register('end_date')} type="date" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">取消</Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-brand hover:bg-brand-dark">
              {isSubmitting ? '儲存中…' : '儲存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
