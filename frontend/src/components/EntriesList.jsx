export default function EntriesList({ entries, username }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="entries-list card">
        <h3>Your Entries</h3>
        <p className="empty-message">No entries yet. Add your first mood entry above.</p>
      </div>
    )
  }

  // Sort newest first (by date and created_at)
  const sorted = [...entries].sort((a, b) => {
    const dateA = new Date(a.created_at)
    const dateB = new Date(b.created_at)
    return dateB - dateA
  })

  return (
    <div className="entries-list card">
      <h3>Your Entries (Latest {entries.length})</h3>
      <table className="entries-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Mood</th>
            <th>Energy</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.date}</td>
              <td className="score">{entry.mood_score}/10</td>
              <td className="score">{entry.energy}/10</td>
              <td className="notes-cell">{entry.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
