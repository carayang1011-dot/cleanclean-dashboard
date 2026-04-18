'use server'
import { db as supabase } from '@/lib/supabase-server'
import { syncToSheets } from '@/lib/sheets-sync'
import type { Podcast } from '@/lib/types'

export async function listPodcasts() {
  const { data, error } = await supabase.from('podcasts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Podcast[]
}

export async function createPodcast(data: Omit<Podcast, 'id' | 'created_at' | 'updated_at'>) {
  const { data: row, error } = await supabase.from('podcasts').insert(data).select().single()
  if (error) throw error
  syncToSheets('podcasts', 'create', row)
  return row as Podcast
}

export async function updatePodcast(id: string, data: Partial<Podcast>) {
  const { data: row, error } = await supabase.from('podcasts').update(data).eq('id', id).select().single()
  if (error) throw error
  syncToSheets('podcasts', 'update', row)
  return row as Podcast
}

export async function deletePodcast(id: string) {
  const { error } = await supabase.from('podcasts').delete().eq('id', id)
  if (error) throw error
  syncToSheets('podcasts', 'delete', { id })
}
