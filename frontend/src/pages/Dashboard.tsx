import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { apiFetch, type ContentItem } from '../lib/api'
import { ContentCard } from '../components/ContentCard'

export function Dashboard() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [shareHash, setShareHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [contentRes, shareRes] = await Promise.all([
          apiFetch('/api/v1/content'),
          apiFetch('/api/v1/brain/share'),
        ])
        const contentData = (await contentRes.json()) as { content: ContentItem[] }
        const shareData = (await shareRes.json()) as { hash: string | null }
        if (!mounted) return
        setItems(contentData.content)
        setShareHash(shareData.hash)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const total = items.length
  const byType = useMemo(() => items.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1
    return acc
  }, {}), [items])
  const recent = items.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-white/80">Curate links, videos, tweets and share your brain.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/content"><Button variant="secondary">Add Content</Button></Link>
            <Link to="/share"><Button>Share</Button></Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="text-sm text-gray-600">Total items</div>
            <div className="text-2xl font-semibold">{loading ? '—' : total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-gray-600">By type</div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {loading ? '—' : (
                Object.keys(byType).length === 0 ? 'None yet' : (
                  Object.entries(byType).map(([k, v]) => (
                    <div key={k} className="text-gray-800"><span className="font-medium">{k}</span>: {v}</div>
                  ))
                )
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-gray-600">Sharing</div>
            <div className="text-2xl font-semibold">{loading ? '—' : (shareHash ? 'Enabled' : 'Disabled')}</div>
            <div className="mt-1 text-sm text-gray-600 truncate">{shareHash ? `${window.location.origin}/public/${shareHash}` : 'Not shared'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent</h2>
          <Link to="/content" className="text-sm text-purple-700 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : recent.length === 0 ? (
          <div className="text-gray-600">No items yet. Start by adding your first link.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((item) => (
              <ContentCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


