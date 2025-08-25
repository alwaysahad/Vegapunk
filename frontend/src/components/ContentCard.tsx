import type { ContentItem } from '../lib/api'
import { useEffect, useState } from 'react'

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1) || null
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      if (u.pathname.startsWith('/watch')) return u.searchParams.get('v')
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null
    }
  } catch {}
  return null
}

function isTwitterLink(url: string): boolean {
  try {
    const u = new URL(url)
    return u.hostname.includes('twitter.com') || u.hostname.includes('x.com')
  } catch {
    return false
  }
}

export function ContentCard({ item }: { item: ContentItem }) {
  const { link, type } = item
  const ytId = extractYouTubeId(link)
  const isTweet = isTwitterLink(link)
  const [preview, setPreview] = useState<{ image: string | null; title: string | null } | null>(null)

  useEffect(() => {
    let active = true
    if (isTweet) {
      const controller = new AbortController()
      fetch(`/api/v1/preview?url=${encodeURIComponent(link)}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (active) setPreview(data)
        })
        .catch(() => {})
      return () => {
        active = false
        controller.abort()
      }
    }
  }, [isTweet, link])

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm transition-shadow hover:shadow-lg">
      {/* Preview */}
      {type === 'video' && ytId ? (
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute left-0 top-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${ytId}`}
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : type === 'video' && /\.(mp4|webm|ogg)(\?|$)/i.test(link) ? (
        <video src={link} controls className="h-64 w-full object-contain" />
      ) : type === 'article' && isTweet ? (
        preview?.image ? (
          <div className="relative">
            <img src={preview.image} className="h-64 w-full object-cover" alt={preview.title || 'tweet'} />
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-[#15202b] text-white">
            <div className="flex items-center gap-3 text-lg">
              <svg viewBox="0 0 24 24" aria-hidden="true" width="28" height="28" className="fill-white"><g><path d="M23.643 4.937c-.835.371-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.573 0-4.66 2.086-4.66 4.66 0 .365.042.72.12 1.062-3.873-.194-7.306-2.05-9.604-4.868-.402.69-.632 1.49-.632 2.343 0 1.616.823 3.043 2.073 3.878-.764-.024-1.483-.234-2.11-.583v.06c0 2.258 1.606 4.142 3.737 4.57-.392.107-.805.165-1.232.165-.301 0-.593-.028-.879-.082.593 1.85 2.313 3.197 4.352 3.234-1.595 1.25-3.604 1.996-5.786 1.996-.376 0-.747-.022-1.112-.065 2.062 1.323 4.513 2.096 7.145 2.096 8.573 0 13.264-7.1 13.264-13.264 0-.202-.004-.404-.013-.605.911-.657 1.7-1.48 2.323-2.415z"/></g></svg>
              <span>Twitter</span>
            </div>
          </div>
        )
      ) : type === 'image' ? (
        <img src={link} className="h-64 w-full object-cover" alt="content" />
      ) : type === 'audio' ? (
        <div className="p-4"><audio src={link} controls className="w-full" /></div>
      ) : (
        <div className="p-4 text-sm text-gray-600">No preview available</div>
      )}

      {/* Meta */}
      <div className="border-t border-gray-200 p-3 text-sm">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="truncate font-medium text-purple-700 hover:underline"
        >
          {link}
        </a>
        <div className="text-gray-500">{type}</div>
      </div>
    </div>
  )
}


