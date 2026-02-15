import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month')
    
    if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

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
    const githubUserId = user.id.toString()

    // Parse month to get start and end dates
    const [year, month] = monthParam.split('-').map(Number)
    const monthStart = new Date(year, month - 1, 1) // month is 0-indexed in JS
    const monthEnd = new Date(year, month, 0) // Last day of previous month

    // Get all weekly snapshots for the month
    const { data: snapshots, error } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .eq('github_user_id', githubUserId)
      .eq('repo_scope', 'all')
      .gte('week_start', monthStart.toISOString().split('T')[0])
      .lte('week_start', monthEnd.toISOString().split('T')[0])
      .order('week_start', { ascending: true })

    if (error) {
      throw error
    }

    if (!snapshots || snapshots.length === 0) {
      return NextResponse.json({ 
        error: 'No data for this month' 
      }, { status: 404 })
    }

    // Aggregate metrics across all weeks
    const aggregatedMetrics = {
      activity: {
        commits: 0,
        prOpened: 0,
        prMerged: 0,
        featuresCompleted: 0
      },
      combat: {
        bugsFound: 0,
        bugsFixed: 0,
        openBugs: 0,
        bugFixRatio: 0
      },
      defense: {
        testsWritten: 0,
        ciRuns: 0
      }
    }

    let latestOpenBugs = 0

    // Sum up all weekly metrics
    for (const snapshot of snapshots) {
      const metrics = snapshot.metrics
      
      // Activity metrics (sum)
      aggregatedMetrics.activity.commits += metrics.activity.commits
      aggregatedMetrics.activity.prOpened += metrics.activity.prOpened
      aggregatedMetrics.activity.prMerged += metrics.activity.prMerged
      aggregatedMetrics.activity.featuresCompleted += metrics.activity.featuresCompleted
      
      // Combat metrics (sum)
      aggregatedMetrics.combat.bugsFound += metrics.combat.bugsFound
      aggregatedMetrics.combat.bugsFixed += metrics.combat.bugsFixed
      
      // Defense metrics (sum)
      aggregatedMetrics.defense.testsWritten += metrics.defense.testsWritten
      aggregatedMetrics.defense.ciRuns += metrics.defense.ciRuns
      
      // Track latest open bugs from the most recent week
      latestOpenBugs = metrics.combat.openBugs
    }

    // Set open bugs from latest week
    aggregatedMetrics.combat.openBugs = latestOpenBugs

    // Recalculate bug fix ratio safely
    if (aggregatedMetrics.combat.bugsFound > 0) {
      aggregatedMetrics.combat.bugFixRatio = 
        aggregatedMetrics.combat.bugsFixed / aggregatedMetrics.combat.bugsFound
    } else if (aggregatedMetrics.combat.bugsFixed > 0) {
      aggregatedMetrics.combat.bugFixRatio = 1 // All bugs fixed, none found
    } else {
      aggregatedMetrics.combat.bugFixRatio = 0 // No bugs found or fixed
    }

    // Count qualified weeks
    const qualifiedWeeks = snapshots.filter(snapshot => snapshot.qualified).length
    const totalWeeks = snapshots.length

    // Calculate monthly verdict
    let monthlyVerdict: string
    const qualifiedRatio = qualifiedWeeks / totalWeeks
    
    if (qualifiedRatio >= 1) {
      monthlyVerdict = 'STRONG_MONTH'
    } else if (qualifiedRatio >= 0.75) {
      monthlyVerdict = 'SOLID_MONTH'
    } else if (qualifiedRatio >= 0.25) {
      monthlyVerdict = 'UNSTABLE_MONTH'
    } else {
      monthlyVerdict = 'CHAOTIC_MONTH'
    }

    return NextResponse.json({
      metrics: aggregatedMetrics,
      qualifiedWeeks,
      totalWeeks,
      verdict: monthlyVerdict
    })

  } catch (error) {
    console.error('Error calculating monthly metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
