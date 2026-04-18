import { Suspense } from 'react'
import { EndorsersClient } from '@/components/endorsers/EndorsersClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: '代言人名單｜淨淨 CleanClean' }

export default function EndorsersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand mb-5">代言人名單</h1>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <EndorsersClient />
      </Suspense>
    </div>
  )
}
