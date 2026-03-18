const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000'

export async function createUser(username) {
  const response = await fetch(`${API_BASE}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to create user')
  }

  return await response.json()
}

export async function getUser(username) {
  const response = await fetch(`${API_BASE}/users/${username}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to get user')
  }

  return await response.json()
}

export async function createEntry(username, entry) {
  const response = await fetch(`${API_BASE}/entries/?username=${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to create entry')
  }

  return await response.json()
}

export async function getEntries(username, { skip = 0, limit = 20 } = {}) {
  const response = await fetch(
    `${API_BASE}/entries/${username}?skip=${skip}&limit=${limit}`
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to get entries')
  }

  return await response.json()
}

export async function getStats(username) {
  const response = await fetch(`${API_BASE}/stats/${username}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to get stats')
  }

  return await response.json()
}
