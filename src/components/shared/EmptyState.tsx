import { PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  message?: string
  onAdd?: () => void
  addLabel?: string
}

export function EmptyState({ message = '目前沒有資料', onAdd, addLabel = '+ 新增第一筆' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageOpen size={48} className="text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground text-sm mb-4">{message}</p>
      {onAdd && (
        <Button onClick={onAdd} size="sm" className="rounded-xl bg-brand hover:bg-brand-dark">
          {addLabel}
        </Button>
      )}
    </div>
  )
}
