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

  async function approveAndCreate(appId: string) {
    try {
      const { data, error } = await supabase.rpc('approve_application_and_create_student', { p_application_id: appId })
      if (error) {
        throw error
      }
      alert('Application approved and student created: ' + (data?.[0]?.student_id ?? ''))
      fetchApplications()
    } catch (err:any) {
      console.error(err)
      alert('Failed to approve application. Ensure RPC/migrations are applied and you are an admin.')
    }
  }

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
        <div className="mt-4 flex gap-4">
          <a href="/admin" className="text-efa-indigo-500">Dashboard</a>
          <a href="/admin/applications" className="text-efa-indigo-500">Applications</a>
          <a href="/admin/students" className="text-efa-indigo-500">Students</a>
          <a href="/admin/courses" className="text-efa-indigo-500">Courses</a>
          <a href="/admin/certificates" className="text-efa-indigo-500">Certificates</a>
+          <a href="/admin/payments" className="text-efa-indigo-500">Fees</a>
          <a href="/admin/fees" className="text-efa-indigo-500">Fees</a>
          <a href="/admin/settings" className="text-efa-indigo-500">Settings</a>
        </div>
      </div>
@@
   )
 }
