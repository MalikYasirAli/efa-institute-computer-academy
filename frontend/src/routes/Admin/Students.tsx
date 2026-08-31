import React from 'react'
import { fetchStudents, approveApplication } from '@/lib/students'
import { Link } from 'react-router-dom'

export default function AdminStudents(){
  const [students, setStudents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const [courseFilter, setCourseFilter] = React.useState<string | null>(null)
  const [feeFilter, setFeeFilter] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchStudents({ status: statusFilter, courseId: courseFilter, feeStatus: feeFilter })
      setStudents(data)
    } catch (err) {
      console.error(err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [statusFilter, courseFilter, feeFilter])

  function filtered() {
    if (!query) return students
    const q = query.toLowerCase()
    return students.filter(s => s.student_id?.toLowerCase().includes(q) || s.registration_number?.toLowerCase().includes(q) || s.full_name?.toLowerCase().includes(q) || s.application_id?.toLowerCase().includes(q))
  }

  async function handleApprove(appId: string) {
    if (!confirm('Approve this application and create student record?')) return
    try {
      await approveApplication(appId)
      load()
      alert('Application approved and student created.')
    } catch (err:any) {
      console.error(err)
      alert('Failed to approve application. Ensure you are an admin and RLS/RPC are configured.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded">
        <div className="flex items-center gap-4">
          <input placeholder="Search by Student ID, Reg#, Name, App ID" value={query} onChange={e => setQuery(e.target.value)} className="border p-2 rounded flex-1" />
          <select value={statusFilter ?? ''} onChange={e => setStatusFilter(e.target.value || null)} className="border p-2 rounded">
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={feeFilter ?? ''} onChange={e => setFeeFilter(e.target.value || null)} className="border p-2 rounded">
            <option value="">All fees</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Overdue">Overdue</option>
          </select>
          <button onClick={load} className="px-3 py-2 bg-efa-indigo-500 text-white rounded">Refresh</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded">
        {loading ? <div>Loading...</div> : (
          <div className="space-y-2">
            {filtered().length === 0 ? <div className="text-sm text-gray-500">No students found</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2">Student ID</th>
                      <th className="py-2">Reg#</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Course</th>
                      <th className="py-2">Admission</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Fee</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered().map(s => (
                      <tr key={s.student_id} className="border-t">
                        <td className="py-2">{s.student_id}</td>
                        <td className="py-2">{s.registration_number}</td>
                        <td className="py-2">{s.full_name}</td>
                        <td className="py-2">{s.course_id}</td>
                        <td className="py-2">{s.admission_date ? new Date(s.admission_date).toLocaleDateString() : ''}</td>
                        <td className="py-2">{s.status}</td>
                        <td className="py-2">{s.fee_status}</td>
                        <td className="py-2">
                          <Link to={`/admin/students/${s.student_id}`} className="text-efa-indigo-500 mr-2">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
