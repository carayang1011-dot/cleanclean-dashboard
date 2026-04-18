'use server'
import { db as supabase } from '@/lib/supabase-server'
import type { Project } from '@/lib/types'

export async function listProjects(filters?: {
  type?: string
  status?: string
  owner?: string
  search?: string
}) {
  let query = supabase.from('projects').select('*').order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.owner) query = query.eq('owner', filters.owner)
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return data as Project[]
}

export async function createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data: row, error } = await supabase.from('projects').insert(data).select().single()
  if (error) throw error
  return row as Project
}

export async function updateProject(id: string, data: Partial<Project>) {
  const { data: row, error } = await supabase.from('projects').update(data).eq('id', id).select().single()
  if (error) throw error
  return row as Project
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
