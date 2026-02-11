import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { GitHubService } from '@/lib/github'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const repoParam = searchParams.get('repo') || 'all'

    const githubService = new GitHubService(session.accessToken)
    const weekRange = githubService.getWeekRange()

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

    // Calculate metrics
    const metrics = await githubService.calculateWeeklyMetrics(repos, username, weekRange)

    return NextResponse.json({
      weekRange: {
        start: weekRange.start,
        end: weekRange.end,
        startDate: weekRange.startDate.toISOString(),
        endDate: weekRange.endDate.toISOString()
      },
      repositories: repoParam === 'all' ? repos.map(r => r.full_name) : [repoParam],
      metrics,
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
