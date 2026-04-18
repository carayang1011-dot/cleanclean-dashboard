'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Save, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSettings, updateSettings } from '@/lib/actions/settings'
import { supabase } from '@/lib/supabase'
import { useOperator } from '@/hooks/useOperator'
import { formatNTD } from '@/lib/format'
import type { Settings } from '@/lib/types'

const TABLES = ['kols', 'projects', 'invitations', 'podcasts', 'endorsers', 'reports', 'monthly_stats']

export default function SettingsPage() {
  const { operator } = useOperator()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [h1Target, setH1Target] = useState('')
  const [monthlyTargets, setMonthlyTargets] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')
  const [deleteTable, setDeleteTable] = useState('')

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s)
      setH1Target(String(s.h1_target))
      const mt: Record<string, string> = {}
      for (let i = 1; i <= 6; i++) mt[String(i)] = String(s.monthly_target[String(i)] ?? '')
      setMonthlyTargets(mt)
    }).catch(() => toast.error('載入設定失敗'))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const mt: Record<string, number> = {}
      for (let i = 1; i <= 6; i++) mt[String(i)] = parseInt(monthlyTargets[String(i)] || '0')
      await updateSettings({ h1_target: parseInt(h1Target), monthly_target: mt })
      toast.success('設定已儲存')
    } catch {
      toast.error('儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleClearTable = async () => {
    if (confirmDelete !== 'DELETE CONFIRM' || !deleteTable) return
    try {
      const { error } = await supabase.from(deleteTable as any).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      toast.success(`${deleteTable} 已清空`)
      setConfirmDelete('')
      setDeleteTable('')
    } catch {
      toast.error('清空失敗')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-brand">系統設定</h1>

      {/* KPI 目標設定 */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">KPI 目標設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">上半年目標業績</label>
            <Input
              value={h1Target}
              onChange={e => setH1Target(e.target.value)}
              type="number"
              className="rounded-xl max-w-xs"
              placeholder="2500000"
            />
            {h1Target && <p className="text-xs text-muted-foreground mt-1">{formatNTD(parseInt(h1Target))}</p>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-3 block">每月目標（1-6 月）</label>
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(m => (
                <div key={m}>
                  <label className="text-xs text-muted-foreground mb-1 block">{m} 月</label>
                  <Input
                    value={monthlyTargets[String(m)] ?? ''}
                    onChange={e => setMonthlyTargets(prev => ({ ...prev, [String(m)]: e.target.value }))}
                    type="number"
                    className="rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || !operator} className="rounded-xl bg-brand hover:bg-brand-dark gap-2">
            <Save size={14} />
            {saving ? '儲存中…' : '儲存設定'}
          </Button>
        </CardContent>
      </Card>

      {/* 危險區 */}
      <Card className="rounded-2xl shadow-sm border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-red-600">
            <AlertTriangle size={16} /> 危險區
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">清空指定資料表中的所有資料。此操作不可復原！</p>
          <div className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">選擇資料表</label>
              <select
                value={deleteTable}
                onChange={e => setDeleteTable(e.target.value)}
                className="border border-input rounded-xl px-3 py-1.5 text-sm bg-background"
              >
                <option value="">選擇表…</option>
                {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">輸入「DELETE CONFIRM」確認</label>
              <Input
                value={confirmDelete}
                onChange={e => setConfirmDelete(e.target.value)}
                className="rounded-xl max-w-56 border-red-200 focus:border-red-400"
                placeholder="DELETE CONFIRM"
              />
            </div>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={confirmDelete !== 'DELETE CONFIRM' || !deleteTable || !operator}
              onClick={handleClearTable}
            >
              清空資料表
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
