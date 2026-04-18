'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Kol } from '@/lib/types'
import { KOL_LEVELS, KOL_PLATFORMS, KOL_STATUSES, INVITATION_OWNERS } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, '請填名稱'),
  level: z.string().optional(),
  platform: z.string().optional(),
  category: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
  followers: z.string().optional(),
  orders: z.coerce.number().nullable().optional(),
  revenue: z.coerce.number().nullable().optional(),
  aov: z.coerce.number().nullable().optional(),
  commission_rate: z.coerce.number().nullable().optional(),
  commission_amount: z.coerce.number().nullable().optional(),
  contact_owner: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  kol?: Kol | null
  onSave: (data: FormData) => Promise<void>
}

export function KolDialog({ open, onOpenChange, kol, onSave }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (kol) {
      reset({
        name: kol.name,
        level: kol.level ?? '',
        platform: kol.platform ?? '',
        category: kol.category ?? '',
        start_date: kol.start_date ?? '',
        end_date: kol.end_date ?? '',
        status: kol.status ?? '',
        note: kol.note ?? '',
        followers: kol.followers ?? '',
        orders: kol.orders,
        revenue: kol.revenue,
        aov: kol.aov,
        commission_rate: kol.commission_rate,
        commission_amount: kol.commission_amount,
        contact_owner: kol.contact_owner ?? '',
      })
    } else {
      reset({ category: '居家清潔' })
    }
  }, [kol, reset])

  const onSubmit = async (data: FormData) => {
    await onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{kol ? '編輯 KOL/KOC' : '新增 KOL/KOC'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">名稱 *</label>
              <Input {...register('name')} className="rounded-xl" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">等級</label>
              <Select value={watch('level') ?? ''} onValueChange={v => setValue('level', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇等級" /></SelectTrigger>
                <SelectContent>{KOL_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">平台</label>
              <Select value={watch('platform') ?? ''} onValueChange={v => setValue('platform', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇平台" /></SelectTrigger>
                <SelectContent>{KOL_PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">合作狀態</label>
              <Select value={watch('status') ?? ''} onValueChange={v => setValue('status', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇狀態" /></SelectTrigger>
                <SelectContent>{KOL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">上線開始日</label>
              <Input {...register('start_date')} type="date" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">上線結束日</label>
              <Input {...register('end_date')} type="date" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">粉絲數</label>
              <Input {...register('followers')} className="rounded-xl" placeholder="如 1.2W" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">接洽人員</label>
              <Select value={watch('contact_owner') ?? ''} onValueChange={v => setValue('contact_owner', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇接洽人" /></SelectTrigger>
                <SelectContent>{INVITATION_OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">訂單數</label>
              <Input {...register('orders')} type="number" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">銷售業績</label>
              <Input {...register('revenue')} type="number" step="0.01" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">客單價</label>
              <Input {...register('aov')} type="number" step="0.01" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">抽成比例 %</label>
              <Input {...register('commission_rate')} type="number" step="0.01" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">抽成金額</label>
              <Input {...register('commission_amount')} type="number" step="0.01" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">產品類別</label>
              <Input {...register('category')} className="rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">備註</label>
            <textarea {...register('note')} className="w-full border border-input rounded-xl px-3 py-2 text-sm min-h-[60px] bg-background resize-y" />
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
