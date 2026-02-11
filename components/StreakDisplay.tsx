interface StreakDisplayProps {
  streak: {
    currentStreak: number
    lastQualifiedWeek: string
    status: 'ACTIVE' | 'BROKEN'
    previousStreak: number
  }
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-700'
      case 'BROKEN':
        return 'text-gray-700'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string, currentStreak: number, previousStreak: number) => {
    switch (status) {
      case 'ACTIVE':
        return `Performance Streak: ${currentStreak} Weeks`
      case 'BROKEN':
        return `Streak Broken - Last Streak: ${previousStreak} Weeks`
      default:
        return 'Performance Streak: 0 Weeks'
    }
  }

  return (
    <div className="mb-6">
      <div className={`text-center font-medium ${getStatusColor(streak.status)}`}>
        {getStatusText(streak.status, streak.currentStreak, streak.previousStreak)}
      </div>
    </div>
  )
}
