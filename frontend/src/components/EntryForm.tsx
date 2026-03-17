import { useState } from 'react'
import { createEntry } from '../api'

interface EntryFormProps {
  userId: number
  onEntryCreated: () => void
}

export default function EntryForm({ userId, onEntryCreated }: EntryFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [mood, setMood] = useState(3)
  const [symptoms, setSymptoms] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await createEntry(userId, date, mood, symptoms, notes)
      setSuccess('Entry created successfully!')
      setDate(today)
      setMood(3)
      setSymptoms('')
      setNotes('')
      onEntryCreated()

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Failed to create entry. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card entry-form-card">
      <h2>📝 New Entry</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mood">Mood (1-5)</label>
          <div className="mood-selector">
            {[1, 2, 3, 4, 5].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`mood-btn ${mood === m ? 'active' : ''}`}
                title={['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'][m - 1]}
              >
                {['😢', '😟', '😐', '🙂', '😄'][m - 1]}
              </button>
            ))}
          </div>
          <small>Selected: {mood}/5</small>
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Symptoms (optional)</label>
          <input
            id="symptoms"
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., headache, fatigue"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={4}
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Creating...' : 'Create Entry'}
        </button>
      </form>
    </div>
  )
}
