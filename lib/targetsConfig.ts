export const WEEKLY_TARGETS = {
  prMerged: 3,
  featuresCompleted: 1,
  bugFixRatio: 1,
  testsWritten: 5
} as const

export type WeeklyTargets = typeof WEEKLY_TARGETS
