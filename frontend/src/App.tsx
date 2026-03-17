import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import './styles/index.css'

function App() {
  const [user, setUser] = useState<{ user_id: number; username: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user:', e)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="app-container"><p>Loading...</p></div>
  }

  return (
    <div className="app-container">
      {user ? (
        <Dashboard user={user} onLogout={() => {
          localStorage.removeItem('user')
          setUser(null)
        }} />
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  )
}

export default App
