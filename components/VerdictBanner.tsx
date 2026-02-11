interface VerdictBannerProps {
  verdict: {
    score: number
    label: 'STRONG' | 'SOLID' | 'CHAOTIC'
  }
  trend?: {
    trend: 'Improving' | 'Stable' | 'Declining' | 'Insufficient data'
    arrow: '↑' | '→' | '↓' | ''
  }
}

export function VerdictBanner({ verdict, trend }: VerdictBannerProps) {
  const getBgColor = (label: string) => {
    switch (label) {
      case 'STRONG':
        return 'bg-green-50 border-green-200'
      case 'SOLID':
        return 'bg-yellow-50 border-yellow-200'
      case 'CHAOTIC':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = (label: string) => {
    switch (label) {
      case 'STRONG':
        return 'text-green-800'
      case 'SOLID':
        return 'text-yellow-800'
      case 'CHAOTIC':
        return 'text-red-800'
      default:
        return 'text-gray-800'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Improving':
        return 'text-green-600'
      case 'Declining':
        return 'text-red-600'
      case 'Stable':
        return 'text-gray-600'
      default:
        return 'text-gray-500'
    }
  }

  const getHelperText = (label: string) => {
    switch (label) {
      case 'STRONG':
        return 'Momentum maintained.'
      case 'SOLID':
        return 'Stable progress.'
      case 'CHAOTIC':
        return 'Stability needs attention.'
      default:
        return ''
    }
  }

  return (
    <div className={`border rounded-lg p-6 mb-8 ${getBgColor(verdict.label)}`}>
      <div className="text-center">
        <div className={`text-3xl font-bold mb-2 ${getTextColor(verdict.label)}`}>
          WEEK VERDICT: {verdict.label}
        </div>
        <div className={`text-lg font-semibold mb-3 ${getTextColor(verdict.label)}`}>
          Score: {verdict.score}
        </div>
        <div className={`text-sm ${getTextColor(verdict.label)} opacity-75`}>
          {getHelperText(verdict.label)}
        </div>
        {trend && trend.trend !== 'Insufficient data' && (
          <div className={`mt-4 text-sm font-medium ${getTrendColor(trend.trend)}`}>
            3 Week Trend: {trend.trend} {trend.arrow}
          </div>
        )}
      </div>
    </div>
  )
}
