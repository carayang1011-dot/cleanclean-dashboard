import { HistoryClient } from '@/components/history/HistoryClient'
import { listHistory } from '@/lib/actions/history'

export const metadata = { title: '歷史合作名單｜淨淨 CleanClean' }

export default async function HistoryPage() {
  const data = await listHistory()
  return (
    <div>
      <h1 className="text-xl font-bold text-brand mb-5">歷史合作名單</h1>
      <HistoryClient initialData={data} />
    </div>
  )
}
