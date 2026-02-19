import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookmarkManager from '@/components/BookmarkManager'
import LogoutButton from '@/components/LogoutButton'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">🔖 Smart Bookmarks</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BookmarkManager initialBookmarks={bookmarks || []} userId={user.id} />
      </div>
    </main>
  )
}