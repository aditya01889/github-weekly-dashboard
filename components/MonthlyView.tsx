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

interface MonthlyViewProps {
  data: MonthlyResponse
  monthYear: string
}

import { calculateComposition } from '@/lib/compositionEngine'
import { EffortComposition } from '@/components/EffortComposition'

export function MonthlyView({ data, monthYear }: MonthlyViewProps) {
  const composition = calculateComposition(data.metrics)

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'STRONG_MONTH':
        return 'text-green-700'
      case 'SOLID_MONTH':
        return 'text-yellow-700'
      case 'UNSTABLE_MONTH':
        return 'text-orange-700'
      case 'CHAOTIC_MONTH':
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case 'STRONG_MONTH':
        return 'STRONG'
      case 'SOLID_MONTH':
        return 'SOLID'
      case 'UNSTABLE_MONTH':
        return 'UNSTABLE'
      case 'CHAOTIC_MONTH':
        return 'CHAOTIC'
      default:
        return 'UNKNOWN'
    }
  }

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div>
      {/* Monthly Summary Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          MONTHLY SUMMARY — {formatMonthYear(monthYear)}
        </h1>
        <div className="space-y-2">
          <div className="text-lg font-medium text-gray-700">
            Qualified Weeks: {data.qualifiedWeeks} / {data.totalWeeks}
          </div>
          <div className={`text-lg font-semibold ${getVerdictColor(data.verdict)}`}>
            Month Verdict: {getVerdictText(data.verdict)}
          </div>
        </div>
      </div>

      {/* Effort Composition */}
      <EffortComposition composition={composition} />

      {/* Metric Sections */}
      <div className="space-y-8">
        {/* Activity Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Commits</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.activity.commits}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">PR Opened</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.activity.prOpened}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">PR Merged</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.activity.prMerged}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Features Completed</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.activity.featuresCompleted}</div>
            </div>
          </div>
        </div>

        {/* Combat Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Combat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Bugs Found</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.combat.bugsFound}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Bugs Fixed</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.combat.bugsFixed}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Open Bugs</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.combat.openBugs}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Bug Fix Ratio</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.combat.bugFixRatio.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Defense Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Defense</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Tests Written</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.defense.testsWritten}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">CI Runs</div>
              <div className="text-2xl font-bold text-gray-900">{data.metrics.defense.ciRuns}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
