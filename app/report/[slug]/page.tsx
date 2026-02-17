import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calculateComposition } from '@/lib/compositionEngine'
import { MonthlyReportView } from '@/components/MonthlyReportView'

interface MonthlyMetrics {
  activity: {
    commits: number
    prOpened: number
    prMerged: number
    featuresCompleted: number
  }
  combat: {
    bugsFound: number
    bugsFixed: number
    openBugs: number
    bugFixRatio: number
  }
  defense: {
    testsWritten: number
    ciRuns: number
  }
}

interface MonthlyResponse {
  metrics: MonthlyMetrics
  qualifiedWeeks: number
  totalWeeks: number
  verdict: 'STRONG_MONTH' | 'SOLID_MONTH' | 'UNSTABLE_MONTH' | 'CHAOTIC_MONTH'
}

interface ReportPageProps {
  params: {
    slug: string
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { slug } = params
  
  console.log('=== REPORT PAGE START ===')
  console.log('Slug:', slug)
  
  // Parse slug to extract year and month
  let year: string
  let month: string
  
  if (slug.includes('-')) {
    const parts = slug.split('-')
    if (parts.length !== 2) {
      console.log('Invalid slug format with dash:', slug)
      notFound()
    }
    [year, month] = parts
  } else if (slug.includes('/')) {
    const parts = slug.split('/')
    if (parts.length !== 2) {
      console.log('Invalid slug format with slash:', slug)
      notFound()
    }
    [year, month] = parts
  } else {
    console.log('Unsupported slug format:', slug)
    notFound()
  }
  
  console.log('Parsed - Year:', year, 'Month:', month)
  
  // Validate year and month format
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    console.log('Invalid year/month format')
    notFound()
  }

  const monthNum = parseInt(month)
  if (monthNum < 1 || monthNum > 12) {
    console.log('Invalid month range:', monthNum)
    notFound()
  }

  const yearNum = parseInt(year)
  if (yearNum < 2020 || yearNum > new Date().getFullYear() + 1) {
    console.log('Invalid year range:', yearNum)
    notFound()
  }

  // Check Supabase availability
  if (!supabase) {
    console.log('Supabase not available')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Unavailable</h1>
          <p className="text-gray-600">Database connection not available.</p>
        </div>
      </div>
    )
  }

  console.log('Supabase available, proceeding with query')

  try {
    // Calculate date range
    const monthStart = new Date(yearNum, monthNum - 1, 1)
    const monthEnd = new Date(yearNum, monthNum, 0)
    
    const startDate = monthStart.toISOString().split('T')[0]
    const endDate = monthEnd.toISOString().split('T')[0]
    
    console.log('Date range:', startDate, 'to', endDate)

    // SINGLE EFFICIENT QUERY - Filter by user and date range
    console.log('Executing single database query...')
    const { data: snapshots, error } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .eq('repo_scope', 'all') // Filter by repo_scope instead of user_id (single user app)
      .gte('week_start', startDate)
      .lte('week_start', endDate)
      .order('week_start', { ascending: true })

    console.log('Query completed')
    console.log('Error:', error)
    console.log('Snapshots found:', snapshots?.length || 0)

    if (error) {
      console.error('Database error:', error)
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Error</h1>
            <p className="text-gray-600">Unable to fetch report data.</p>
          </div>
        </div>
      )
    }

    // Return immediately if no data
    if (!snapshots || snapshots.length === 0) {
      console.log('No data found, returning No Data page')
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h1>
            <p className="text-gray-600">No data available for {year}-{month}.</p>
          </div>
        </div>
      )
    }

    console.log('Processing', snapshots.length, 'snapshots')

    // Aggregate metrics (simple loop, no recursion)
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

    for (const snapshot of snapshots) {
      const metrics = snapshot.metrics
      
      aggregatedMetrics.activity.commits += metrics.activity.commits
      aggregatedMetrics.activity.prOpened += metrics.activity.prOpened
      aggregatedMetrics.activity.prMerged += metrics.activity.prMerged
      aggregatedMetrics.activity.featuresCompleted += metrics.activity.featuresCompleted
      
      aggregatedMetrics.combat.bugsFound += metrics.combat.bugsFound
      aggregatedMetrics.combat.bugsFixed += metrics.combat.bugsFixed
      
      aggregatedMetrics.defense.testsWritten += metrics.defense.testsWritten
      aggregatedMetrics.defense.ciRuns += metrics.defense.ciRuns
      
      latestOpenBugs = metrics.combat.openBugs
    }

    aggregatedMetrics.combat.openBugs = latestOpenBugs

    // Calculate bug fix ratio
    if (aggregatedMetrics.combat.bugsFound > 0) {
      aggregatedMetrics.combat.bugFixRatio = aggregatedMetrics.combat.bugsFixed / aggregatedMetrics.combat.bugsFound
    } else if (aggregatedMetrics.combat.bugsFixed > 0) {
      aggregatedMetrics.combat.bugFixRatio = 1
    } else {
      aggregatedMetrics.combat.bugFixRatio = 0
    }

    // Calculate qualified weeks and verdict
    const qualifiedWeeks = snapshots.filter(snapshot => snapshot.qualified).length
    const totalWeeks = snapshots.length
    const qualifiedRatio = qualifiedWeeks / totalWeeks
    
    let monthlyVerdict: string
    if (qualifiedRatio >= 1) {
      monthlyVerdict = 'STRONG_MONTH'
    } else if (qualifiedRatio >= 0.75) {
      monthlyVerdict = 'SOLID_MONTH'
    } else if (qualifiedRatio >= 0.25) {
      monthlyVerdict = 'UNSTABLE_MONTH'
    } else {
      monthlyVerdict = 'CHAOTIC_MONTH'
    }

    // Calculate end-of-month streak
    let endOfMonthStreak = 0
    for (let i = snapshots.length - 1; i >= 0; i--) {
      if (snapshots[i].qualified) {
        endOfMonthStreak++
      } else {
        break
      }
    }

    const reportData: MonthlyResponse = {
      metrics: aggregatedMetrics,
      qualifiedWeeks,
      totalWeeks,
      verdict: monthlyVerdict as any
    }

    const composition = calculateComposition(aggregatedMetrics)

    console.log('=== REPORT PAGE SUCCESS ===')
    console.log('Returning report with', qualifiedWeeks, 'qualified weeks')

    return (
      <div className="min-h-screen bg-gray-50">
        <MonthlyReportView 
          data={reportData}
          composition={composition}
          endOfMonthStreak={endOfMonthStreak}
          year={yearNum}
          month={monthNum}
        />
      </div>
    )
  } catch (error) {
    console.error('=== REPORT PAGE ERROR ===', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Error</h1>
          <p className="text-gray-600">Unable to generate monthly report.</p>
        </div>
      </div>
    )
  }
}
