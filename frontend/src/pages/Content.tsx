import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { apiFetch, type ContentItem } from '../lib/api'
import { toast } from 'sonner'
import { ContentCard } from '../components/ContentCard'

const CONTENT_TYPES = ['auto', 'image', 'video', 'article', 'audio'] as const

function inferTypeFromLink(url: string): 'image' | 'video' | 'article' | 'audio' {
  const u = url.toLowerCase()
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    if (host.includes('youtube.com') || host.includes('youtu.be') || host.includes('youtube-nocookie.com')) {
      return 'video'
    }
    if (host.includes('twitter.com') || host.includes('x.com')) {
      return 'article'
    }
  } catch {}
  if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp)(\?|$)/i.test(u)) return 'image'
  if (/(\.mp3|\.wav|\.ogg|\.m4a)(\?|$)/i.test(u)) return 'audio'
  if (/(\.mp4|\.webm|\.mov|\.mkv)(\?|$)/i.test(u)) return 'video'
  return 'article'
}

export function Content() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const [type, setType] = useState<(typeof CONTENT_TYPES)[number]>('auto')
  const [submitting, setSubmitting] = useState(false)

  const isValidType = useMemo(() => CONTENT_TYPES.includes(type), [type])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/v1/content')
      const data = (await res.json()) as { content: ContentItem[] }
      setItems(data.content)
    } catch (e) {
      setError('Failed to load content')
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidType) return
    setSubmitting(true)
    try {
      const effectiveType = type === 'auto' ? inferTypeFromLink(link) : type
      const res = await apiFetch('/api/v1/content', {
        method: 'POST',
        body: JSON.stringify({ link: link.trim(), type: effectiveType }),
      })
      if (!res.ok) {
        const msg = (await res.json().catch(() => null) as any)?.msg || 'Add failed'
        throw new Error(msg)
      }
      setLink('')
      setType('auto')
      await load()
      toast.success('Content added')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add content'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function onDelete(contentId: string) {
    try {
      const res = await apiFetch('/api/v1/content', {
        method: 'DELETE',
        body: JSON.stringify({ contentId }),
      })
      if (!res.ok) throw new Error('Delete failed')
      await load()
      toast.success('Deleted')
    } catch (e) {
      setError('Failed to delete')
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Content</h1>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Add Content</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="auto">Auto (recommended)</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
            </select>
            <Button type="submit" disabled={!isValidType || submitting}>
              {submitting ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">Your Items</div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">No content yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item._id} className="relative">
                <ContentCard item={item} />
                <div className="absolute right-2 top-2">
                  <Button variant="secondary" size="sm" onClick={() => onDelete(item._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


