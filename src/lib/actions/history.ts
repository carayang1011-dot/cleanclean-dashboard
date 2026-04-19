'use server'
import { db as supabase } from '@/lib/supabase-server'
import type { HistoryRecord } from '@/lib/types'

export async function listHistory(): Promise<HistoryRecord[]> {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .order('start_date', { ascending: false })
  if (error) throw error
  return data as HistoryRecord[]
}
