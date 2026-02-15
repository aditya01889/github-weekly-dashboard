interface ViewToggleProps {
  currentView: 'weekly' | 'monthly'
  onViewChange: (view: 'weekly' | 'monthly') => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <button
          onClick={() => onViewChange('weekly')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'weekly'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => onViewChange('monthly')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'monthly'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Monthly
        </button>
      </div>
    </div>
  )
}
