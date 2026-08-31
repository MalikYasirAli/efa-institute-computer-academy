import React from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard(){
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (session && mounted) setUserEmail(session.user.email ?? null)
      if (mounted) setLoading(false)
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUserEmail(session.user.email ?? null)
      else setUserEmail(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    // no navigation here; ProtectedRoute will handle redirect
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-2 text-gray-600">Signed in as: <span className="font-medium">{userEmail}</span></div>
      <div className="mt-4">
        <button onClick={handleSignOut} className="px-4 py-2 bg-rose-600 text-white rounded-md">Sign out</button>
      </div>
      <div className="mt-4 text-sm text-gray-500">This admin area contains UI scaffolds only. No destructive actions are enabled yet.</div>
    </div>
  )
}
