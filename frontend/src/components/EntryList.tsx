import { useState, useEffect } from 'react'
import { getEntries, DailyEntry } from '../api'

interface EntryListProps {
  userId: number
}

export default function EntryList({ userId }: EntryListProps) {
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEntries()
  }, [userId])

  async function loadEntries() {
    setLoading(true)
    setError('')

    try {
      const data = await getEntries(userId, 50)
      setEntries(data)
    } catch (err) {
      setError('Failed to load entries')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card"><p>Loading entries...</p></div>
  if (error) return <div className="card"><p className="error-message">{error}</p></div>

  return (
    <div className="card">
      <h2>📋 Recent Entries</h2>

      {entries.length === 0 ? (
        <p className="empty-message">No entries yet. Create one to get started!</p>
      ) : (
        <div className="entries-list">
          {entries.map((entry) => (
            <div key={entry.id} className="entry-item">
              <div className="entry-header">
                <span className="entry-date">{new Date(entry.date).toDateString()}</span>
                <span className="entry-mood">
                  {['😢', '😟', '😐', '🙂', '😄'][entry.mood - 1]} {entry.mood}/5
                </span>
              </div>

              {entry.symptoms_text && (
                <p className="entry-symptoms">
                  <strong>Symptoms:</strong> {entry.symptoms_text}
                </p>
              )}

              {entry.notes_text && (
                <p className="entry-notes">
                  <strong>Notes:</strong> {entry.notes_text.substring(0, 100)}
                  {entry.notes_text.length > 100 ? '...' : ''}
                </p>
              )}

              <small className="entry-time">
                {new Date(entry.created_at).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
