import { useState } from 'react'

export default function UsernameForm({ currentUser, onSetUser, loading }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim().toLowerCase()

    if (!trimmed) {
      setError('Please enter a username')
      return
    }

    setError('')
    onSetUser(trimmed)
    setInput('')
  }

  return (
    <div className="username-form">
      <h2>AI Health Analyzer</h2>
      {currentUser ? (
        <div>
          <p className="current-user">Logged in as: <strong>{currentUser}</strong></p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter username"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError('')
            }}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Setting user...' : 'Set User'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </div>
  )
}
