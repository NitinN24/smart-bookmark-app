'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

export default function BookmarkManager({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[]
  userId: string
}) {
  const [supabase] = useState(() => createClient())
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Polling every 2 seconds for cross-tab sync
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setBookmarks(data)
    }, 2000)

    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        (payload) => {
          console.log('Realtime event:', payload)
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => {
              const exists = prev.find((b) => b.id === payload.new.id)
              if (exists) return prev
              return [payload.new as Bookmark, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => console.log('Realtime:', status))

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl
    }

    if (!title.trim() || !formattedUrl) {
      setError('Please fill in both fields.')
      return
    }

    setLoading(true)
    const { data, error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        title: title.trim(),
        url: formattedUrl,
        user_id: userId,
      })
      .select()
      .single()

    if (insertError) {
      setError('Failed to add bookmark: ' + insertError.message)
    } else {
      setBookmarks((prev) => [data, ...prev])
      setTitle('')
      setUrl('')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Delete failed: ' + error.message)
    } else {
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Bookmark</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title (e.g. OpenAI)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="URL (e.g. https://openai.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Bookmark'}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {bookmarks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔖</p>
            <p>No bookmarks yet. Add your first one above!</p>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`}
                  alt=""
                  className="w-6 h-6 rounded flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className="min-w-0">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-800 hover:text-blue-600 truncate block transition-colors"
                  >
                    {bookmark.title}
                  </a>
                  <p className="text-xs text-gray-400 truncate">{bookmark.url}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 text-lg"
                title="Delete bookmark"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}