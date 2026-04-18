import { Suspense } from 'react'
import { KolsClient } from '@/components/kols/KolsClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'KOL/KOC 追蹤｜淨淨 CleanClean' }

export default function KolsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand mb-5">KOL / KOC 追蹤表</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <KolsClient />
      </Suspense>
    </div>
  )
}
