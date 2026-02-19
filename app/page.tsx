import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginButton from '@/components/LoginButton'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md flex flex-col items-center gap-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800">🔖 Smart Bookmarks</h1>
        <p className="text-gray-500 text-center">Save and organize your favorite links. Sign in to get started.</p>
        <LoginButton />
      </div>
    </main>
  )
}