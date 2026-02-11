import { WeeklyMetrics } from './github'
import { WEEKLY_TARGETS } from './targetsConfig'

export interface TargetEvaluation {
  prMerged: { current: number; target: number; met: boolean }
  featuresCompleted: { current: number; target: number; met: boolean }
  bugFixRatio: { current: number; target: number; met: boolean }
  testsWritten: { current: number; target: number; met: boolean }
  completionRate: number
  overallStatus: 'ON_TRACK' | 'AT_RISK'
}

export function evaluateTargets(metrics: WeeklyMetrics): TargetEvaluation {
  const prMerged = {
    current: metrics.activity.prMerged,
    target: WEEKLY_TARGETS.prMerged,
    met: metrics.activity.prMerged >= WEEKLY_TARGETS.prMerged
  }

  const featuresCompleted = {
    current: metrics.activity.featuresCompleted,
    target: WEEKLY_TARGETS.featuresCompleted,
    met: metrics.activity.featuresCompleted >= WEEKLY_TARGETS.featuresCompleted
  }

  const bugFixRatio = {
    current: metrics.combat.bugFixRatio,
    target: WEEKLY_TARGETS.bugFixRatio,
    met: metrics.combat.bugFixRatio >= WEEKLY_TARGETS.bugFixRatio
  }

  const testsWritten = {
    current: metrics.defense.testsWritten,
    target: WEEKLY_TARGETS.testsWritten,
    met: metrics.defense.testsWritten >= WEEKLY_TARGETS.testsWritten
  }

  const targetsMet = [
    prMerged.met,
    featuresCompleted.met,
    bugFixRatio.met,
    testsWritten.met
  ].filter(Boolean).length

  const completionRate = targetsMet / 4

  const overallStatus = completionRate >= 0.75 ? 'ON_TRACK' : 'AT_RISK'

  return {
    prMerged,
    featuresCompleted,
    bugFixRatio,
    testsWritten,
    completionRate,
    overallStatus
  }
}
