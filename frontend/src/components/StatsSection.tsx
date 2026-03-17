import { useState, useEffect } from 'react'
import { getStats, Stats } from '../api'

interface StatsProps {
  userId: number
}

export default function StatsSection({ userId }: StatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [userId])

  async function loadStats() {
    setLoading(true)
    setError('')

    try {
      const data = await getStats(userId)
      setStats(data)
    } catch (err) {
      setError('Failed to load stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card"><p>Loading stats...</p></div>
  if (error) return <div className="card"><p className="error-message">{error}</p></div>
  if (!stats) return <div className="card"><p>No stats available</p></div>

  return (
    <div className="card stats-card">
      <h2>📈 Statistics</h2>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value">{stats.total_entries}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Average Mood</div>
          <div className="stat-value">
            {stats.average_mood.toFixed(1)} <span className="stat-unit">/5</span>
          </div>
        </div>
      </div>

      {stats.entries_per_day.length > 0 && (
        <div className="chart-container">
          <h3>Entries per Day</h3>
          <div className="simple-bar-chart">
            {stats.entries_per_day.slice(-7).map((item) => (
              <div key={item.date} className="bar-item">
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      height: `${Math.max(20, item.count * 30)}px`,
                    }}
                    title={`${item.date}: ${item.count} entries`}
                  />
                </div>
                <div className="bar-date">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={loadStats} className="btn btn-small">
        Refresh
      </button>
    </div>
  )
}
