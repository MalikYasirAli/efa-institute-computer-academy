import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signInWithEmail } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'

export default function AdminLogin(){
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await signInWithEmail(email.trim(), password)
      if (res.error) {
        setError(res.error.message)
        setLoading(false)
        return
      }
      const session = res.data?.session
      if (!session) {
        setError('Unable to sign in')
        setLoading(false)
        return
      }
      // Verify profile role
      const userId = session.user.id
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_uid', userId)
        .maybeSingle()
      if (pErr || !profile) {
        setError('User is not authorized as admin. Ensure your account is configured.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      if ((profile as any).role !== 'admin') {
        setError('User does not have admin privileges.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      const redirect = searchParams.get('redirect') ?? '/admin'
      navigate(redirect)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200" type="email" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200" type="password" required />
        </div>
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-efa-indigo-500 text-white rounded-md">{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
        {error && <div className="text-sm text-rose-600">{error}</div>}
      </form>

      <div className="mt-4 text-xs text-gray-500">Admin accounts are managed by the academy. If you need access, contact the owner.</div>
    </div>
  )
}
