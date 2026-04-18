'use server'
import { db as supabase } from '@/lib/supabase-server'
import type { Invitation } from '@/lib/types'

export async function listInvitations(filters?: {
  owner?: string
  type?: string
  status?: string
  product?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}) {
  let query = supabase.from('invitations').select('*').order('created_at', { ascending: false })

  if (filters?.owner) query = query.eq('owner', filters.owner)
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.product) query = query.ilike('product', `%${filters.product}%`)
  if (filters?.dateFrom) query = query.gte('first_contact_date', filters.dateFrom)
  if (filters?.dateTo) query = query.lte('first_contact_date', filters.dateTo)
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,product.ilike.%${filters.search}%,note.ilike.%${filters.search}%,contact_log.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data as Invitation[]
}

export async function createInvitation(data: Omit<Invitation, 'id' | 'created_at' | 'updated_at'>) {
  const { data: row, error } = await supabase.from('invitations').insert(data).select().single()
  if (error) throw error
  return row as Invitation
}

export async function updateInvitation(id: string, data: Partial<Invitation>) {
  const { data: row, error } = await supabase.from('invitations').update(data).eq('id', id).select().single()
  if (error) throw error
  return row as Invitation
}

export async function deleteInvitation(id: string) {
  const { error } = await supabase.from('invitations').delete().eq('id', id)
  if (error) throw error
}
