import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { GitHubService } from '@/lib/github'
import { calculateVerdict, calculateTrend, getVerdictHelperText } from '@/lib/verdictEngine'

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
    const previousWeekRange = githubService.getWeekRange(new Date(), 1)

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

    // Calculate current week metrics
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
