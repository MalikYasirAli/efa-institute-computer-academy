import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data.session
        if (!session) {
          if (mounted) {
            setAuthed(false)
            setLoading(false)
          }
          return
        }
        const userId = session.user.id
        // Attempt to read role from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('auth_uid', userId)
          .maybeSingle()
        if (error) {
          // If RLS prevents reading, treat as unauthenticated for admin
          if (mounted) {
            setAuthed(false)
            setLoading(false)
          }
          return
        }
        const role = (profile as any)?.role
        if (mounted) {
          setAuthed(role === 'admin')
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setAuthed(false)
          setLoading(false)
        }
      }
    }

    check()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthed(false)
      } else {
        // re-run check when auth state changes
        check()
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (!authed) return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  return <>{children}</>
}

export default ProtectedRoute
