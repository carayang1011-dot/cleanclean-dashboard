'use client'

import { useState } from 'react'
import { Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatNTD, formatDateRange } from '@/lib/format'
import type { HistoryRecord } from '@/lib/types'

interface Props {
  record: HistoryRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Field({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  if (value == null || value === '') return null
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm text-foreground whitespace-pre-wrap break-words ${mono ? 'font-mono text-xs bg-gray-50 rounded p-2' : ''}`}>{String(value)}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-brand uppercase tracking-wide border-b border-brand/10 pb-1">{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

export function HistoryDetailModal({ record, open, onOpenChange }: Props) {
  const [showSensitive, setShowSensitive] = useState(false)

  if (!record) return null

  const dateRange = formatDateRange(record.start_date, record.end_date)
  const commissionPct = record.commission_rate != null ? `${(record.commission_rate * 100).toFixed(0)}%` : null

  return (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setShowSensitive(false) }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {record.creator}
            {record.year && <span className="ml-2 text-sm font-normal text-muted-foreground">{record.year} 年</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* 基本資料 */}
          <Section title="基本資料">
            <Field label="合作型式" value={record.collab_type} />
            <Field label="等級" value={record.level} />
            <Field label="社群平台" value={record.platform} />
            <Field label="開團系統" value={record.system} />
            <Field label="上線期間" value={dateRange} />
            <Field label="素材形式" value={record.material} />
            <Field label="合作狀態" value={record.status} />
            <Field label="接洽負責人" value={record.owner} />
            <Field label="合作產品" value={record.product} />
            <Field label="團購折數" value={record.discount} />
            {record.url && (
              <div className="space-y-0.5 col-span-2">
                <p className="text-xs text-muted-foreground">連結</p>
                <a href={record.url} target="_blank" rel="noreferrer"
                  className="text-sm text-brand hover:underline flex items-center gap-1 break-all">
                  {record.url} <ExternalLink size={11} />
                </a>
              </div>
            )}
          </Section>

          {/* 業績數據 */}
          <Section title="業績數據">
            <Field label="訂單數量" value={record.orders} />
            <Field label="營收（未稅）" value={record.revenue != null ? formatNTD(record.revenue) : null} />
            <Field label="客單價" value={record.aov != null ? formatNTD(Math.round(record.aov)) : null} />
            <Field label="分潤比例" value={commissionPct} />
            <Field label="分潤金額（未稅）" value={record.commission_amount != null ? formatNTD(record.commission_amount) : null} />
            <Field label="合作費用（未稅）" value={record.fee_pretax != null ? formatNTD(record.fee_pretax) : null} />
            <Field label="合作費用（含稅）" value={record.fee_tax != null ? formatNTD(record.fee_tax) : null} />
          </Section>

          {/* 財務 */}
          <Section title="財務資訊">
            <Field label="已匯款" value={record.paid} />
            <Field label="匯款金額" value={record.transfer_amount != null ? formatNTD(record.transfer_amount) : null} />
            <Field label="付款日" value={record.payment_date} />
            <Field label="勞報號" value={record.tax_receipt} />
          </Section>

          {/* 備註 */}
          {(record.note || record.ad_auth || record.transfer_note) && (
            <Section title="備註">
              {record.ad_auth && <div className="col-span-2"><Field label="廣告主授權" value={record.ad_auth} /></div>}
              {record.note && <div className="col-span-2"><Field label="報價備註" value={record.note} mono /></div>}
              {record.transfer_note && <div className="col-span-2"><Field label="匯款備註" value={record.transfer_note} mono /></div>}
            </Section>
          )}

          {/* 敏感資訊（隱藏） */}
          {(record.shipping_info || record.transfer_info) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-brand/10 pb-1">
                <h3 className="text-xs font-semibold text-brand uppercase tracking-wide">收件 / 匯款資料</h3>
                <Button size="sm" variant="ghost" className="h-6 gap-1 text-xs text-muted-foreground"
                  onClick={() => setShowSensitive(v => !v)}>
                  {showSensitive ? <><EyeOff size={12} /> 隱藏</> : <><Eye size={12} /> 顯示</>}
                </Button>
              </div>
              {showSensitive ? (
                <div className="grid grid-cols-1 gap-3">
                  <Field label="收件資訊" value={record.shipping_info} mono />
                  <Field label="匯款資訊" value={record.transfer_info} mono />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">點擊「顯示」查看收件及匯款資料</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
