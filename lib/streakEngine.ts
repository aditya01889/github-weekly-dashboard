import { WeeklyMetrics } from './github'
import { calculateVerdict } from './verdictEngine'
import { evaluateTargets } from './targetEngine'
import { getSnapshotsForStreak } from './snapshotEngine'

export interface StreakResult {
  currentStreak: number
  lastQualifiedWeek: string
  status: 'ACTIVE' | 'BROKEN'
  previousStreak: number
}

interface WeekData {
  weekDate: string
  qualifies: boolean
}

export async function calculateStreak(
  username: string,
  repos: any[],
  githubService: any,
  maxWeeks: number = 12
): Promise<StreakResult> {
  let currentStreak = 0
  let lastQualifiedWeek = ''

  // For efficiency, use snapshots instead of GitHub API calls
  try {
    const snapshots = await getSnapshotsForStreak(username.toString(), 'all', maxWeeks)
    
    // Calculate streak from snapshots
    for (const snapshot of snapshots) {
      if (snapshot.qualified) {
        currentStreak++
        lastQualifiedWeek = snapshot.week_start
      } else {
        // Break streak on first non-qualifying week
        break
      }
    }

    // Check if current week qualifies (first snapshot should be current week)
    const currentWeekQualifies = snapshots.length > 0 && snapshots[0].qualified

    return {
      currentStreak: currentWeekQualifies ? currentStreak : 0,
      lastQualifiedWeek,
      status: currentWeekQualifies ? 'ACTIVE' : 'BROKEN',
      previousStreak: currentStreak > 0 ? currentStreak : 0
    }
  } catch (error) {
    console.warn('Could not fetch snapshots for streak calculation:', error)
    
    // Fallback to minimal streak if snapshots unavailable
    return {
      currentStreak: 0,
      lastQualifiedWeek: '',
      status: 'BROKEN',
      previousStreak: 0
    }
  }
}
