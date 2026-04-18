'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Target, TrendingDown, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getSettings } from '@/lib/actions/settings'
import { getKolSummary } from '@/lib/actions/kols'
import { listReports } from '@/lib/actions/reports'
import { listProjects } from '@/lib/actions/projects'
import { formatNTD } from '@/lib/format'
import type { Settings, Report } from '@/lib/types'

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月']
const PIE_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4']

const DIMENSIONS = [
  { label: '團購開發', target: 48, done: 31 },
  { label: 'S 級名單', target: 5, done: 0 },
  { label: 'KOL 業配', target: 12, done: 2 },
  { label: 'Podcast', target: 2, done: 0 },
  { label: '口碑操作', target: 5, done: 0 },
  { label: '廣編文', target: 2, done: 0 },
  { label: '代言人', target: 100, done: 10 },
]

export default function DashboardPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [h1Revenue, setH1Revenue] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(Array(6).fill(0))
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [upcomingItems, setUpcomingItems] = useState<{ name: string; date: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [settingsData, kolsData, reportsData, projectsData] = await Promise.all([
        getSettings().catch(() => null),
        getKolSummary().catch(() => []),
        listReports().catch(() => []),
        listProjects().catch(() => []),
      ])

      if (settingsData) setSettings(settingsData as Settings)

      if (kolsData?.length) {
        const monthly = Array(6).fill(0)
        let total = 0
        kolsData.forEach(k => {
          if (k.start_date && k.revenue) {
            const m = new Date(k.start_date).getMonth()
            if (m >= 0 && m < 6) { monthly[m] += Number(k.revenue); total += Number(k.revenue) }
          }
        })
        setH1Revenue(total)
        setMonthlyRevenue(monthly)
      }

      if (reportsData?.length) setRecentReports(reportsData.slice(0, 3) as Report[])

      if (projectsData?.length) {
        const now = new Date()
        const soon = projectsData
          .filter(p => {
            if (!p.start_date) return false
            const diff = (new Date(p.start_date).getTime() - now.getTime()) / 86400000
            return diff >= -7 && diff <= 14
          })
          .map(p => ({ name: p.name, date: p.start_date! }))
          .slice(0, 6)
        setUpcomingItems(soon)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const target = settings?.h1_target ?? 2500000
  const rate = target > 0 ? (h1Revenue / target) * 100 : 0
  const gap = Math.max(0, target - h1Revenue)
  const rateColor = rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
  const rateText = rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-orange-600'

  const pieData = monthlyRevenue.map((v, i) => ({ name: MONTH_NAMES[i], value: v }))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-brand">儀表板概覽</h1>

      {/* Row 1: KPI 四卡 */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={<Target size={20} className="text-brand" />} label="上半年目標" value={formatNTD(target)} sub="2026 H1" />
          <KpiCard icon={<TrendingUp size={20} className="text-green-600" />} label="累計業績" value={formatNTD(h1Revenue)} sub="已實現" />
          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">達成率</p>
                <span className={`text-sm font-bold ${rateText}`}>{rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className={`h-3 rounded-full transition-all ${rateColor}`} style={{ width: `${Math.min(rate, 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{formatNTD(h1Revenue)} / {formatNTD(target)}</p>
            </CardContent>
          </Card>
          <KpiCard icon={<TrendingDown size={20} className="text-orange-500" />} label="距目標還差" value={formatNTD(gap)} sub="需再達成" highlight />
        </div>
      )}

      {/* Row 2+3: 圓餅圖 + 七大維度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">月份業績分布（點擊跳轉篩選）</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full rounded-xl" /> : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      paddingAngle={2} dataKey="value"
                      onClick={(_, i) => router.push(`/kols?month=${i + 1}`)}
                      className="cursor-pointer">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatNTD(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {MONTH_NAMES.map((name, i) => (
                    <button key={name} onClick={() => router.push(`/kols?month=${i + 1}`)}
                      className="flex items-center gap-1 text-xs hover:opacity-80">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_COLORS[i] }} />
                      {name}：{formatNTD(monthlyRevenue[i])}
                    </button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">七大維度進度</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DIMENSIONS.map(d => {
              const pct = d.target > 0 ? Math.round((d.done / d.target) * 100) : 0
              return (
                <div key={d.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{d.label}</span>
                    <span className="text-muted-foreground">{d.done}/{d.target} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: 近期待上線 + 最新報告 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar size={14} className="text-brand" /> 近期待上線（±7 天）
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-32 w-full rounded-xl" /> : upcomingItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">近期無預定上線項目</p>
            ) : (
              <ul className="space-y-2">
                {upcomingItems.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2 last:pb-0">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">最新報告</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-32 w-full rounded-xl" /> : recentReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無報告記錄</p>
            ) : (
              <ul className="space-y-3">
                {recentReports.map(r => (
                  <li key={r.id} className="border-b last:border-b-0 pb-2 last:pb-0">
                    <p className="font-medium text-sm">{r.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.date && <span className="text-xs text-muted-foreground">{r.date}</span>}
                      {r.author && <span className="text-xs bg-brand-light text-brand px-1.5 py-0.5 rounded-lg">{r.author}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, sub, highlight }: {
  icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean
}) {
  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
        <p className={`text-xl font-bold ${highlight ? 'text-orange-500' : 'text-foreground'}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}
