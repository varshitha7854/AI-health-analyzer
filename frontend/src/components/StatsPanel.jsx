export default function StatsPanel({ stats, username, loading }) {
  if (loading) {
    return (
      <div className="stats-panel card">
        <h3>Stats for {username}</h3>
        <p>Loading stats...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="stats-panel card">
        <h3>Stats for {username}</h3>
        <p>No stats yet for this user.</p>
      </div>
    )
  }

  return (
    <div className="stats-panel card">
      <h3>Stats for {username}</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Avg Mood (7d)</div>
          <div className="stat-value">{stats.avg_mood_7d.toFixed(1)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Avg Energy (7d)</div>
          <div className="stat-value">{stats.avg_energy_7d.toFixed(1)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Avg Mood (30d)</div>
          <div className="stat-value">{stats.avg_mood_30d.toFixed(1)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Avg Energy (30d)</div>
          <div className="stat-value">{stats.avg_energy_30d.toFixed(1)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value">{stats.total_entries}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Trend</div>
          <div className={`stat-value trend ${stats.trend}`}>
            {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
          </div>
        </div>
      </div>
    </div>
  )
}
