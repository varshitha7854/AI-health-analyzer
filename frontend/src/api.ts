/**
 * API Client for Health & Mood Notebook
 * 
 * All API requests are made through this file.
 * The BASE_URL is configured to point to the backend server (default: localhost:8000).
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Type definitions
export interface User {
  id: number
  username: string
}

export interface DailyEntry {
  id: number
  user_id: number
  date: string
  mood: number
  symptoms_text: string | null
  notes_text: string | null
  created_at: string
}

export interface Pattern {
  title: string
  description: string
}

export interface AnalysisSummary {
  id: number
  user_id: number
  summary_text: string
  patterns_json: Pattern[]
  generated_at: string
}

export interface Stats {
  total_entries: number
  average_mood: number
  entries_per_day: Array<{ date: string; count: number }>
}

/**
 * Login or create a user by username
 */
export async function loginUser(username: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
  if (!response.ok) throw new Error('Login failed')
  return response.json()
}

/**
 * Create a new daily entry
 */
export async function createEntry(
  userId: number,
  date: string,
  mood: number,
  symptomsText: string = '',
  notesText: string = ''
): Promise<DailyEntry> {
  const response = await fetch(`${BASE_URL}/entries?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date,
      mood,
      symptoms_text: symptomsText || null,
      notes_text: notesText || null,
    }),
  })
  if (!response.ok) throw new Error('Failed to create entry')
  return response.json()
}

/**
 * Get entries for a user
 */
export async function getEntries(
  userId: number,
  limit: number = 30
): Promise<DailyEntry[]> {
  const response = await fetch(
    `${BASE_URL}/entries?user_id=${userId}&limit=${limit}`
  )
  if (!response.ok) throw new Error('Failed to get entries')
  return response.json()
}

/**
 * Get statistics for a user
 */
export async function getStats(userId: number): Promise<Stats> {
  const response = await fetch(`${BASE_URL}/stats/summary?user_id=${userId}`)
  if (!response.ok) throw new Error('Failed to get stats')
  return response.json()
}

/**
 * Analyze user entries with AI
 */
export async function analyzeEntries(
  userId: number,
  days: number = 30
): Promise<{ summary_text: string; patterns: Pattern[] }> {
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, days }),
  })
  if (!response.ok) throw new Error('Failed to analyze entries')
  return response.json()
}

/**
 * Get past analyses for a user
 */
export async function getAnalyses(userId: number): Promise<AnalysisSummary[]> {
  const response = await fetch(`${BASE_URL}/analyses?user_id=${userId}`)
  if (!response.ok) throw new Error('Failed to get analyses')
  return response.json()
}
