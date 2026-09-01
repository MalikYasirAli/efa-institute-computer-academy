import React from 'react'
import { fetchStudentAttendance, createAttendanceAdmin, updateAttendanceAdmin } from '@/lib/attendance'

export default function StudentAttendanceSection({ studentId } : { studentId: string }){
  const [records, setRecords] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchStudentAttendance(studentId)
      setRecords(data)
    } catch (err:any) {
      console.error(err)
      setError('Failed to load attendance')
    } finally { setLoading(false) }
  }

  React.useEffect(() => { if (studentId) load() }, [studentId])

  async function mark(status: string, date?: string) {
    try {
      const attendanceDate = date ?? new Date().toISOString().slice(0,10)
      await createAttendanceAdmin({ studentId, attendanceDate, status })
      load()
    } catch (err:any) { console.error(err); alert('Failed to mark attendance') }
  }

  async function edit(attId: string) {
    const newStatus = prompt('New status (Present/Absent/Leave):')
    if (!newStatus) return
    try {
      await updateAttendanceAdmin(attId, { status: newStatus })
      load()
    } catch (err:any) { console.error(err); alert('Update failed') }
  }

  return (
    <div className="bg-white p-4 rounded">
      <h3 className="font-semibold">Attendance</h3>
      <div className="mt-2">
        <div className="mb-2">
          <button onClick={() => mark('Present')} className="px-3 py-1 mr-2 bg-efa-lime-500 rounded text-sm">Mark Present (Today)</button>
          <button onClick={() => mark('Absent')} className="px-3 py-1 mr-2 bg-rose-600 rounded text-sm">Mark Absent (Today)</button>
          <button onClick={() => mark('Leave')} className="px-3 py-1 bg-efa-indigo-500 rounded text-sm">Mark Leave (Today)</button>
        </div>

        {loading ? <div>Loading...</div> : (
          <div>
            {records.length === 0 ? <div className="text-sm text-gray-500">No attendance records found</div> : (
              <div className="space-y-2">
                {records.map(r => (
                  <div key={r.id} className="border p-2 rounded flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{new Date(r.attendance_date).toLocaleDateString()} • {r.status}</div>
                      <div className="text-sm text-gray-600">Notes: {r.notes ?? '—'}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => edit(r.id)} className="px-2 py-1 bg-efa-indigo-500 rounded text-sm">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
