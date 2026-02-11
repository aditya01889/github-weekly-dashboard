import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { GitHubService } from '@/lib/github'
import { calculateVerdict, calculateTrend, getVerdictHelperText } from '@/lib/verdictEngine'
import { evaluateTargets } from '@/lib/targetEngine'
import { calculateStreak } from '@/lib/streakEngine'
import { getSnapshot, createSnapshot, isCurrentWeek } from '@/lib/snapshotEngine'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const repoParam = searchParams.get('repo') || 'all'

    const githubService = new GitHubService(session.accessToken)
    const currentWeekRange = githubService.getWeekRange()
    const weekStartDate = currentWeekRange.startDate.toISOString().split('T')[0] // YYYY-MM-DD format

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }
    
    const user = await userResponse.json()
    const username = user.login
    const githubUserId = user.id.toString()

    // Check if this is current week or past week
    const currentWeekCheck = await isCurrentWeek(weekStartDate)
    
    // For past weeks, check if snapshot exists
    if (!currentWeekCheck) {
      const existingSnapshot = await getSnapshot(githubUserId, weekStartDate, repoParam)
      
      if (existingSnapshot) {
        // Return existing snapshot
        return NextResponse.json({
          weekRange: {
            start: currentWeekRange.start,
            end: currentWeekRange.end,
            startDate: currentWeekRange.startDate.toISOString(),
            endDate: currentWeekRange.endDate.toISOString()
          },
          repositories: repoParam === 'all' ? [] : [repoParam],
          metrics: existingSnapshot.metrics,
          verdict: existingSnapshot.verdict,
          targets: existingSnapshot.targets,
          streak: {
            currentStreak: 0, // Will be calculated separately for past weeks
            lastQualifiedWeek: '',
            status: 'BROKEN',
            previousStreak: 0
          },
          user: {
            username,
            name: user.name,
            avatar: user.avatar_url
          }
        })
      }
    }

    // Get repositories
    const allRepos = await githubService.getUserRepos()
    
    // Filter repositories based on repo parameter
    let repos = allRepos
    if (repoParam !== 'all') {
      repos = allRepos.filter(repo => repo.full_name === repoParam)
    }

    if (repos.length === 0) {
      return NextResponse.json({ 
        error: repoParam === 'all' ? 'No repositories found' : 'Repository not found' 
      }, { status: 404 })
    }

    // Compute live data for current week or missing past week
    const previousWeekRange = githubService.getWeekRange(new Date(), 1)
    const currentMetrics = await githubService.calculateWeeklyMetrics(repos, username, currentWeekRange)
    
    // Calculate previous week metrics for comparison
    let previousMetrics
    try {
      previousMetrics = await githubService.calculateWeeklyMetrics(repos, username, previousWeekRange)
    } catch (error) {
      console.warn('Could not fetch previous week metrics:', error)
      previousMetrics = undefined
    }

    // Calculate verdict
    const verdict = calculateVerdict(currentMetrics, previousMetrics)
    
    // Calculate targets
    const targets = evaluateTargets(currentMetrics)
    
    // Calculate streak
    const streak = await calculateStreak(username, repos, githubService)

    // Store snapshot for past weeks (not current week)
    if (!currentWeekCheck) {
      try {
        await createSnapshot(
          githubUserId,
          weekStartDate,
          repoParam,
          currentMetrics,
          verdict,
          targets,
          verdict.label !== 'CHAOTIC' && targets.overallStatus === 'ON_TRACK'
        )
      } catch (error) {
        console.warn('Could not create snapshot:', error)
        // Continue even if snapshot creation fails
      }
    }

    return NextResponse.json({
      weekRange: {
        start: currentWeekRange.start,
        end: currentWeekRange.end,
        startDate: currentWeekRange.startDate.toISOString(),
        endDate: currentWeekRange.endDate.toISOString()
      },
      repositories: repoParam === 'all' ? repos.map(r => r.full_name) : [repoParam],
      metrics: currentMetrics,
      verdict: {
        score: verdict.score,
        label: verdict.label
      },
      targets: {
        prMerged: targets.prMerged,
        featuresCompleted: targets.featuresCompleted,
        bugFixRatio: targets.bugFixRatio,
        testsWritten: targets.testsWritten,
        completionRate: targets.completionRate,
        overallStatus: targets.overallStatus
      },
      streak: {
        currentStreak: streak.currentStreak,
        lastQualifiedWeek: streak.lastQualifiedWeek,
        status: streak.status,
        previousStreak: streak.previousStreak
      },
      user: {
        username,
        name: user.name,
        avatar: user.avatar_url
      }
    })

  } catch (error) {
    console.error('Error calculating weekly metrics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    )
  }
}
