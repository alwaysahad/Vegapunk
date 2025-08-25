import { useEffect, useState } from 'react'
import { ContentCard } from '../components/ContentCard'
import type { ContentItem } from '../lib/api'
import { useParams } from 'react-router-dom'

type PublicContent = {
  username: string
  content: ContentItem[]
}

export function PublicView() {
  const { shareLink } = useParams()
  const [data, setData] = useState<PublicContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!shareLink) return
    setLoading(true)
    fetch(`/api/v1/brain/${shareLink}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Not found')
        return (res.json() as Promise<PublicContent>)
      })
      .then(setData)
      .catch(() => setError('Invalid or expired link'))
      .finally(() => setLoading(false))
  }, [shareLink])

  if (!shareLink) return (
    <div className="mx-auto max-w-3xl space-y-4 p-6 text-gray-700">
      Provide a share link in URL, e.g. <code className="rounded bg-gray-100 px-1">/public/&lt;hash&gt;</code>
    </div>
  )

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : data ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{data.username}'s shared brain</h1>
          {data.content.length === 0 ? (
            <div className="text-gray-600">No shared content yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.content.map((item) => (
                <ContentCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}


