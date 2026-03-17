import { useState } from 'react'
import { loginUser, User } from '../api'

interface LoginProps {
  onLogin: (user: User) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = await loginUser(username)
      localStorage.setItem('user', JSON.stringify(user))
      onLogin(user)
    } catch (err) {
      setError('Failed to log in. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📊 Health & Mood Notebook</h1>
        <p className="subtitle">Track your health and mood. Get AI-powered insights.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="info-text">
          Don't have an account? Just enter a username above to create one!
        </p>
      </div>
    </div>
  )
}
