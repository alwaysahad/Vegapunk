import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { apiFetch } from '../lib/api'
import { toast } from 'sonner'

export function Share() {
  const [hash, setHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const baseUrl = `${window.location.origin}/public/`

  async function enableShare() {
    setLoading(true)
    try {
      const res = await apiFetch('/api/v1/brain/share', {
        method: 'POST',
        body: JSON.stringify({ share: true }),
      })
      if (res.ok) {
        const data = (await res.json()) as { hash: string }
        setHash(data.hash)
        toast.success('Sharing enabled')
      }
    } finally {
      setLoading(false)
    }
  }

  async function disableShare() {
    setLoading(true)
    try {
      await apiFetch('/api/v1/brain/share', {
        method: 'POST',
        body: JSON.stringify({ share: false }),
      })
      setHash(null)
      toast.success('Sharing disabled')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch existing share state on mount only (do not auto-enable)
    apiFetch('/api/v1/brain/share')
      .then(async (res) => (res.ok ? ((await res.json()) as { hash: string | null }) : { hash: null }))
      .then((data) => setHash(data.hash))
      .catch(() => setHash(null))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Share</h1>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Sharable Link</h2>
        </CardHeader>
        <CardContent>
          {hash ? (
            <div className="space-y-3">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
                {baseUrl}
                <span className="font-mono font-semibold">{hash}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(baseUrl + hash)}
                >
                  Copy Link
                </Button>
                <Button onClick={disableShare} disabled={loading}>
                  Disable
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={enableShare} disabled={loading}>
              {loading ? 'Enabling...' : 'Enable Sharing'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


