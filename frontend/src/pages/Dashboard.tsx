import { useState, useEffect } from 'react'
import EntryForm from '../components/EntryForm'
import EntryList from '../components/EntryList'
import StatsSection from '../components/StatsSection'
import AnalysisSection from '../components/AnalysisSection'
import { User } from '../api'

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  function handleEntryCreated() {
    // Increment the key to trigger re-fetches in child components
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📊 Health & Mood Notebook</h1>
          <p className="user-info">Welcome, <strong>{user.username}</strong></p>
        </div>
        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <EntryForm userId={user.id} onEntryCreated={handleEntryCreated} />
          <StatsSection key={`stats-${refreshKey}`} userId={user.id} />
        </div>

        <div className="main">
          <EntryList key={`entries-${refreshKey}`} userId={user.id} />
          <AnalysisSection userId={user.id} />
        </div>
      </div>
    </div>
  )
}
