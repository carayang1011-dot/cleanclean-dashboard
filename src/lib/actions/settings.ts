'use server'
import { db as supabase } from '@/lib/supabase-server'
import type { Settings } from '@/lib/types'

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single()
  if (error) throw error
  return data as Settings
}

export async function updateSettings(data: Partial<Omit<Settings, 'id' | 'updated_at'>>) {
  const { data: row, error } = await supabase.from('settings').update(data).eq('id', 1).select().single()
  if (error) throw error
  return row as Settings
}
