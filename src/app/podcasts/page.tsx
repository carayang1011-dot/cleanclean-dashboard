import { Suspense } from 'react'
import { PodcastsClient } from '@/components/podcasts/PodcastsClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Podcast 合作｜淨淨 CleanClean' }

export default function PodcastsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand mb-5">Podcast 合作</h1>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <PodcastsClient />
      </Suspense>
    </div>
  )
}
