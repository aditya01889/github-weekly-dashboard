interface CompositionResult {
  deliveryPercent: number
  stabilityPercent: number
  qualityPercent: number
  dominantCategory: 'DELIVERY' | 'STABILITY' | 'QUALITY'
}

interface EffortCompositionProps {
  composition: CompositionResult
}

export function EffortComposition({ composition }: EffortCompositionProps) {
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

  // Handle zero activity case
  const totalPercent = composition.deliveryPercent + composition.stabilityPercent + composition.qualityPercent
  
  if (totalPercent === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">EFFORT COMPOSITION</h2>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-gray-600">No measurable activity this month.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">EFFORT COMPOSITION</h2>
      
      {/* Percentage Bars */}
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

      {/* Insight */}
      <div className="bg-white p-4 rounded-lg border">
        <div className={`text-sm font-medium ${getCategoryColor(composition.dominantCategory)}`}>
          {getInsightText(composition.dominantCategory)}
        </div>
      </div>
    </div>
  )
}
