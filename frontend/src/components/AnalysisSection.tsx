import { useState, useEffect } from 'react'
import { analyzeEntries, getAnalyses, AnalysisSummary, Pattern } from '../api'

interface AnalysisSectionProps {
  userId: number
}

export default function AnalysisSection({ userId }: AnalysisSectionProps) {
  const [days, setDays] = useState(30)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [analysisResult, setAnalysisResult] = useState<{
    summary_text: string
    patterns: Pattern[]
  } | null>(null)
  const [pastAnalyses, setPastAnalyses] = useState<AnalysisSummary[]>([])
  const [loadingAnalyses, setLoadingAnalyses] = useState(false)
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<number | null>(null)

  useEffect(() => {
    loadPastAnalyses()
  }, [userId])

  async function loadPastAnalyses() {
    setLoadingAnalyses(true)
    try {
      const data = await getAnalyses(userId)
      setPastAnalyses(data)
    } catch (err) {
      console.error('Failed to load past analyses:', err)
    } finally {
      setLoadingAnalyses(false)
    }
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    setAnalyzing(true)
    setError('')
    setAnalysisResult(null)

    try {
      const result = await analyzeEntries(userId, days)
      setAnalysisResult(result)
      // Reload past analyses to include the new one
      loadPastAnalyses()
    } catch (err) {
      setError('Failed to analyze entries. Please try again.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="card">
      <h2>🤖 AI Analysis</h2>

      <form onSubmit={handleAnalyze} className="analysis-form">
        <div className="form-group-inline">
          <label htmlFor="days">Analyze last</label>
          <input
            id="days"
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            disabled={analyzing}
          />
          <span>days</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={analyzing || analyzing} className="btn btn-primary">
          {analyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {analysisResult && (
        <div className="analysis-result">
          <h3>📊 Latest Analysis</h3>

          <div className="summary-box">
            <h4>Summary</h4>
            <p>{analysisResult.summary_text}</p>
          </div>

          {analysisResult.patterns.length > 0 && (
            <div className="patterns-container">
              <h4>Patterns Detected</h4>
              <div className="patterns-grid">
                {analysisResult.patterns.map((pattern, idx) => (
                  <div key={idx} className="pattern-card">
                    <h5>{pattern.title}</h5>
                    <p>{pattern.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {pastAnalyses.length > 0 && (
        <div className="past-analyses">
          <h3>📜 Past Analyses</h3>
          <div className="analyses-list">
            {pastAnalyses.map((analysis) => (
              <div key={analysis.id} className="analysis-item">
                <div
                  className="analysis-header"
                  onClick={() => setExpandedAnalysisId(
                    expandedAnalysisId === analysis.id ? null : analysis.id
                  )}
                >
                  <span className="analysis-date">
                    {new Date(analysis.generated_at).toLocaleDateString()}
                  </span>
                  <span className="dropdown-arrow">
                    {expandedAnalysisId === analysis.id ? '▼' : '▶'}
                  </span>
                </div>

                {expandedAnalysisId === analysis.id && (
                  <div className="analysis-details">
                    <p>{analysis.summary_text}</p>
                    {analysis.patterns_json.length > 0 && (
                      <div className="patterns-grid">
                        {analysis.patterns_json.map((p, idx) => (
                          <div key={idx} className="pattern-card-small">
                            <h5>{p.title}</h5>
                            <p>{p.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!analyzing && !analysisResult && pastAnalyses.length === 0 && !loadingAnalyses && (
        <p className="empty-message">No analyses yet. Click "Analyze" to get started!</p>
      )}
    </div>
  )
}
