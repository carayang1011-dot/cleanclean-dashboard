'use server'
import { db as supabase } from '@/lib/supabase-server'
import { syncToSheets } from '@/lib/sheets-sync'
import type { MonthlyStat } from '@/lib/types'

export async function listMonthlyStats() {
  const { data, error } = await supabase.from('monthly_stats').select('*').order('month')
  if (error) throw error
  return data as MonthlyStat[]
}

export async function upsertMonthlyStat(month: number, data: Partial<MonthlyStat>) {
  const { data: row, error } = await supabase
    .from('monthly_stats')
    .upsert({ month, ...data })
    .select()
    .single()
  if (error) throw error
  syncToSheets('monthly_stats', 'update', row)
  return row as MonthlyStat
}
