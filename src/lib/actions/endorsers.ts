'use server'
import { db as supabase } from '@/lib/supabase-server'
import type { Endorser } from '@/lib/types'

export async function listEndorsers() {
  const { data, error } = await supabase.from('endorsers').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Endorser[]
}

export async function createEndorser(data: Omit<Endorser, 'id' | 'created_at' | 'updated_at'>) {
  const { data: row, error } = await supabase.from('endorsers').insert(data).select().single()
  if (error) throw error
  return row as Endorser
}

export async function updateEndorser(id: string, data: Partial<Endorser>) {
  const { data: row, error } = await supabase.from('endorsers').update(data).eq('id', id).select().single()
  if (error) throw error
  return row as Endorser
}

export async function deleteEndorser(id: string) {
  const { error } = await supabase.from('endorsers').delete().eq('id', id)
  if (error) throw error
}
