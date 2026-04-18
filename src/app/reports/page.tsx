import { Suspense } from 'react'
import { ReportsClient } from '@/components/reports/ReportsClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: '週報 / 月報｜淨淨 CleanClean' }

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand mb-5">週報 / 月報 / 會議記錄</h1>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <ReportsClient />
      </Suspense>
    </div>
  )
}
