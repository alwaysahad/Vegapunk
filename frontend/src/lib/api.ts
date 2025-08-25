export function apiFetch(input: string, init: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('authorization', token)
  return fetch(input, { ...init, headers })
}

export type ContentItem = {
  _id: string
  link: string
  type: 'image' | 'video' | 'article' | 'audio'
  tags: string[]
  userId: { _id: string; username: string } | string
}


