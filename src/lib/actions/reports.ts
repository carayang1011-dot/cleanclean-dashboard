'use server'
import { db as supabase } from '@/lib/supabase-server'
import { syncToSheets } from '@/lib/sheets-sync'
import type { Report } from '@/lib/types'

export async function listReports(kind?: string) {
  let query = supabase.from('reports').select('*').order('date', { ascending: false })
  if (kind) query = query.eq('kind', kind)
  const { data, error } = await query
  if (error) throw error
  return data as Report[]
}

export async function createReport(data: Omit<Report, 'id' | 'created_at' | 'updated_at'>) {
  const { data: row, error } = await supabase.from('reports').insert(data).select().single()
  if (error) throw error
  syncToSheets('reports', 'create', row)
  return row as Report
}

export async function updateReport(id: string, data: Partial<Report>) {
  const { data: row, error } = await supabase.from('reports').update(data).eq('id', id).select().single()
  if (error) throw error
  syncToSheets('reports', 'update', row)
  return row as Report
}

export async function deleteReport(id: string) {
  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (error) throw error
  syncToSheets('reports', 'delete', { id })
}
