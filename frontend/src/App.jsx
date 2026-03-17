import { useState, useEffect } from 'react'
import UsernameForm from './components/UsernameForm'
import EntryForm from './components/EntryForm'
import EntriesList from './components/EntriesList'
import StatsPanel from './components/StatsPanel'
import InsightsPanel from './components/InsightsPanel'
import {
  createUser,
  createEntry,
  getEntries,
  getStats,
} from './api'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [entries, setEntries] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshData = async (username) => {
    setLoading(true)
    setError('')

    try {
      const [entriesData, statsData] = await Promise.all([
        getEntries(username, { skip: 0, limit: 20 }),
        getStats(username),
      ])
      setEntries(entriesData)
      setStats(statsData)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSetUser = async (username) => {
    setLoading(true)
    setError('')

    try {
      await createUser(username)
      setCurrentUser(username)
      // Refresh data for this user
      await refreshData(username)
    } catch (err) {
      // If user already exists (400 error with "User already exists"),
      // still continue and set the user
      if (err.message.includes('already exists')) {
        setCurrentUser(username)
        await refreshData(username)
      } else {
        setError(err.message || 'Failed to set user')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async (entry) => {
    if (!currentUser) return

    try {
      await createEntry(currentUser, entry)
      // Refresh entries and stats after adding
      await refreshData(currentUser)
    } catch (err) {
      throw err
    }
  }

  return (
    <div className="app">
      <div className="container">
        <UsernameForm
          currentUser={currentUser}
          onSetUser={handleSetUser}
          loading={loading}
        />

        {error && <div className="error-banner">{error}</div>}

        {currentUser && (
          <>
            <div className="main-content">
              <div className="left-column">
                <EntryForm
                  onAddEntry={handleAddEntry}
                  disabled={loading}
                />
              </div>

              <div className="right-column">
                <StatsPanel
                  stats={stats}
                  username={currentUser}
                  loading={loading}
                />
                <InsightsPanel
                  username={currentUser}
                  loading={loading}
                />
              </div>
            </div>

            <EntriesList entries={entries} username={currentUser} />
          </>
        )}
      </div>
    </div>
  )
}
