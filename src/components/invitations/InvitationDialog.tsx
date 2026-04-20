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
import type { Invitation } from '@/lib/types'
import { INVITATION_OWNERS, INVITATION_STATUSES, INVITATION_TYPES, INVITATION_PRODUCTS } from '@/lib/types'

const schema = z.object({
  owner: z.string().min(1, '請選擇負責人'),
  name: z.string().min(1, '請填姓名'),
  status: z.string().optional(),
  type: z.string().optional(),
  followers: z.string().optional(),
  url: z.string().optional(),
  ig_url: z.string().optional(),
  fb_url: z.string().optional(),
  product: z.string().optional(),
  contact_log: z.string().optional(),
  quote: z.string().optional(),
  final_spec: z.string().optional(),
  ad_authorization: z.string().optional(),
  note: z.string().optional(),
  shipping_info: z.string().optional(),
  gift: z.string().optional(),
  schedule: z.string().optional(),
  first_contact_date: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitation?: Invitation | null
  defaultOwner?: string
  onSave: (data: FormData) => Promise<void>
}

export function InvitationDialog({ open, onOpenChange, invitation, defaultOwner, onSave }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { owner: defaultOwner ?? '' },
  })

  useEffect(() => {
    if (invitation) {
      reset({
        owner: invitation.owner,
        name: invitation.name,
        status: invitation.status ?? '',
        type: invitation.type ?? '',
        followers: invitation.followers ?? '',
        url: invitation.url ?? '',
        ig_url: invitation.ig_url ?? '',
        fb_url: invitation.fb_url ?? '',
        product: invitation.product ?? '',
        contact_log: invitation.contact_log ?? '',
        quote: invitation.quote ?? '',
        final_spec: invitation.final_spec ?? '',
        ad_authorization: invitation.ad_authorization ?? '',
        note: invitation.note ?? '',
        shipping_info: invitation.shipping_info ?? '',
        gift: invitation.gift ?? '',
        schedule: invitation.schedule ?? '',
        first_contact_date: invitation.first_contact_date ?? '',
      })
    } else {
      reset({ owner: defaultOwner ?? '' })
    }
  }, [invitation, defaultOwner, reset])

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
      <DialogContent noPadding className="max-w-2xl rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0 border-b">
          <DialogTitle>{invitation ? '編輯邀約' : '新增邀約'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* 負責人 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">負責人 *</label>
              <Select value={watch('owner') ?? ''} onValueChange={(v) => setValue('owner', v as string)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇負責人" /></SelectTrigger>
                <SelectContent>
                  {INVITATION_OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner.message}</p>}
            </div>
            {/* 名稱 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">名稱 *</label>
              <Input {...register('name')} className="rounded-xl" placeholder="KOL / KOC 名稱" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            {/* 合作狀態 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">是否合作</label>
              <Select value={watch('status') ?? ''} onValueChange={(v) => setValue('status', v || undefined)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇狀態" /></SelectTrigger>
                <SelectContent>
                  {INVITATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* 合作方式 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">合作方式</label>
              <Select value={watch('type') ?? ''} onValueChange={(v) => setValue('type', v || undefined)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="選擇方式" /></SelectTrigger>
                <SelectContent>
                  {INVITATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* 粉絲數 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">粉絲數</label>
              <Input {...register('followers')} className="rounded-xl" placeholder="如 1.2W" />
            </div>
            {/* 商品 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">商品</label>
              <Input {...register('product')} className="rounded-xl" placeholder="邀約商品" />
            </div>
            {/* 首次邀約日 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">首次邀約日</label>
              <Input {...register('first_contact_date')} type="date" className="rounded-xl" />
            </div>
            {/* 報價 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">報價</label>
              <Input {...register('quote')} className="rounded-xl" placeholder="報價備註" />
            </div>
          </div>

          {/* 連結 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">主要連結</label>
              <Input {...register('url')} className="rounded-xl text-xs" placeholder="https://" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">IG 連結</label>
              <Input {...register('ig_url')} className="rounded-xl text-xs" placeholder="https://" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">FB 連結</label>
              <Input {...register('fb_url')} className="rounded-xl text-xs" placeholder="https://" />
            </div>
          </div>

          {/* 聯絡狀況 */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">聯絡狀況</label>
            <textarea
              {...register('contact_log')}
              className="w-full border border-input rounded-xl px-3 py-2 text-sm min-h-[80px] bg-background resize-y"
              placeholder="1/12 發信&#10;1/15 回覆..."
            />
          </div>

          {/* 最後規格 */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">最後合作規格</label>
            <textarea
              {...register('final_spec')}
              className="w-full border border-input rounded-xl px-3 py-2 text-sm min-h-[60px] bg-background resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">廣告主＆圖文授權</label>
              <Input {...register('ad_authorization')} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">公關品</label>
              <Input {...register('gift')} className="rounded-xl" placeholder="寄送品項" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">收件資料</label>
              <Input {...register('shipping_info')} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">合作進度排程</label>
              <Input {...register('schedule')} className="rounded-xl" />
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">備註</label>
            <textarea
              {...register('note')}
              className="w-full border border-input rounded-xl px-3 py-2 text-sm min-h-[60px] bg-background resize-y"
            />
          </div>

          </div>
          <DialogFooter className="shrink-0 px-6 py-4 border-t bg-white">
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
