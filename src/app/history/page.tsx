import { Suspense } from 'react'
import { HistoryClient } from '@/components/history/HistoryClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: '歷史合作名單｜淨淨 CleanClean' }

export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand mb-5">歷史合作名單</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <HistoryClient />
      </Suspense>
    </div>
  )
}
