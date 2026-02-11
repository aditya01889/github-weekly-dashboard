interface TargetProgressProps {
  targets: {
    prMerged: { current: number; target: number; met: boolean }
    featuresCompleted: { current: number; target: number; met: boolean }
    bugFixRatio: { current: number; target: number; met: boolean }
    testsWritten: { current: number; target: number; met: boolean }
  }
  completionRate: number
  overallStatus: 'ON_TRACK' | 'AT_RISK'
}

export function TargetProgress({ targets, completionRate, overallStatus }: TargetProgressProps) {
  const getStatusColor = (met: boolean) => {
    return met ? 'text-green-600' : 'text-gray-600'
  }

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'AT_RISK':
        return 'text-amber-700 bg-amber-50 border-amber-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getOverallStatusText = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return 'On Track'
      case 'AT_RISK':
        return 'At Risk'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">WEEKLY TARGET PROGRESS</h2>
      
      {/* Target Checklist */}
      <div className="space-y-3 mb-6">
        <div className={`flex items-center justify-between p-3 rounded border ${getStatusColor(targets.prMerged.met)}`}>
          <span className="flex items-center">
            {targets.prMerged.met ? (
              <span className="text-green-600 mr-2">[✓]</span>
            ) : (
              <span className="text-gray-400 mr-2">[ ]</span>
            )}
            PR Merged ({targets.prMerged.current} / {targets.prMerged.target})
          </span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded border ${getStatusColor(targets.featuresCompleted.met)}`}>
          <span className="flex items-center">
            {targets.featuresCompleted.met ? (
              <span className="text-green-600 mr-2">[✓]</span>
            ) : (
              <span className="text-gray-400 mr-2">[ ]</span>
            )}
            Features Completed ({targets.featuresCompleted.current} / {targets.featuresCompleted.target})
          </span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded border ${getStatusColor(targets.bugFixRatio.met)}`}>
          <span className="flex items-center">
            {targets.bugFixRatio.met ? (
              <span className="text-green-600 mr-2">[✓]</span>
            ) : (
              <span className="text-gray-400 mr-2">[ ]</span>
            )}
            Bug Fix Ratio ≥ 1 ({targets.bugFixRatio.current.toFixed(2)})
          </span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded border ${getStatusColor(targets.testsWritten.met)}`}>
          <span className="flex items-center">
            {targets.testsWritten.met ? (
              <span className="text-green-600 mr-2">[✓]</span>
            ) : (
              <span className="text-gray-400 mr-2">[ ]</span>
            )}
            Tests Written ({targets.testsWritten.current} / {targets.testsWritten.target})
          </span>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`border rounded-lg p-4 ${getOverallStatusColor(overallStatus)}`}>
        <div className="text-center">
          <div className="text-lg font-semibold mb-1">
            Status: {getOverallStatusText(overallStatus)}
          </div>
          <div className="text-sm opacity-75">
            {Math.round(completionRate * 100)}% of targets met
          </div>
        </div>
      </div>
    </div>
  )
}
