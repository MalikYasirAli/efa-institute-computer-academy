import React from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard(){
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [applications, setApplications] = React.useState<any[]>([])
  const [query, setQuery] = React.useState('')

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

  async function fetchApplications() {
    // minimal safe select - rely on RLS to restrict to admins
    const { data, error } = await supabase
      .from('applications')
      .select('application_id, full_name, course_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      console.error(error)
      return
    }
    setApplications(data ?? [])
  }

  React.useEffect(() => { fetchApplications() }, [])

  async function updateStatus(applicationId: string, status: string) {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('application_id', applicationId)
    if (error) {
      console.error(error)
      alert('Failed to update status')
      return
    }
    fetchApplications()
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="mt-2 text-gray-600">Signed in as: <span className="font-medium">{userEmail}</span></div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Applications</h2>
        <div className="mt-4">
          <input placeholder="Search application id" value={query} onChange={e => setQuery(e.target.value)} className="border p-2 rounded w-full" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Application ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Course</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Submitted</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.filter(a => !query || a.application_id.includes(query)).map(app => (
                  <tr key={app.application_id} className="border-t">
                    <td className="py-2">{app.application_id}</td>
                    <td className="py-2">{app.full_name}</td>
                    <td className="py-2">{app.course_id}</td>
                    <td className="py-2">{app.status}</td>
                    <td className="py-2">{new Date(app.created_at).toLocaleString()}</td>
                    <td className="py-2">
                      <button onClick={() => updateStatus(app.application_id, 'Approved')} className="px-2 py-1 bg-efa-lime-500 rounded text-sm mr-2">Approve</button>
                      <button onClick={() => updateStatus(app.application_id, 'Rejected')} className="px-2 py-1 bg-rose-600 rounded text-sm mr-2">Reject</button>
                      <button onClick={() => updateStatus(app.application_id, 'Completed')} className="px-2 py-1 bg-efa-indigo-500 rounded text-sm">Mark Completed</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
