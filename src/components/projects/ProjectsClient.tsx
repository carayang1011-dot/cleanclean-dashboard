'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectTypeBadge, OwnerBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { KanbanBoard } from './KanbanBoard'
import { ProjectDialog } from './ProjectDialog'
import { listProjects, createProject, updateProject, deleteProject } from '@/lib/actions/projects'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useOperator } from '@/hooks/useOperator'
import { formatDateRange } from '@/lib/format'
import type { Project } from '@/lib/types'
import { PROJECT_TYPES, PROJECT_STATUSES, INVITATION_OWNERS } from '@/lib/types'

const ALL = '全部'

export function ProjectsClient() {
  const { operator } = useOperator()
  const [data, setData] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [type, setType] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [owner, setOwner] = useState(ALL)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await listProjects()
      setData(rows)
    } catch {
      toast.error('載入失敗')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtimeTable('projects', fetchData)

  const filtered = useMemo(() => data.filter(r => {
    if (type !== ALL && r.type !== type) return false
    if (status !== ALL && r.status !== status) return false
    if (owner !== ALL && r.owner !== owner) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [data, type, status, owner, search])

  const handleSave = async (formData: Partial<Project>) => {
    const payload = { ...formData, updated_by: operator ?? '訪客' } as Omit<Project, 'id' | 'created_at' | 'updated_at'>
    try {
      if (editTarget) {
        await updateProject(editTarget.id, payload)
        toast.success('已更新')
      } else {
        await createProject(payload)
        toast.success('已新增')
      }
      fetchData()
    } catch {
      toast.error('儲存失敗')
    }
  }

  const handleMoveStage = async (id: string, stage: string) => {
    try {
      await updateProject(id, { stage, updated_by: operator ?? '訪客' })
      setData(prev => prev.map(p => p.id === id ? { ...p, stage } : p))
    } catch {
      toast.error('更新失敗')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id)
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
      {/* 頂部列 */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <Tabs value={view} onValueChange={v => setView(v as 'kanban' | 'table')}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="kanban" className="rounded-xl text-xs">看板</TabsTrigger>
            <TabsTrigger value="table" className="rounded-xl text-xs">表格</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-7 rounded-xl h-8 text-xs w-40" placeholder="搜尋名稱" />
        </div>
        <SF label="類型" value={type} onChange={setType} opts={PROJECT_TYPES as unknown as string[]} />
        <SF label="狀態" value={status} onChange={setStatus} opts={PROJECT_STATUSES as unknown as string[]} />
        <SF label="負責人" value={owner} onChange={setOwner} opts={INVITATION_OWNERS as unknown as string[]} />
        <Button size="sm" className="rounded-xl bg-brand hover:bg-brand-dark gap-1 ml-auto"
          onClick={() => { setEditTarget(null); setDialogOpen(true) }}>
          <Plus size={14} /> 新增
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : view === 'kanban' ? (
        <KanbanBoard
          projects={filtered}
          onMoveStage={handleMoveStage}
          onEdit={p => { setEditTarget(p); setDialogOpen(true) }}
        />
      ) : (
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
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-32"><EmptyState onAdd={() => { setEditTarget(null); setDialogOpen(true) }} /></TableCell></TableRow>
              ) : filtered.map(row => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-gray-50"
                  onClick={() => { setEditTarget(row); setDialogOpen(true) }}>
                  <TableCell className="font-medium text-sm">{row.name}</TableCell>
                  <TableCell><ProjectTypeBadge type={row.type} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.status ?? '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-36 truncate">{row.stage ?? '—'}</TableCell>
                  <TableCell><OwnerBadge owner={row.owner} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateRange(row.start_date, row.end_date)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-48 truncate">{row.next_step ?? '—'}</TableCell>
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
      )}

      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editTarget} onSave={handleSave} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}
        title="刪除專案" description={`確定要刪除「${deleteTarget?.name}」？此操作不可復原。`}
        onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}

function SF({ label, value, onChange, opts }: { label: string; value: string; onChange: (v: string) => void; opts: string[] }) {
  return (
    <Select value={value} onValueChange={v => onChange(v ?? '')}>
      <SelectTrigger className="h-8 rounded-xl text-xs w-28"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}：全部</SelectItem>
        {opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
