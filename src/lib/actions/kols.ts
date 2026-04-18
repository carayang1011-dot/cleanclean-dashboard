'use server'
import { db as supabase } from '@/lib/supabase-server'
import { syncToSheets } from '@/lib/sheets-sync'
import type { Kol } from '@/lib/types'

export async function listKols(filters?: {
  level?: string
  platform?: string
  status?: string
  contact_owner?: string
  month?: number
  search?: string
}) {
  let query = supabase.from('kols').select('*').order('start_date', { ascending: false })

  if (filters?.level) query = query.eq('level', filters.level)
  if (filters?.platform) query = query.eq('platform', filters.platform)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.contact_owner) query = query.eq('contact_owner', filters.contact_owner)
  if (filters?.month) {
    const year = 2026
    const m = filters.month.toString().padStart(2, '0')
    query = query
      .gte('start_date', `${year}-${m}-01`)
      .lt('start_date', `${year}-${m.padStart(2,'0')}-01`.replace(`-${m}-`, `-${(filters.month % 12 + 1).toString().padStart(2,'0')}-`))
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,note.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Kol[]
}

export async function createKol(data: Omit<Kol, 'id' | 'created_at' | 'updated_at'>) {
  const { data: row, error } = await supabase.from('kols').insert(data).select().single()
  if (error) throw error
  syncToSheets('kols', 'create', row)
  return row as Kol
}

export async function updateKol(id: string, data: Partial<Kol>) {
  const { data: row, error } = await supabase.from('kols').update(data).eq('id', id).select().single()
  if (error) throw error
  syncToSheets('kols', 'update', row)
  return row as Kol
}

export async function deleteKol(id: string) {
  const { error } = await supabase.from('kols').delete().eq('id', id)
  if (error) throw error
  syncToSheets('kols', 'delete', { id })
}

export async function getKolSummary() {
  const { data, error } = await supabase
    .from('kols')
    .select('revenue, orders, aov, start_date')
    .gte('start_date', '2026-01-01')
    .lte('start_date', '2026-06-30')
  if (error) throw error
  return data
}
