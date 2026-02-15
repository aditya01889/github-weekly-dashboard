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

export interface CompositionResult {
  deliveryPercent: number
  stabilityPercent: number
  qualityPercent: number
  dominantCategory: 'DELIVERY' | 'STABILITY' | 'QUALITY'
}

export function calculateComposition(monthlyMetrics: MonthlyMetrics): CompositionResult {
  // Calculate weighted scores
  const deliveryScore = 
    (monthlyMetrics.activity.prMerged * 3) +
    (monthlyMetrics.activity.featuresCompleted * 5) +
    (monthlyMetrics.activity.commits * 1)

  const stabilityScore = 
    (monthlyMetrics.combat.bugsFixed * 3) +
    (monthlyMetrics.combat.bugsFound * 1)

  const qualityScore = 
    (monthlyMetrics.defense.testsWritten * 2) +
    (monthlyMetrics.defense.ciRuns * 1)

  const totalScore = deliveryScore + stabilityScore + qualityScore

  // Handle zero total score
  if (totalScore === 0) {
    return {
      deliveryPercent: 0,
      stabilityPercent: 0,
      qualityPercent: 0,
      dominantCategory: 'DELIVERY' // Default fallback
    }
  }

  // Calculate percentages
  const deliveryPercent = (deliveryScore / totalScore) * 100
  const stabilityPercent = (stabilityScore / totalScore) * 100
  const qualityPercent = (qualityScore / totalScore) * 100

  // Determine dominant category
  let dominantCategory: 'DELIVERY' | 'STABILITY' | 'QUALITY'
  
  if (deliveryPercent >= stabilityPercent && deliveryPercent >= qualityPercent) {
    dominantCategory = 'DELIVERY'
  } else if (stabilityPercent >= deliveryPercent && stabilityPercent >= qualityPercent) {
    dominantCategory = 'STABILITY'
  } else {
    dominantCategory = 'QUALITY'
  }

  return {
    deliveryPercent: Math.round(deliveryPercent * 10) / 10, // Round to 1 decimal
    stabilityPercent: Math.round(stabilityPercent * 10) / 10,
    qualityPercent: Math.round(qualityPercent * 10) / 10,
    dominantCategory
  }
}
