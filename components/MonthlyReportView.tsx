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

interface CompositionResult {
  deliveryPercent: number
  stabilityPercent: number
  qualityPercent: number
  dominantCategory: 'DELIVERY' | 'STABILITY' | 'QUALITY'
}

interface MonthlyReportViewProps {
  data: MonthlyResponse
  composition: CompositionResult
  endOfMonthStreak: number
  year: number
  month: number
}

export function MonthlyReportView({ data, composition, endOfMonthStreak, year, month }: MonthlyReportViewProps) {
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

  const formatMonthYear = (year: number, month: number) => {
    const date = new Date(year, month - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DELIVERY':
        return 'text-blue-700'
      case 'STABILITY':
        return 'text-green-700'
      case 'QUALITY':
        return 'text-purple-700'
      default:
        return 'text-gray-700'
    }
  }

  const getInsightText = (category: string) => {
    switch (category) {
      case 'DELIVERY':
        return 'Focus this month was on delivering features and merging pull requests.'
      case 'STABILITY':
        return 'Focus this month was on fixing bugs and maintaining system stability.'
      case 'QUALITY':
        return 'Focus this month was on writing tests and improving code quality.'
      default:
        return 'Balanced effort across all development areas.'
    }
  }

  const getBarColor = (category: string, isDominant: boolean) => {
    if (isDominant) {
      switch (category) {
        case 'DELIVERY':
          return 'bg-blue-500'
        case 'STABILITY':
          return 'bg-green-500'
        case 'QUALITY':
          return 'bg-purple-500'
        default:
          return 'bg-gray-500'
      }
    } else {
      return 'bg-gray-300'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Report Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Monthly Performance Report
        </h1>
        <p className="text-gray-600">
          Development metrics and performance analysis for {formatMonthYear(year, month)}
        </p>
      </div>

      {/* Month Verdict Summary */}
      <div className="mb-8 bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Month Verdict Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Qualified Weeks</div>
            <div className="text-2xl font-bold text-gray-900">
              {data.qualifiedWeeks} / {data.totalWeeks}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Month Verdict</div>
            <div className={`text-2xl font-bold ${getVerdictColor(data.verdict)}`}>
              {getVerdictText(data.verdict)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">End-of-Month Streak</div>
            <div className="text-2xl font-bold text-gray-900">
              {endOfMonthStreak} Weeks
            </div>
          </div>
        </div>
      </div>

      {/* Effort Composition */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Effort Composition</h2>
        
        {/* Handle zero activity case */}
        {composition.deliveryPercent + composition.stabilityPercent + composition.qualityPercent === 0 ? (
          <div className="bg-white p-6 rounded-lg border text-center">
            <div className="text-gray-600">No measurable activity this month.</div>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-700">Delivery</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 ml-3">
                  <div 
                    className={`h-6 rounded-full ${getBarColor('DELIVERY', composition.dominantCategory === 'DELIVERY')}`}
                    style={{ width: `${composition.deliveryPercent}%` }}
                  />
                </div>
                <div className="ml-3 text-sm font-medium text-gray-700 w-12 text-right">
                  {composition.deliveryPercent}%
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-700">Stability</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 ml-3">
                  <div 
                    className={`h-6 rounded-full ${getBarColor('STABILITY', composition.dominantCategory === 'STABILITY')}`}
                    style={{ width: `${composition.stabilityPercent}%` }}
                  />
                </div>
                <div className="ml-3 text-sm font-medium text-gray-700 w-12 text-right">
                  {composition.stabilityPercent}%
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-700">Quality</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 ml-3">
                  <div 
                    className={`h-6 rounded-full ${getBarColor('QUALITY', composition.dominantCategory === 'QUALITY')}`}
                    style={{ width: `${composition.qualityPercent}%` }}
                  />
                </div>
                <div className="ml-3 text-sm font-medium text-gray-700 w-12 text-right">
                  {composition.qualityPercent}%
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className={`text-sm font-medium ${getCategoryColor(composition.dominantCategory)}`}>
                {getInsightText(composition.dominantCategory)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-8">
        {/* Activity Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery</h2>
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

        {/* Stability Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stability</h2>
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

        {/* Quality Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality</h2>
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

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>Generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-1">GitHub Weekly Performance Dashboard</p>
        </div>
      </div>
    </div>
  )
}
