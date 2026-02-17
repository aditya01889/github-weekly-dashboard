import { supabase } from '@/lib/supabase'

export default async function TestPage() {
  let supabaseStatus = 'Unknown'
  let snapshotsCount = 0
  let error = null
  let snapshotsData: any[] = []

  try {
    if (!supabase) {
      supabaseStatus = 'Not configured'
    } else {
      supabaseStatus = 'Connected'
      
      // Test query to see all snapshots
      const { data, error: queryError } = await supabase
        .from('weekly_snapshots')
        .select('*')
        .order('week_start', { ascending: true })
      
      if (queryError) {
        error = queryError.message
      } else {
        snapshotsCount = data?.length || 0
        snapshotsData = data || []
        if (data && data.length > 0) {
          console.log('All snapshot dates:', data.map((s: any) => s.week_start))
        }
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report System Debug</h1>
        
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Supabase Status</h2>
            <p className="text-gray-600">{supabaseStatus}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Snapshots Count</h2>
            <p className="text-gray-600">{snapshotsCount}</p>
          </div>
          
          {error && (
            <div>
              <h2 className="text-lg font-semibold text-red-900">Error</h2>
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Environment Variables</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
              </p>
              <p className="text-gray-600">
                SUPABASE_SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'}
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Available Snapshot Dates</h2>
            <div className="text-gray-600">
              {snapshotsData && snapshotsData.length > 0 ? (
                <ul className="list-disc list-inside">
                  {snapshotsData.map((snapshot: any, index: number) => (
                    <li key={index}>{snapshot.week_start}</li>
                  ))}
                </ul>
              ) : (
                <p>No snapshots found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
