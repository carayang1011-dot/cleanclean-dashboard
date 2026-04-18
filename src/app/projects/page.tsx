import { Suspense } from 'react'
import { ProjectsClient } from '@/components/projects/ProjectsClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: '合作專案｜淨淨 CleanClean' }

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand mb-5">其他合作專案</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <ProjectsClient />
      </Suspense>
    </div>
  )
}
