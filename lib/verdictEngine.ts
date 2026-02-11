import { WeeklyMetrics } from './github'

export interface VerdictResult {
  score: number
  label: 'STRONG' | 'SOLID' | 'CHAOTIC'
}

export interface TrendResult {
  trend: 'Improving' | 'Stable' | 'Declining' | 'Insufficient data'
  arrow: '↑' | '→' | '↓' | ''
}

export function calculateVerdict(metrics: WeeklyMetrics, previousMetrics?: WeeklyMetrics): VerdictResult {
  let score = 0

  // Positive scoring rules
  if (metrics.activity.prMerged >= 1) score += 1
  if (metrics.activity.featuresCompleted >= 1) score += 1
  if (metrics.combat.bugFixRatio >= 1) score += 1
  if (metrics.defense.testsWritten >= 5) score += 1

  // Negative scoring rules
  if (metrics.combat.bugFixRatio < 1) score -= 1
  
  // Previous week comparison for open bugs penalty
  if (previousMetrics && metrics.combat.openBugs > previousMetrics.combat.openBugs) {
    score -= 1
  }

  // Verdict mapping
  let label: 'STRONG' | 'SOLID' | 'CHAOTIC'
  if (score >= 3) {
    label = 'STRONG'
  } else if (score === 1 || score === 2) {
    label = 'SOLID'
  } else {
    label = 'CHAOTIC'
  }

  return { score, label }
}

export function calculateTrend(lastThreeVerdicts: ('STRONG' | 'SOLID' | 'CHAOTIC')[]): TrendResult {
  if (lastThreeVerdicts.length < 2) {
    return { trend: 'Insufficient data', arrow: '' }
  }

  const verdictScores = lastThreeVerdicts.map(v => {
    switch (v) {
      case 'STRONG': return 3
      case 'SOLID': return 2
      case 'CHAOTIC': return 1
      default: return 0
    }
  })

  const recent = verdictScores.slice(-3)
  if (recent.length < 2) {
    return { trend: 'Insufficient data', arrow: '' }
  }

  // Check trend over last 3 weeks
  let improving = 0
  let declining = 0
  
  for (let i = 1; i < recent.length; i++) {
    if (recent[i] > recent[i - 1]) improving++
    else if (recent[i] < recent[i - 1]) declining++
  }

  if (improving > declining) {
    return { trend: 'Improving', arrow: '↑' }
  } else if (declining > improving) {
    return { trend: 'Declining', arrow: '↓' }
  } else {
    return { trend: 'Stable', arrow: '→' }
  }
}

export function getVerdictHelperText(verdict: 'STRONG' | 'SOLID' | 'CHAOTIC'): string {
  switch (verdict) {
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
