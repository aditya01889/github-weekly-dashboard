import { supabase } from './supabase'

export interface WeeklySnapshot {
  id: string
  github_user_id: string
  week_start: string
  repo_scope: string
  metrics: any
  verdict: any
  targets: any
  qualified: boolean
  created_at: string
}

export async function getSnapshot(
  githubUserId: string,
  weekStart: string,
  repoScope: string
): Promise<WeeklySnapshot | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('weekly_snapshots')
    .select('*')
    .eq('github_user_id', githubUserId)
    .eq('week_start', weekStart)
    .eq('repo_scope', repoScope)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return data
}

export async function createSnapshot(
  githubUserId: string,
  weekStart: string,
  repoScope: string,
  metrics: any,
  verdict: any,
  targets: any,
  qualified: boolean
): Promise<WeeklySnapshot> {
  if (!supabase) {
    throw new Error('Supabase client not available')
  }
  
  const { data, error } = await supabase
    .from('weekly_snapshots')
    .insert({
      github_user_id: githubUserId,
      week_start: weekStart,
      repo_scope: repoScope,
      metrics,
      verdict,
      targets,
      qualified
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getSnapshotsForStreak(
  githubUserId: string,
  repoScope: string,
  limit: number = 12
): Promise<WeeklySnapshot[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('weekly_snapshots')
    .select('*')
    .eq('github_user_id', githubUserId)
    .eq('repo_scope', repoScope)
    .order('week_start', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data || []
}

export async function isCurrentWeek(weekStart: string): Promise<boolean> {
  const today = new Date()
  const weekStartObj = new Date(weekStart)
  const weekEnd = new Date(weekStartObj)
  weekEnd.setDate(weekEnd.getDate() + 6) // Add 6 days to get to Sunday
  
  return today >= weekStartObj && today <= weekEnd
}
