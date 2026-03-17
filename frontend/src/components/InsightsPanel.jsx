import { useState, useEffect } from 'react'
import { getStats } from '../api'

export default function InsightsPanel({ username, loading }) {
  const [insights, setInsights] = useState(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (username) {
      fetchInsights()
    }
  }, [username])

  const fetchInsights = async () => {
    setInsightLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:8000/insights/${username}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }

      const data = await response.json()
      setInsights(data)
    } catch (err) {
      setError(err.message || 'Error loading insights')
    } finally {
      setInsightLoading(false)
    }
  }

  if (loading || insightLoading) {
    return (
      <div className="insights-panel">
        <h3>Today's Insight</h3>
        <p className="insights-loading">Loading insights...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="insights-panel">
        <h3>Today's Insight</h3>
        <p className="insights-error">Could not load insights</p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="insights-panel">
        <h3>Today's Insight</h3>
        <p className="insights-loading">No insights available yet.</p>
      </div>
    )
  }

  return (
    <div className="insights-panel">
      <h3>✨ Today's Insight</h3>
      
      {insights.messages && insights.messages.length > 0 ? (
        <div className="insight-messages">
          {insights.messages.map((message, idx) => (
            <div key={idx} className="insight-message">
              <p>{message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-insights">Start logging entries to get personalized insights!</p>
      )}

      {insights.weekly_summary && (
        <div className="weekly-summary">
          <p className="summary-label">📊 This Week:</p>
          <p className="summary-text">{insights.weekly_summary}</p>
        </div>
      )}

      <button 
        className="refresh-insights-btn"
        onClick={fetchInsights}
        disabled={insightLoading}
      >
        {insightLoading ? 'Refreshing...' : '🔄 Refresh'}
      </button>
    </div>
  )
}
