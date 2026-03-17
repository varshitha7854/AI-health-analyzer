# Frontend - React App Guide

This is a modern React app built with Vite and TypeScript. It provides a user-friendly interface for health and mood tracking.

## File Structure

```
frontend/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Main app component (routing logic)
│   ├── api.ts                # API client functions
│   ├── pages/
│   │   ├── Login.tsx         # Login/signup page
│   │   └── Dashboard.tsx     # Main app dashboard
│   ├── components/
│   │   ├── EntryForm.tsx     # Form to create entries
│   │   ├── EntryList.tsx     # Display list of entries
│   │   ├── StatsSection.tsx  # Statistics display
│   │   └── AnalysisSection.tsx # AI analysis display
│   └── styles/
│       └── index.css         # All CSS styles
├── index.html                # HTML entry point
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

## Core Concepts

### Components are Functions
```typescript
// A component is just a function that returns JSX
export default function MyComponent({ prop1, prop2 }) {
  return <div>Hello {prop1}</div>
}
```

### Props = Input Parameters
```typescript
// Parent passes data via props
<EntryForm userId={user.id} onEntryCreated={handleRefresh} />

// Child receives in function parameters
export default function EntryForm({ userId, onEntryCreated }) {
  // Can be used in code
}
```

### State = Component Memory
```typescript
// useState remembers data while component is displayed
const [count, setCount] = useState(0)

return (
  <>
    <p>Count: {count}</p>
    <button onClick={() => setCount(count + 1)}>Increment</button>
  </>
)
```

### Effects = Side Effects
```typescript
// useEffect runs code when component loads or dependencies change
useEffect(() => {
  // This runs when component mounts
  loadData()
}, [userId])  // Re-run if userId changes

// Cleanup (like unmounting)
useEffect(() => {
  const timer = setTimeout(() => { }, 1000)
  return () => clearTimeout(timer)  // Cleanup
}, [])
```

## File Explanations

### `main.tsx` - Entry Point
```typescript
import App from './App.tsx'
import './styles/index.css'

// Renders App component into <div id="root">
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**What it does:**
- Imports the main App component
- Imports global CSS
- Mounts the app into the HTML `<div id="root">`

### `App.tsx` - Main Logic
```typescript
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check localStorage on mount for existing user
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Show Login or Dashboard based on user state
  return user ? <Dashboard /> : <Login />
}
```

**What it does:**
- Manages whether user is logged in
- Checks localStorage for existing login
- Shows Login page or Dashboard accordingly

**How persistence works:**
```typescript
// After login, save to localStorage
localStorage.setItem('user', JSON.stringify(user))

// On page reload, reload from localStorage
const storedUser = localStorage.getItem('user')
```

### `api.ts` - API Client
```typescript
const BASE_URL = 'http://localhost:8000'

export async function loginUser(username) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
  return response.json()
}
```

**Key functions:**
- `loginUser()` - Create account or login
- `createEntry()` - Save new daily entry
- `getEntries()` - Fetch user's entries
- `getStats()` - Get mood statistics
- `analyzeEntries()` - Run AI analysis
- `getAnalyses()` - Get past analyses

**All API calls go through this file** - makes it easy to change the backend URL.

## Page Components

### `pages/Login.tsx`
```typescript
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()  // Don't submit form normally
    setLoading(true)
    
    try {
      const user = await loginUser(username)
      localStorage.setItem('user', JSON.stringify(user))
      onLogin(user)  // Tell parent we logged in
    } catch (err) {
      setError('Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
      {error && <p>{error}</p>}
    </form>
  )
}
```

**Flow:**
1. User types username
2. User clicks "Log In"
3. API call to backend
4. Save user to localStorage
5. Call `onLogin` callback (sets user in App.tsx)
6. App shows Dashboard instead of Login

### `pages/Dashboard.tsx`
```typescript
export default function Dashboard({ user, onLogout }) {
  const [refreshKey, setRefreshKey] = useState(0)

  // When entry is created, increment key to reload other components
  function handleEntryCreated() {
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <header>
        <h1>Welcome {user.username}</h1>
        <button onClick={onLogout}>Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          {/* EntryForm gets userId and callback */}
          <EntryForm userId={user.id} onEntryCreated={handleEntryCreated} />
          {/* StatsSection gets new key when entry created */}
          <StatsSection key={`stats-${refreshKey}`} userId={user.id} />
        </div>

        <div className="main">
          <EntryList key={`entries-${refreshKey}`} userId={user.id} />
          <AnalysisSection userId={user.id} />
        </div>
      </div>
    </>
  )
}
```

**How refresh works:**
- When new entry created, `refreshKey` increments
- Child components have `key={refreshKey}` in their tag
- React recreates component with new key
- `useEffect` in child reloads data

## Component Details

### `components/EntryForm.tsx`
```typescript
export default function EntryForm({ userId, onEntryCreated }) {
  const [date, setDate] = useState(today)
  const [mood, setMood] = useState(3)
  const [symptoms, setSymptoms] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await createEntry(userId, date, mood, symptoms, notes)
      // Reset form
      setDate(today)
      setMood(3)
      setSymptoms('')
      setNotes('')
      // Tell parent to refresh other components
      onEntryCreated()
    } catch (err) {
      // Show error
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      
      {/* Emoji mood buttons */}
      {[1, 2, 3, 4, 5].map(m => (
        <button
          key={m}
          onClick={() => setMood(m)}
          className={mood === m ? 'active' : ''}
        >
          {['😢', '😟', '😐', '🙂', '😄'][m-1]}
        </button>
      ))}

      <textarea
        value={symptoms}
        onChange={e => setSymptoms(e.target.value)}
        placeholder="Symptoms..."
      />
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes..."
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Entry'}
      </button>
    </form>
  )
}
```

**Features:**
- Form for creating entries
- Mood emoji selector
- Textarea for symptoms and notes
- Shows loading state during API call
- Resets form after successful submit
- Shows error/success messages

### `components/EntryList.tsx`
```typescript
export default function EntryList({ userId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // Load entries when component mounts
  useEffect(() => {
    loadEntries()
  }, [userId])

  async function loadEntries() {
    setLoading(true)
    try {
      const data = await getEntries(userId, 50)
      setEntries(data)
    } catch (err) {
      // Show error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Recent Entries</h2>
      
      {entries.length === 0 ? (
        <p>No entries yet</p>
      ) : (
        <div className="entries-list">
          {entries.map(entry => (
            <div key={entry.id} className="entry-item">
              <div className="entry-header">
                <span>{entry.date}</span>
                <span>{['😢', '😟', '😐', '🙂', '😄'][entry.mood-1]} {entry.mood}/5</span>
              </div>
              {entry.symptoms_text && <p><strong>Symptoms:</strong> {entry.symptoms_text}</p>}
              {entry.notes_text && <p><strong>Notes:</strong> {entry.notes_text.substring(0, 100)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Features:**
- Displays list of entries sorted by date (newest first)
- Shows mood with emoji
- Truncates long notes
- Shows loading state

### `components/StatsSection.tsx`
```typescript
export default function StatsSection({ userId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [userId])

  async function loadStats() {
    setLoading(true)
    try {
      const data = await getStats(userId)
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card stats-card">
      <h2>Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value">{stats.total_entries}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Average Mood</div>
          <div className="stat-value">{stats.average_mood.toFixed(1)}/5</div>
        </div>
      </div>

      {/* Simple bar chart of last 7 days */}
      <div className="simple-bar-chart">
        {stats.entries_per_day.slice(-7).map(item => (
          <div key={item.date} className="bar-item">
            <div className="bar" style={{height: item.count * 30 + 'px'}} />
            <div className="bar-date">{item.date.substring(5)}</div>
          </div>
        ))}
      </div>
      
      <button onClick={loadStats}>Refresh</button>
    </div>
  )
}
```

**Features:**
- Shows total entries and average mood
- Simple visual bar chart of entries per day
- Sticky position (stays visible while scrolling)
- Refresh button

### `components/AnalysisSection.tsx`
```typescript
export default function AnalysisSection({ userId }) {
  const [days, setDays] = useState(30)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [pastAnalyses, setPastAnalyses] = useState([])

  useEffect(() => {
    loadPastAnalyses()
  }, [userId])

  async function handleAnalyze(e) {
    e.preventDefault()
    setAnalyzing(true)

    try {
      // Call backend AI analysis
      const result = await analyzeEntries(userId, days)
      setAnalysisResult(result)
      // Reload past analyses list
      loadPastAnalyses()
    } finally {
      setAnalyzing(false)
    }
  }

  async function loadPastAnalyses() {
    try {
      const data = await getAnalyses(userId)
      setPastAnalyses(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="card">
      <h2>AI Analysis</h2>

      {/* Analyze button */}
      <form onSubmit={handleAnalyze}>
        <label>Analyze last</label>
        <input
          type="number"
          value={days}
          onChange={e => setDays(parseInt(e.target.value))}
          min="1"
          max="365"
        />
        <span>days</span>
        
        <button type="submit" disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {/* Show latest analysis result */}
      {analysisResult && (
        <div className="analysis-result">
          <h3>Latest Analysis</h3>
          <p>{analysisResult.summary_text}</p>
          
          {analysisResult.patterns.map((pattern, idx) => (
            <div key={idx} className="pattern-card">
              <h5>{pattern.title}</h5>
              <p>{pattern.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Show past analyses list */}
      {pastAnalyses.length > 0 && (
        <div className="past-analyses">
          <h3>Past Analyses</h3>
          {pastAnalyses.map(analysis => (
            <div key={analysis.id} className="analysis-item">
              <span>{new Date(analysis.generated_at).toLocaleDateString()}</span>
              <p>{analysis.summary_text.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Features:**
- Input to select number of days to analyze
- Button to run AI analysis
- Shows loading state
- Displays analysis results with summary and patterns
- Lists past analyses
- Expandable past analyses (optional)

## Styling Strategy

All CSS is in `src/styles/index.css`:

```css
/* Global styles */
* { margin: 0; padding: 0; }
body { font-family: system-ui; }

/* Layout */
.dashboard-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

/* Components */
.card { background: white; border-radius: 8px; padding: 20px; }
.btn { padding: 10px 20px; border-radius: 6px; }

/* Responsive */
@media (max-width: 768px) {
  .dashboard-content { grid-template-columns: 1fr; }
}
```

**CSS Naming:**
- `.card` - White container boxes
- `.btn` - Buttons (with modifiers: `.btn-primary`, `.btn-secondary`)
- `.form-group` - Form sections
- `.error-message`, `.success-message` - Messages

## TypeScript Basics

```typescript
// Interfaces define object shapes
interface User {
  id: number
  username: string
}

// Props type
interface LoginProps {
  onLogin: (user: User) => void
}

// useState with type
const [user, setUser] = useState<User | null>(null)

// Function parameter types
function handleClick(event: React.MouseEvent) { }
```

## Common Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [data, setData] = useState(null)

async function fetchData() {
  setLoading(true)
  setError('')
  try {
    const result = await api.getData()
    setData(result)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

// In JSX
{loading && <p>Loading...</p>}
{error && <p className="error">{error}</p>}
{data && <p>Data: {data}</p>}
```

### Conditional Rendering
```typescript
{user ? <Dashboard /> : <Login />}  // Ternary
{items.length === 0 && <p>No items</p>}  // Short circuit
{status === 'loading' && <Spinner />}  // Multiple conditions
```

### Lists with Keys
```typescript
{items.map(item => (
  <div key={item.id}>  // Always use unique key!
    {item.name}
  </div>
))}
```

## Debugging

### React DevTools Browser Extension
- View component hierarchy
- Inspect props and state
- Edit state in real-time

### Console Logging
```typescript
console.log('User:', user)
console.error('Error:', err)
console.table(entries)  // Nice table format
```

### Check for Undefined
```typescript
{data && data.name}  // Safe
// Don't do: <p>{data.name}</p> if data might be undefined
```

## Deployment

### Build for Production
```bash
npm run build
# Creates dist/ folder with optimized code
```

### Serve Locally
```bash
npm run preview
# Or serve dist/ folder with any web server
```

### Deploy to Netlify/Vercel
- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `dist`
- Set env vars: `VITE_API_URL=https://your-backend.com`

## Performance Tips

### Memoization
```typescript
import { memo } from 'react'

// Prevent unnecessary re-renders
const EntryItem = memo(function EntryItem({ entry }) {
  return <div>{entry.date}</div>
})
```

### useCallback
```typescript
// Prevent function recreation on every render
const handleClick = useCallback(() => {
  doSomething(userId)
}, [userId])  // Only recreate if userId changes
```

### useMemo
```typescript
// Cache expensive computations
const expensiveValue = useMemo(() => {
  return data.filter(...).map(...)
}, [data])
```

## Common Issues

**"Cannot read property 'map' of undefined"**
- Check if data loaded before rendering
- Use conditional: `{entries && entries.map(...)}`

**Components re-render too often**
- Check if dependencies in useEffect are correct
- Use memo() to prevent unnecessary renders

**API calls happen twice on mount**
- Normal in React 18 StrictMode (dev only)
- Won't happen in production

**localStorage is empty**
- Check browser DevTools > Application > Storage
- Some private/incognito modes disable it

## Summary

- **main.tsx** = Bootstrap React app
- **App.tsx** = Main logic, routing
- **api.ts** = All backend calls
- **pages/** = Full-page components (Login, Dashboard)
- **components/** = Reusable components (EntryForm, etc.)
- **styles/index.css** = All styling

Flow: `main.tsx` → `App.tsx` → `pages/` → `components/` ← `api.ts`

Good luck! The code is well-organized and beginner-friendly. Start by reading how a component works, then modify it!
