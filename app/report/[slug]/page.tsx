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
  
  // Parse slug to extract year and month (supports both "YYYY-MM" and "YYYY/MM" formats)
  let year: string
  let month: string
  
  if (slug.includes('-')) {
    // Handle YYYY-MM format
    const parts = slug.split('-')
    if (parts.length !== 2) {
      notFound()
    }
    [year, month] = parts
  } else if (slug.includes('/')) {
    // Handle YYYY/MM format
    const parts = slug.split('/')
    if (parts.length !== 2) {
      notFound()
    }
    [year, month] = parts
  } else {
    notFound()
  }
  
  // Validate year and month format
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    notFound()
  }

  // Validate month range
  const monthNum = parseInt(month)
  if (monthNum < 1 || monthNum > 12) {
    notFound()
  }

  // Validate year range (reasonable bounds)
  const yearNum = parseInt(year)
  if (yearNum < 2020 || yearNum > new Date().getFullYear() + 1) {
    notFound()
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Unavailable</h1>
          <p className="text-gray-600">Database connection not available.</p>
        </div>
      </div>
    )
  }

  try {
    // Parse month to get start and end dates
    const monthStart = new Date(yearNum, monthNum - 1, 1) // month is 0-indexed in JS
    const monthEnd = new Date(yearNum, monthNum, 0) // Last day of previous month

    // Get all weekly snapshots for the month (public view - no user filtering)
    const { data: snapshots, error } = await supabase
      .from('weekly_snapshots')
      .select('*')
      .gte('week_start', monthStart.toISOString().split('T')[0])
      .lte('week_start', monthEnd.toISOString().split('T')[0])
      .order('week_start', { ascending: true })

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

    if (!snapshots || snapshots.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h1>
            <p className="text-gray-600">No data available for this month.</p>
          </div>
        </div>
      )
    }

    // Aggregate metrics across all weeks (reuse logic from monthly view)
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

    // Calculate end-of-month streak (consecutive qualified weeks ending month)
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
    console.error('Error generating report:', error)
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
