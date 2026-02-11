import { WeeklyMetrics } from './github'
import { calculateVerdict } from './verdictEngine'
import { evaluateTargets } from './targetEngine'

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
  const weeksData: WeekData[] = []
  let currentStreak = 0
  let lastQualifiedWeek = ''

  // Compute data for current week and previous weeks
  for (let weeksAgo = 0; weeksAgo < maxWeeks; weeksAgo++) {
    try {
      const weekRange = githubService.getWeekRange(new Date(), weeksAgo)
      const metrics = await githubService.calculateWeeklyMetrics(repos, username, weekRange)
      const verdict = calculateVerdict(metrics)
      const targets = evaluateTargets(metrics)
      
      const qualifies = verdict.label !== 'CHAOTIC' && targets.overallStatus === 'ON_TRACK'
      
      const weekDate = weekRange.startDate.toISOString().split('T')[0] // YYYY-MM-DD format
      
      weeksData.push({
        weekDate,
        qualifies
      })

      // Calculate streak
      if (qualifies) {
        if (weeksAgo === 0) {
          // Current week qualifies
          currentStreak++
        } else if (currentStreak > 0) {
          // Continue streak
          currentStreak++
        }
        lastQualifiedWeek = weekDate
      } else {
        // Break streak
        if (currentStreak > 0) {
          // Streak broken, but we keep the previous length
          // currentStreak will be reset to 0 below
        }
      }
    } catch (error) {
      console.warn(`Could not fetch data for week ${weeksAgo} ago:`, error)
      // Add non-qualifying week to maintain timeline
      const weekRange = githubService.getWeekRange(new Date(), weeksAgo)
      weeksData.push({
        weekDate: weekRange.startDate.toISOString().split('T')[0],
        qualifies: false
      })
    }
  }

  // Reset current streak if current week doesn't qualify
  const currentWeekQualifies = weeksData.find(w => w.weekDate === weeksData[0]?.weekDate)?.qualifies
  if (!currentWeekQualifies) {
    const previousStreakLength = currentStreak
    currentStreak = 0
  }

  return {
    currentStreak,
    lastQualifiedWeek: lastQualifiedWeek || weeksData[0]?.weekDate || '',
    status: currentWeekQualifies ? 'ACTIVE' : 'BROKEN',
    previousStreak: currentStreak > 0 ? currentStreak : 0
  }
}
