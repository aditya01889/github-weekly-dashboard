'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { MetricSection } from '@/components/MetricSection'
import { RepoFilter } from '@/components/RepoFilter'

interface WeeklyMetrics {
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

interface MetricsResponse {
  weekRange: {
    start: string
    end: string
    startDate: string
    endDate: string
  }
  repositories: string[]
  metrics: WeeklyMetrics
  user: {
    username: string
    name: string | null
    avatar: string
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState('all')
  const [availableRepos, setAvailableRepos] = useState<string[]>([])

  const fetchMetrics = async (repo: string) => {
    if (!session?.accessToken) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/weekly-metrics?repo=${encodeURIComponent(repo)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch metrics')
      }

      const data: MetricsResponse = await response.json()
      setMetrics(data)
      setAvailableRepos(data.repositories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchMetrics(selectedRepo)
    }
  }, [session, selectedRepo])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            GitHub Weekly Performance Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in with GitHub to view your weekly performance metrics
          </p>
          <button
            onClick={() => signIn('github')}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => fetchMetrics(selectedRepo)}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              GitHub Weekly Performance Dashboard
            </h1>
            {metrics && (
              <div className="text-sm text-gray-600 mt-1">
                {new Date(metrics.weekRange.startDate).toLocaleDateString()} - {new Date(metrics.weekRange.endDate).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={session.user?.image || ''}
                alt={session.user?.name || ''}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700">{session.user?.name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Repository Filter */}
        {availableRepos.length > 0 && (
          <RepoFilter
            selectedRepo={selectedRepo}
            onRepoChange={setSelectedRepo}
            repositories={availableRepos}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading metrics...</div>
          </div>
        )}

        {/* Metrics Display */}
        {metrics && !loading && (
          <>
            <MetricSection
              title="Activity"
              metrics={[
                { label: 'Commits', value: metrics.metrics.activity.commits },
                { label: 'PR Opened', value: metrics.metrics.activity.prOpened },
                { label: 'PR Merged', value: metrics.metrics.activity.prMerged },
                { label: 'Features Completed', value: metrics.metrics.activity.featuresCompleted }
              ]}
            />

            <MetricSection
              title="Combat"
              metrics={[
                { label: 'Bugs Found', value: metrics.metrics.combat.bugsFound },
                { label: 'Bugs Fixed', value: metrics.metrics.combat.bugsFixed },
                { label: 'Open Bugs', value: metrics.metrics.combat.openBugs },
                { label: 'Bug Fix Ratio', value: metrics.metrics.combat.bugFixRatio.toFixed(2) }
              ]}
            />

            <MetricSection
              title="Defense"
              metrics={[
                { label: 'Tests Written', value: metrics.metrics.defense.testsWritten },
                { label: 'CI Runs', value: metrics.metrics.defense.ciRuns }
              ]}
            />
          </>
        )}
      </div>
    </div>
  )
}
