import { Suspense } from 'react'
import { InvitationsClient } from '@/components/invitations/InvitationsClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: '邀約名單｜淨淨 CleanClean' }

export default function InvitationsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand mb-5">公關邀約名單</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <InvitationsClient />
      </Suspense>
    </div>
  )
}
