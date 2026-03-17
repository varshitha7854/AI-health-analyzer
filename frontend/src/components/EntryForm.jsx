import { useState } from 'react'

export default function EntryForm({ onAddEntry, disabled }) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    date: today,
    mood_score: 5,
    energy: 5,
    notes: '',
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'notes' ? value : parseInt(value, 10),
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate scores
    if (form.mood_score < 1 || form.mood_score > 10) {
      setError('Mood score must be between 1 and 10')
      return
    }
    if (form.energy < 1 || form.energy > 10) {
      setError('Energy must be between 1 and 10')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      await onAddEntry(form)
      // Clear notes but keep date and scores as defaults
      setForm((prev) => ({
        ...prev,
        notes: '',
      }))
    } catch (err) {
      setError(err.message || 'Failed to add entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="entry-form card">
      <h3>Add Daily Entry</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            disabled={disabled || submitting}
          />
        </div>

        <div className="form-group">
          <label>Mood Score (1-10)</label>
          <div className="input-row">
            <input
              type="number"
              name="mood_score"
              min="1"
              max="10"
              value={form.mood_score}
              onChange={handleChange}
              disabled={disabled || submitting}
            />
            <span className="slider-value">{form.mood_score}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Energy (1-10)</label>
          <div className="input-row">
            <input
              type="number"
              name="energy"
              min="1"
              max="10"
              value={form.energy}
              onChange={handleChange}
              disabled={disabled || submitting}
            />
            <span className="slider-value">{form.energy}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            name="notes"
            rows="4"
            placeholder="How are you feeling? What happened today?"
            value={form.notes}
            onChange={handleChange}
            disabled={disabled || submitting}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={disabled || submitting}>
          {submitting ? 'Adding...' : 'Add Entry'}
        </button>
      </form>
    </div>
  )
}
