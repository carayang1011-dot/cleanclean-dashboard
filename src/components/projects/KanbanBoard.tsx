'use client'

import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { ProjectTypeBadge, OwnerBadge } from '@/components/shared/StatusBadge'
import { formatDateRange } from '@/lib/format'
import type { Project } from '@/lib/types'
import { PROJECT_STAGES } from '@/lib/types'

interface Props {
  projects: Project[]
  onMoveStage: (id: string, stage: string) => void
  onEdit: (project: Project) => void
}

export function KanbanBoard({ projects, onMoveStage, onEdit }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const targetStage = over.id as string
      if (PROJECT_STAGES.includes(targetStage as typeof PROJECT_STAGES[number])) {
        onMoveStage(active.id as string, targetStage)
      }
    }
  }

  const stageLabels: Record<string, string> = {
    '洽談中': '洽談中',
    '合作確認（條件定案）': '合作確認',
    '素材／資源準備（含寄樣、文案、表單）': '素材準備',
    '上線執行（開團／曝光中）': '上線執行',
    '結案回報': '結案回報',
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {PROJECT_STAGES.map(stage => {
          const cards = projects.filter(p => p.stage === stage)
          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              label={stageLabels[stage] ?? stage}
              cards={cards}
              onEdit={onEdit}
            />
          )
        })}
      </div>
    </DndContext>
  )
}

function KanbanColumn({ stage, label, cards, onEdit }: {
  stage: string; label: string; cards: Project[]; onEdit: (p: Project) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return (
    <div
      ref={setNodeRef}
      className={`min-w-56 w-56 shrink-0 rounded-2xl p-3 transition-colors ${isOver ? 'bg-brand-light/60' : 'bg-gray-100/70'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground">{label}</h3>
        <span className="text-xs bg-white rounded-full px-2 py-0.5 text-muted-foreground">{cards.length}</span>
      </div>
      <div className="space-y-2">
        {cards.map(p => <KanbanCard key={p.id} project={p} onEdit={onEdit} />)}
      </div>
    </div>
  )
}

function KanbanCard({ project, onEdit }: { project: Project; onEdit: (p: Project) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: project.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-xl p-3 shadow-sm border cursor-grab active:cursor-grabbing transition-shadow
        ${isDragging ? 'shadow-md opacity-80' : 'hover:shadow-md'}`}
      onClick={() => onEdit(project)}
    >
      <p className="font-medium text-sm mb-2">{project.name}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        <ProjectTypeBadge type={project.type} />
      </div>
      <div className="flex items-center justify-between">
        <OwnerBadge owner={project.owner} />
        <span className="text-xs text-muted-foreground">{formatDateRange(project.start_date, project.end_date)}</span>
      </div>
      {project.next_step && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">→ {project.next_step}</p>
      )}
    </div>
  )
}
